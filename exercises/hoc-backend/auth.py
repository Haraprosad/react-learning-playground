import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from models import UserRole
from typing import Optional
import os
from datetime import datetime
from logger import logger
from config import settings

# Initialize Firebase Admin SDK
try:
    firebase_creds = credentials.Certificate(settings.firebase_credentials)
    firebase_admin.initialize_app(firebase_creds)
    logger.info("Firebase Admin SDK initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize Firebase Admin SDK: {str(e)}", exc_info=True)
    raise

security = HTTPBearer()

# MongoDB connection (will be injected from main.py)
db_client: Optional[AsyncIOMotorClient] = None

def set_db_client(client: AsyncIOMotorClient):
    """Set MongoDB client for auth module"""
    global db_client
    db_client = client
    logger.info("Database client set in auth module")

async def verify_firebase_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Verify Firebase ID token and return user data with role from MongoDB.
    This is the main authentication dependency for protected routes.
    """
    token = credentials.credentials
    try:
        # Verify token with Firebase
        decoded_token = auth.verify_id_token(token)
        
        logger.info(
            "Firebase token verified",
            extra={"uid": decoded_token.get("uid"), "email": decoded_token.get("email")}
        )
        
        # Fetch user from MongoDB to get role
        if db_client:
            users_collection = db_client[settings.DATABASE_NAME].users
            user = await users_collection.find_one({"firebase_uid": decoded_token["uid"]})
            
            if user:
                # User exists in DB - attach role
                decoded_token["role"] = user.get("role", UserRole.USER.value)
                decoded_token["db_user_id"] = str(user.get("_id"))
                
                # Update last login
                await users_collection.update_one(
                    {"firebase_uid": decoded_token["uid"]},
                    {"$set": {"last_login": datetime.utcnow()}}
                )
                
                logger.info(
                    "User fetched from database",
                    extra={
                        "uid": decoded_token["uid"],
                        "role": decoded_token["role"],
                        "email": decoded_token.get("email")
                    }
                )
            else:
                # New user - will have default role
                decoded_token["role"] = UserRole.USER.value
                decoded_token["db_user_id"] = None
                
                logger.warning(
                    "User not found in database, using default role",
                    extra={"uid": decoded_token["uid"], "email": decoded_token.get("email")}
                )
        else:
            # No DB connection - default role
            decoded_token["role"] = UserRole.USER.value
            logger.warning("No database connection, using default role")
        
        return decoded_token
        
    except auth.InvalidIdTokenError:
        logger.warning("Invalid Firebase token provided")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )
    except auth.ExpiredIdTokenError:
        logger.warning("Expired Firebase token provided")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Please login again."
        )
    except Exception as e:
        logger.error(f"Authentication failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}"
        )

async def get_current_user(current_user: dict = Depends(verify_firebase_token)):
    """
    Get current authenticated user.
    Use this dependency for routes that need authentication but no specific role.
    """
    return current_user

async def require_admin(current_user: dict = Depends(verify_firebase_token)):
    """
    Dependency to ensure user has admin role.
    Use this for admin-only routes.
    
    Usage:
        @app.get("/admin/users", dependencies=[Depends(require_admin)])
        or
        async def admin_route(current_user: dict = Depends(require_admin)):
    """
    if current_user.get("role") != UserRole.ADMIN.value:
        logger.warning(
            "Unauthorized admin access attempt",
            extra={
                "uid": current_user.get("uid"),
                "role": current_user.get("role"),
                "email": current_user.get("email")
            }
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required. You do not have permission to access this resource."
        )
    return current_user

def require_role(required_role: UserRole):
    """
    Factory function to create a role-checking dependency.
    
    Usage:
        @app.get("/manager/dashboard", dependencies=[Depends(require_role(UserRole.MANAGER))])
    """
    async def role_checker(current_user: dict = Depends(verify_firebase_token)):
        user_role = current_user.get("role", UserRole.USER.value)
        
        # Admin has access to everything
        if user_role == UserRole.ADMIN.value:
            return current_user
        
        # Check if user has required role
        if user_role != required_role.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role: {required_role.value}"
            )
        return current_user
    
    return role_checker

def get_firebase_user(uid: str):
    """
    Get Firebase user details by UID.
    Useful for admin operations.
    """
    try:
        return auth.get_user(uid)
    except auth.UserNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with UID {uid} not found"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error fetching user: {str(e)}"
        )

async def send_password_reset_email(email: str, redirect_url: Optional[str] = None):
    """
    Send password reset email via Firebase with custom redirect URL.
    The email will contain a link that redirects to your frontend reset page.
    
    Args:
        email: User's email address
        redirect_url: Frontend URL to redirect after clicking email link
                     Defaults to FRONTEND_URL/reset-password
    
    Returns:
        Success message
    """
    try:
        # Set default redirect URL if not provided
        if not redirect_url:
            redirect_url = f"{settings.FRONTEND_URL}/reset-password"
        
        logger.info(f"Password reset requested for email: {email}")
        
        # Configure action code settings for custom redirect
        action_code_settings = auth.ActionCodeSettings(
            url=redirect_url,
            handle_code_in_app=True,  # Handle the reset in your app
        )
        
        # Generate password reset link
        link = auth.generate_password_reset_link(
            email,
            action_code_settings=action_code_settings
        )
        
        logger.info(f"Password reset email sent successfully to: {email}")
        
        # In production, send this via your email service (SendGrid, AWS SES, etc.)
        # For now, Firebase handles the email sending
        
        return {
            "success": True,
            "message": "Password reset email sent successfully. Please check your inbox.",
            "email": email
        }
        
    except auth.UserNotFoundError:
        # For security, don't reveal if email exists or not
        # Return success anyway to prevent email enumeration
        logger.warning(f"Password reset requested for non-existent email: {email}")
        return {
            "success": True,
            "message": "If an account exists with this email, a password reset link has been sent.",
            "email": email
        }
    except Exception as e:
        logger.error(f"Password reset failed for {email}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to send password reset email: {str(e)}"
        )

async def verify_password_reset_code(code: str):
    """
    Verify that a password reset code is valid.
    Call this before showing the reset password form.
    
    Args:
        code: The reset code from the email link (oobCode parameter)
    
    Returns:
        Email address associated with the code
    """
    try:
        email = auth.verify_password_reset_code(code)
        return {
            "success": True,
            "email": email,
            "message": "Reset code is valid"
        }
    except auth.InvalidActionCodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset code. Please request a new password reset."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to verify reset code: {str(e)}"
        )

async def confirm_password_reset(code: str, new_password: str):
    """
    Confirm password reset with new password.
    Call this when user submits the new password form.
    
    Args:
        code: The reset code from the email link
        new_password: The new password to set
    
    Returns:
        Success message with email
    """
    try:
        # Verify code and get email
        email = auth.verify_password_reset_code(code)
        
        # Confirm password reset
        auth.confirm_password_reset(code, new_password)
        
        return {
            "success": True,
            "message": "Password successfully reset. You can now login with your new password.",
            "email": email
        }
        
    except auth.InvalidActionCodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset code. Please request a new password reset."
        )
    except auth.WeakPasswordError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is too weak. Please use a stronger password (at least 6 characters)."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Password reset failed: {str(e)}"
        )

async def update_user_role(firebase_uid: str, new_role: UserRole):
    """
    Update user's role in MongoDB.
    Only callable by admin users.
    
    Args:
        firebase_uid: Firebase UID of the user
        new_role: New role to assign
    """
    if not db_client:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database connection not available"
        )
    
    users_collection = db_client.hoc_db.users
    
    result = await users_collection.update_one(
        {"firebase_uid": firebase_uid},
        {"$set": {"role": new_role.value}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with UID {firebase_uid} not found in database"
        )
    
    return {
        "success": True,
        "message": f"User role updated to {new_role.value}",
        "firebase_uid": firebase_uid
    }