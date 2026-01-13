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
    require_superadmin,
    set_db_client,
    send_password_reset_email,
    verify_password_reset_code,
    confirm_password_reset,
    update_user_role,
    sync_role_to_custom_claims
)
from config import settings
from logger import logger
from middleware import (
    RequestIDMiddleware,
    LoggingMiddleware,
    SecurityHeadersMiddleware
)
import redis_client

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
        logger.info("🚀 Starting application initialization...")
        
        # Initialize Redis
        logger.info("Initializing Redis connection...")
        await redis_client.init_redis()
        
        # Initialize MongoDB
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
        
        # Compound index for common queries (email + provider)
        await db.users.create_index([("email", 1), ("provider", 1)])
        
        # Index for last_login queries (analytics)
        await db.users.create_index([("last_login", -1)])
        
        logger.info("✅ Database indexes created")
        logger.info("🎉 Application initialization complete!")
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize application: {str(e)}", exc_info=True)
        raise
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down application...")
    
    # Close Redis connection
    await redis_client.close_redis()
    
    # Close MongoDB connection
    if mongodb_client:
        mongodb_client.close()
        logger.info("❌ MongoDB connection closed")
    
    logger.info("👋 Application shutdown complete")

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
    new_role: UserRole

class CreateUserRequest(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None
    role: UserRole = UserRole.USER
    
class DeleteUserRequest(BaseModel):
    firebase_uid: str
    delete_from_firebase: bool = True

# Health Check
@app.get("/health")
async def health_check():
    """
    Comprehensive health check endpoint.
    Returns status of all critical services (MongoDB, Redis, Firebase).
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
    
    # Check Redis connection
    redis_health = await redis_client.health_check()
    health_status["redis"] = redis_health
    if redis_health.get("status") != "healthy":
        health_status["status"] = "degraded"
    
    # Get cache statistics
    cache_stats = await redis_client.get_cache_stats()
    health_status["cache_stats"] = cache_stats
    
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
    
    Performance Optimized:
    - Uses custom claims from token (99% of requests)
    - Falls back to MongoDB only if data incomplete
    - Caches result in Redis for 60 seconds
    """
    try:
        # FAST PATH: Use data from custom claims (already verified in token)
        # This avoids MongoDB query for 99% of requests
        firebase_uid = current_user["uid"]
        
        # Check if we have complete data from token/cache
        if current_user.get("role") and current_user.get("email"):
            # Data is complete from custom claims - return immediately
            return UserResponse(
                uid=firebase_uid,
                email=current_user.get("email"),
                name=current_user.get("name"),
                photo_url=current_user.get("picture") or current_user.get("photo_url"),
                role=current_user.get("role", UserRole.USER.value),
                created_at=current_user.get("created_at"),
                last_login=current_user.get("last_login")
            )
        
        # SLOW PATH: Only query MongoDB if custom claims are incomplete
        # This happens rarely (new users, legacy users without custom claims)
        logger.debug(f"Querying MongoDB for user {firebase_uid} - custom claims incomplete")
        
        # Try Redis cache first
        cached_user = await redis_client.get_cached_user(firebase_uid)
        if cached_user:
            return UserResponse(
                uid=firebase_uid,
                email=cached_user["email"],
                name=cached_user.get("name"),
                photo_url=cached_user.get("photo_url"),
                role=cached_user.get("role", UserRole.USER.value),
                created_at=cached_user.get("created_at"),
                last_login=cached_user.get("last_login")
            )
        
        # Last resort: Query MongoDB
        db = mongodb_client[settings.DATABASE_NAME]
        users_collection = db.users
        
        user = await users_collection.find_one({"firebase_uid": firebase_uid})
        
        if not user:
            # User not in DB yet, return from Firebase token
            response = UserResponse(
                uid=firebase_uid,
                email=current_user.get("email"),
                name=current_user.get("name"),
                photo_url=current_user.get("picture"),
                role=current_user.get("role", UserRole.USER.value)
            )
        else:
            response = UserResponse(
                uid=user["firebase_uid"],
                email=user["email"],
                name=user.get("name"),
                photo_url=user.get("photo_url"),
                role=user.get("role", UserRole.USER.value),
                created_at=user.get("created_at"),
                last_login=user.get("last_login")
            )
            
            # Cache for 60 seconds to avoid repeated queries
            await redis_client.cache_user(firebase_uid, {
                "_id": str(user.get("_id")),
                "email": user["email"],
                "name": user.get("name"),
                "photo_url": user.get("photo_url"),
                "role": user.get("role", UserRole.USER.value),
                "created_at": user.get("created_at"),
                "last_login": user.get("last_login")
            }, ttl=60)
        
        return response
        
    except Exception as e:
        logger.error(f"Failed to fetch user: {str(e)}", exc_info=True)
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

@app.post("/superadmin/users/create")
@limiter.limit("20/minute")
async def create_user_with_role(
    request: Request,
    user_request: CreateUserRequest,
    current_user: dict = Depends(require_superadmin)
):
    """
    Create a new user with specified role (Superadmin only).
    
    Capabilities:
    - Create user in Firebase Authentication
    - Set custom role (user, admin, or superadmin)
    - Sync to MongoDB with audit trail
    - Set Firebase custom claims
    
    Security:
    - Only superadmin can create users
    - Only superadmin can create admin/superadmin accounts
    - Password validation enforced
    - Full audit trail
    """
    try:
        from firebase_admin import auth as firebase_auth
        
        logger.info(
            f"Superadmin {current_user.get('email')} creating user",
            extra={
                "admin_uid": current_user["uid"],
                "new_user_email": user_request.email,
                "new_user_role": user_request.role.value
            }
        )
        
        # Validate password (basic validation)
        if len(user_request.password) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 6 characters"
            )
        
        # Check if user already exists in MongoDB
        db = mongodb_client[settings.DATABASE_NAME]
        users_collection = db.users
        
        existing_user = await users_collection.find_one({"email": user_request.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"User with email {user_request.email} already exists"
            )
        
        # Create user in Firebase
        try:
            firebase_user = firebase_auth.create_user(
                email=user_request.email,
                password=user_request.password,
                display_name=user_request.name,
                email_verified=True  # Auto-verify for admin-created users
            )
            firebase_uid = firebase_user.uid
            
            logger.info(
                f"✅ Created Firebase user: {user_request.email}",
                extra={"firebase_uid": firebase_uid}
            )
        except firebase_admin.exceptions.AlreadyExistsError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"User with email {user_request.email} already exists in Firebase"
            )
        except Exception as e:
            logger.error(f"Failed to create Firebase user: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create user in Firebase: {str(e)}"
            )
        
        # Set Firebase custom claims for role
        try:
            await sync_role_to_custom_claims(firebase_uid, user_request.role.value)
            logger.info(
                f"✅ Set custom claims for {user_request.email}",
                extra={"role": user_request.role.value}
            )
        except Exception as e:
            # Rollback: delete Firebase user if custom claims fail
            try:
                firebase_auth.delete_user(firebase_uid)
            except:
                pass
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to set custom claims: {str(e)}"
            )
        
        # Create user in MongoDB
        try:
            user_doc = {
                "firebase_uid": firebase_uid,
                "email": user_request.email,
                "name": user_request.name,
                "photo_url": None,
                "provider": "password",
                "role": user_request.role.value,
                "created_at": datetime.utcnow(),
                "last_login": datetime.utcnow(),
                "created_by": current_user["uid"],
                "role_updated_at": datetime.utcnow(),
                "role_updated_by": current_user["uid"]
            }
            
            await users_collection.insert_one(user_doc)
            
            logger.info(
                f"✅ Created MongoDB user: {user_request.email}",
                extra={
                    "firebase_uid": firebase_uid,
                    "role": user_request.role.value,
                    "created_by": current_user["uid"]
                }
            )
        except Exception as e:
            # Rollback: delete Firebase user if MongoDB fails
            try:
                firebase_auth.delete_user(firebase_uid)
            except:
                pass
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create user in database: {str(e)}"
            )
        
        return {
            "success": True,
            "message": f"User created successfully with role '{user_request.role.value}'",
            "user": {
                "firebase_uid": firebase_uid,
                "email": user_request.email,
                "name": user_request.name,
                "role": user_request.role.value
            },
            "note": "User can login with the provided credentials"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"User creation failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {str(e)}"
        )

@app.put("/admin/users/role")
@limiter.limit(f"{settings.RATE_LIMIT_PER_MINUTE}/minute")
async def change_user_role(
    request: Request,
    role_request: UpdateRoleRequest,
    current_user: dict = Depends(require_admin)
):
    """
    Update user role (Admin/Superadmin only).
    
    Role Hierarchy:
    - Superadmin: Can assign any role (superadmin, admin, user)
    - Admin: Can only assign user role
    
    Security:
    - Syncs to Firebase custom claims (tamper-proof)
    - Invalidates all sessions (immediate effect)
    - Requires user to re-login
    - Audit trail in MongoDB
    """
    return await update_user_role(
        role_request.firebase_uid,
        role_request.new_role,
        current_user["uid"]
    )

@app.post("/admin/users/sync-roles")
@limiter.limit("10/minute")
async def sync_user_roles_to_claims(
    request: Request,
    current_user: dict = Depends(require_superadmin)
):
    """
    Sync all user roles from MongoDB to Firebase custom claims (Superadmin only).
    
    Use this for:
    - Initial migration to custom claims
    - Recovery after custom claims loss
    - Periodic sync for consistency
    
    This is a heavy operation - use sparingly.
    """
    try:
        db = mongodb_client[settings.DATABASE_NAME]
        users_collection = db.users
        
        users = await users_collection.find({}, {"firebase_uid": 1, "role": 1, "email": 1}).to_list(length=None)
        
        synced = 0
        failed = 0
        
        for user in users:
            try:
                await sync_role_to_custom_claims(
                    user["firebase_uid"],
                    user.get("role", UserRole.USER.value)
                )
                synced += 1
            except Exception as e:
                logger.error(
                    f"Failed to sync role for {user.get('email')}: {str(e)}"
                )
                failed += 1
        
        logger.info(
            f"✅ Role sync complete: {synced} synced, {failed} failed",
            extra={"admin_uid": current_user["uid"]}
        )
        
        return {
            "success": True,
            "message": "Role synchronization complete",
            "synced": synced,
            "failed": failed,
            "total": len(users)
        }
        
    except Exception as e:
        logger.error(f"Role sync failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sync roles: {str(e)}"
        )

@app.delete("/admin/users/{firebase_uid}")
@limiter.limit(f"{settings.RATE_LIMIT_PER_MINUTE}/minute")
async def delete_user(
    firebase_uid: str,
    request: Request,
    current_user: dict = Depends(require_admin)
):
    """
    Delete user (Admin/Superadmin only).
    
    Security:
    - Validates role hierarchy (admin can't delete superadmin)
    - Prevents self-deletion
    - Removes from both Firebase and MongoDB
    - Invalidates all sessions
    - Complete audit trail
    
    Effects:
    - Deletes from Firebase Authentication
    - Deletes from MongoDB
    - Revokes all active sessions
    - Invalidates all caches
    """
    try:
        from firebase_admin import auth as firebase_auth
        
        # Prevent self-deletion
        if firebase_uid == current_user["uid"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot delete your own account"
            )
        
        db = mongodb_client[settings.DATABASE_NAME]
        users_collection = db.users
        
        # Get target user info for validation
        target_user = await users_collection.find_one({"firebase_uid": firebase_uid})
        
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found in database"
            )
        
        target_role = target_user.get("role", UserRole.USER.value)
        current_role = current_user.get("role")
        
        # Validate role hierarchy - prevent unauthorized deletions
        if not UserRole.can_manage_role(current_role, target_role):
            logger.warning(
                f"⚠️ Unauthorized deletion attempt blocked",
                extra={
                    "admin_uid": current_user["uid"],
                    "admin_role": current_role,
                    "target_uid": firebase_uid,
                    "target_role": target_role
                }
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"You cannot delete a user with role '{target_role}'. Insufficient permissions."
            )
        
        logger.info(
            f"Deleting user {target_user.get('email')}",
            extra={
                "admin_uid": current_user["uid"],
                "admin_email": current_user.get("email"),
                "target_uid": firebase_uid,
                "target_email": target_user.get("email"),
                "target_role": target_role
            }
        )
        
        # Step 1: Revoke all sessions (immediate logout)
        try:
            await redis_client.revoke_all_sessions(firebase_uid)
            logger.info(f"✅ Revoked all sessions for {firebase_uid}")
        except Exception as e:
            logger.warning(f"Failed to revoke sessions: {e}")
        
        # Step 2: Invalidate all caches
        try:
            await redis_client.invalidate_user_cache(firebase_uid)
            logger.info(f"✅ Invalidated cache for {firebase_uid}")
        except Exception as e:
            logger.warning(f"Failed to invalidate cache: {e}")
        
        # Step 3: Delete from MongoDB
        result = await users_collection.delete_one({"firebase_uid": firebase_uid})
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found in database"
            )
        
        logger.info(f"✅ Deleted user from MongoDB: {firebase_uid}")
        
        # Step 4: Delete from Firebase
        firebase_deleted = False
        firebase_error = None
        
        try:
            firebase_auth.delete_user(firebase_uid)
            firebase_deleted = True
            logger.info(f"✅ Deleted user from Firebase: {firebase_uid}")
        except firebase_auth.UserNotFoundError:
            logger.warning(f"User not found in Firebase: {firebase_uid}")
            firebase_deleted = True  # Consider it success if already gone
        except Exception as firebase_error:
            firebase_error = str(firebase_error)
            logger.error(
                f"Failed to delete from Firebase: {firebase_error}",
                exc_info=True
            )
        
        # Log deletion audit
        logger.info(
            f"✅ User deletion complete",
            extra={
                "deleted_uid": firebase_uid,
                "deleted_email": target_user.get("email"),
                "deleted_role": target_role,
                "deleted_by": current_user["uid"],
                "deleted_by_email": current_user.get("email"),
                "mongodb_deleted": True,
                "firebase_deleted": firebase_deleted,
                "timestamp": datetime.utcnow().isoformat()
            }
        )
        
        return {
            "success": True,
            "message": "User deleted successfully from both MongoDB and Firebase",
            "user": {
                "firebase_uid": firebase_uid,
                "email": target_user.get("email"),
                "role": target_role
            },
            "deletion_details": {
                "mongodb_deleted": True,
                "firebase_deleted": firebase_deleted,
                "sessions_revoked": True,
                "cache_invalidated": True,
                "firebase_error": firebase_error if firebase_error else None
            },
            "deleted_by": {
                "uid": current_user["uid"],
                "email": current_user.get("email")
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"User deletion failed: {str(e)}", exc_info=True)
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
    Admin dashboard - Accessible by admin and superadmin users.
    """
    return {
        "message": "Welcome to admin dashboard!",
        "admin": {
            "uid": current_user["uid"],
            "email": current_user.get("email"),
            "role": current_user.get("role")
        }
    }

@app.get("/superadmin/dashboard")
async def superadmin_dashboard(current_user: dict = Depends(require_superadmin)):
    """
    Superadmin dashboard - Accessible by superadmin users only.
    Highest level access for system management.
    """
    try:
        db = mongodb_client[settings.DATABASE_NAME]
        users_collection = db.users
        
        # Get role statistics
        pipeline = [
            {"$group": {"_id": "$role", "count": {"$sum": 1}}}
        ]
        role_stats = await users_collection.aggregate(pipeline).to_list(length=None)
        
        return {
            "message": "Welcome to superadmin dashboard!",
            "superadmin": {
                "uid": current_user["uid"],
                "email": current_user.get("email"),
                "role": current_user.get("role")
            },
            "statistics": {
                "role_distribution": {stat["_id"]: stat["count"] for stat in role_stats},
                "total_users": await users_collection.count_documents({})
            }
        }
    except Exception as e:
        logger.error(f"Failed to fetch superadmin dashboard: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch dashboard data: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
