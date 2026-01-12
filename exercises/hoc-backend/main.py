from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from contextlib import asynccontextmanager
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from models import User, UserResponse, UserRole
from auth import (
    verify_firebase_token,
    get_current_user,
    require_admin,
    set_db_client,
    send_password_reset_email,
    verify_password_reset_code,
    confirm_password_reset,
    update_user_role
)
from config import settings
from logger import logger
from middleware import (
    RequestIDMiddleware,
    LoggingMiddleware,
    SecurityHeadersMiddleware
)

# Initialize Sentry for error tracking
if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        integrations=[FastApiIntegration()],
        environment=settings.SENTRY_ENVIRONMENT or settings.ENVIRONMENT,
        traces_sample_rate=settings.SENTRY_TRACES_SAMPLE_RATE,
    )
    logger.info("Sentry error tracking initialized")

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

# MongoDB client
mongodb_client: Optional[AsyncIOMotorClient] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for startup and shutdown"""
    global mongodb_client
    
    # Startup
    try:
        logger.info("Initializing MongoDB connection...")
        
        mongodb_client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            minPoolSize=settings.MONGODB_MIN_POOL_SIZE,
            maxPoolSize=settings.MONGODB_MAX_POOL_SIZE,
            connectTimeoutMS=settings.MONGODB_CONNECT_TIMEOUT_MS,
            serverSelectionTimeoutMS=settings.MONGODB_SERVER_SELECTION_TIMEOUT_MS,
        )
        
        # Test connection
        await mongodb_client.admin.command('ping')
        logger.info("✅ Connected to MongoDB successfully")
        
        set_db_client(mongodb_client)
        
        # Create indexes
        db = mongodb_client[settings.DATABASE_NAME]
        
        # Drop old unique firebase_uid index if it exists (migration from old schema)
        try:
            existing_indexes = await db.users.index_information()
            if "firebase_uid_1" in existing_indexes:
                # Check if it's a unique index
                if existing_indexes["firebase_uid_1"].get("unique", False):
                    logger.info("Dropping old unique firebase_uid index...")
                    await db.users.drop_index("firebase_uid_1")
        except Exception as e:
            logger.warning(f"Could not check/drop old index: {e}")
        
        # Email is the primary unique identifier for account merging
        await db.users.create_index("email", unique=True)
        # Firebase UID is indexed but not unique (can change when switching providers)
        await db.users.create_index("firebase_uid")
        logger.info("✅ Database indexes created")
        
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {str(e)}", exc_info=True)
        raise
    
    yield
    
    # Shutdown
    if mongodb_client:
        mongodb_client.close()
        logger.info("❌ MongoDB connection closed")

# Initialize FastAPI app
app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    docs_url="/docs" if settings.DEBUG else None,  # Disable docs in production
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)

# Add rate limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Add custom middleware (order matters!)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(LoggingMiddleware)
app.add_middleware(RequestIDMiddleware)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID"],
)

# Request/Response Models
class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetVerify(BaseModel):
    code: str

class PasswordResetConfirm(BaseModel):
    code: str
    new_password: str

class UpdateRoleRequest(BaseModel):
    firebase_uid: str
    role: UserRole

# Health Check
@app.get("/health")
async def health_check():
    """
    Comprehensive health check endpoint.
    Returns status of all critical services.
    """
    health_status = {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "version": settings.API_VERSION,
        "timestamp": datetime.utcnow().isoformat(),
    }
    
    # Check MongoDB connection
    try:
        if mongodb_client:
            await mongodb_client.admin.command('ping')
            health_status["database"] = "connected"
        else:
            health_status["database"] = "not_initialized"
            health_status["status"] = "degraded"
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        health_status["database"] = "disconnected"
        health_status["status"] = "unhealthy"
    
    status_code = status.HTTP_200_OK if health_status["status"] == "healthy" else status.HTTP_503_SERVICE_UNAVAILABLE
    
    return JSONResponse(content=health_status, status_code=status_code)

@app.get("/")
async def root():
    """Root endpoint - basic info"""
    return {
        "message": f"{settings.API_TITLE} is running",
        "version": settings.API_VERSION,
        "environment": settings.ENVIRONMENT,
        "docs": "/docs" if settings.DEBUG else "disabled",
    }

# Authentication Endpoints
@app.post("/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit(f"{settings.RATE_LIMIT_PER_MINUTE}/minute")
async def register_user(request: Request, user_data: User):
    """
    Register a new user after Firebase authentication.
    Called from frontend after successful Firebase signup.
    Handles account merging when same email is used with different providers.
    """
    try:
        logger.info(f"Registration attempt for user: {user_data.email} with provider: {user_data.provider}")
        
        db = mongodb_client[settings.DATABASE_NAME]
        users_collection = db.users
        
        # Check if user exists by email (primary identifier)
        existing_user_by_email = await users_collection.find_one({"email": user_data.email})
        
        if existing_user_by_email:
            # User exists with same email but possibly different provider
            existing_firebase_uid = existing_user_by_email.get("firebase_uid")
            
            if existing_firebase_uid == user_data.firebase_uid:
                # Same Firebase UID - user already registered
                logger.warning(f"User already registered: {user_data.email}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User already registered"
                )
            else:
                # Different Firebase UID - user signed in with different provider
                # Update to use the new provider's UID and merge account info
                logger.info(f"Merging account for {user_data.email}: {existing_user_by_email.get('provider')} -> {user_data.provider}")
                
                update_data = {
                    "firebase_uid": user_data.firebase_uid,
                    "provider": user_data.provider,
                    "last_login": datetime.utcnow()
                }
                
                # Update name and photo if provided and not already set
                if user_data.name and not existing_user_by_email.get("name"):
                    update_data["name"] = user_data.name
                if user_data.photo_url and not existing_user_by_email.get("photo_url"):
                    update_data["photo_url"] = user_data.photo_url
                
                await users_collection.update_one(
                    {"email": user_data.email},
                    {"$set": update_data}
                )
                
                # Return updated user
                updated_user = await users_collection.find_one({"email": user_data.email})
                
                logger.info(f"Account merged successfully for: {user_data.email}")
                
                return UserResponse(
                    uid=updated_user["firebase_uid"],
                    email=updated_user["email"],
                    name=updated_user.get("name"),
                    photo_url=updated_user.get("photo_url"),
                    role=updated_user["role"]
                )
        
        # New user - insert into database
        user_dict = user_data.model_dump()
        user_dict["created_at"] = datetime.utcnow()
        user_dict["last_login"] = datetime.utcnow()
        
        await users_collection.insert_one(user_dict)
        
        logger.info(f"New user registered successfully: {user_data.email}")
        
        return UserResponse(
            uid=user_data.firebase_uid,
            email=user_data.email,
            name=user_data.name,
            photo_url=user_data.photo_url,
            role=user_data.role.value
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration failed for {user_data.email}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@app.get("/auth/me", response_model=UserResponse)
@limiter.limit(f"{settings.RATE_LIMIT_PER_MINUTE}/minute")
async def get_current_user_info(request: Request, current_user: dict = Depends(get_current_user)):
    """
    Get current authenticated user information.
    Requires valid Firebase token in Authorization header.
    """
    try:
        db = mongodb_client[settings.DATABASE_NAME]
        users_collection = db.users
        
        user = await users_collection.find_one({"firebase_uid": current_user["uid"]})
        
        if not user:
            # User not in DB yet, return from Firebase token
            return UserResponse(
                uid=current_user["uid"],
                email=current_user.get("email"),
                name=current_user.get("name"),
                photo_url=current_user.get("picture"),
                role=current_user.get("role", UserRole.USER.value)
            )
        
        return UserResponse(
            uid=user["firebase_uid"],
            email=user["email"],
            name=user.get("name"),
            photo_url=user.get("photo_url"),
            role=user.get("role", UserRole.USER.value)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user: {str(e)}"
        )

# Password Reset Endpoints
@app.post("/auth/password-reset/request")
@limiter.limit(f"{settings.PASSWORD_RESET_RATE_LIMIT}/hour")
async def request_password_reset(request: Request, reset_request: PasswordResetRequest):
    """
    Request password reset email.
    Sends an email with a link to frontend reset page.
    
    Frontend reset page URL: http://localhost:5173/reset-password
    """
    return await send_password_reset_email(reset_request.email)

@app.post("/auth/password-reset/verify")
@limiter.limit(f"{settings.RATE_LIMIT_PER_MINUTE}/minute")
async def verify_reset_code(request: Request, verify_request: PasswordResetVerify):
    """
    Verify password reset code validity.
    Call this when user lands on reset page to validate the code.
    """
    return await verify_password_reset_code(verify_request.code)

@app.post("/auth/password-reset/confirm")
@limiter.limit(f"{settings.RATE_LIMIT_PER_MINUTE}/minute")
async def reset_password(request: Request, confirm_request: PasswordResetConfirm):
    """
    Confirm password reset with new password.
    Call this when user submits new password form.
    """
    return await confirm_password_reset(confirm_request.code, confirm_request.new_password)

# User Management Endpoints (Admin only)
@app.get("/admin/users")
@limiter.limit(f"{settings.RATE_LIMIT_PER_MINUTE}/minute")
async def get_all_users(
    request: Request,
    skip: int = 0,
    limit: int = 100,
    current_user: dict = Depends(require_admin)
):
    """
    Get all users (Admin only).
    Supports pagination with skip and limit parameters.
    """
    try:
        logger.info(f"Admin {current_user.get('email')} fetching users list")
        
        db = mongodb_client[settings.DATABASE_NAME]
        users_collection = db.users
        
        users = await users_collection.find().skip(skip).limit(limit).to_list(length=limit)
        
        return {
            "total": await users_collection.count_documents({}),
            "skip": skip,
            "limit": limit,
            "users": [
                UserResponse(
                    uid=user["firebase_uid"],
                    email=user["email"],
                    name=user.get("name"),
                    photo_url=user.get("photo_url"),
                    role=user.get("role", UserRole.USER.value)
                )
                for user in users
            ]
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch users: {str(e)}"
        )

@app.put("/admin/users/role")
async def change_user_role(
    request: UpdateRoleRequest,
    current_user: dict = Depends(require_admin)
):
    """
    Update user role (Admin only).
    Admins can change any user's role.
    """
    return await update_user_role(request.firebase_uid, request.role)

@app.delete("/admin/users/{firebase_uid}")
async def delete_user(
    firebase_uid: str,
    current_user: dict = Depends(require_admin)
):
    """
    Delete user (Admin only).
    Removes user from both Firebase and MongoDB.
    """
    try:
        # Delete from MongoDB
        db = mongodb_client[DATABASE_NAME]
        users_collection = db.users
        
        result = await users_collection.delete_one({"firebase_uid": firebase_uid})
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found in database"
            )
        
        # Delete from Firebase
        from firebase_admin import auth
        try:
            auth.delete_user(firebase_uid)
        except Exception as firebase_error:
            print(f"Warning: Failed to delete from Firebase: {firebase_error}")
        
        return {
            "success": True,
            "message": "User deleted successfully",
            "firebase_uid": firebase_uid
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete user: {str(e)}"
        )

# Protected Routes Examples
@app.get("/user/dashboard")
async def user_dashboard(current_user: dict = Depends(get_current_user)):
    """
    User dashboard - Accessible by any authenticated user.
    """
    return {
        "message": f"Welcome to your dashboard, {current_user.get('name', 'User')}!",
        "user": {
            "uid": current_user["uid"],
            "email": current_user.get("email"),
            "role": current_user.get("role")
        }
    }

@app.get("/admin/dashboard")
async def admin_dashboard(current_user: dict = Depends(require_admin)):
    """
    Admin dashboard - Accessible by admin users only.
    """
    return {
        "message": "Welcome to admin dashboard!",
        "admin": {
            "uid": current_user["uid"],
            "email": current_user.get("email"),
            "role": current_user.get("role")
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
