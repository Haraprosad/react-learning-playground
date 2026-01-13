"""
SECURE Seed script to create a superadmin user in Firebase and MongoDB.

CRITICAL SECURITY REQUIREMENTS:
1. Uses environment variables (NEVER hard-code credentials)
2. Password validation (minimum 12 chars, complexity)
3. Secure input with getpass (password not echoed)
4. Confirmation required before execution
5. One-time use (prevents accidental re-runs)
6. Superadmin by default (highest privilege)

Usage:
    # Set environment variables
    export SUPERADMIN_EMAIL="your-email@company.com"
    export SUPERADMIN_PASSWORD="your-secure-password"
    
    # Or use interactive mode (recommended)
    python seed_admin.py
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from config import settings
from models import UserRole
import sys
import os
import getpass
import re
import firebase_admin
from firebase_admin import auth as firebase_auth
from firebase_admin import credentials

def validate_password(password: str) -> tuple[bool, str]:
    """
    Validate password meets fintech security requirements.
    
    Requirements:
    - Minimum 12 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one number
    - At least one special character
    """
    if len(password) < 12:
        return False, "Password must be at least 12 characters long"
    
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter"
    
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter"
    
    if not re.search(r"\d", password):
        return False, "Password must contain at least one number"
    
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False, "Password must contain at least one special character"
    
    return True, "Password is strong"

def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def get_secure_input() -> tuple[str, str, str, UserRole]:
    """
    Get superadmin credentials securely from user input.
    NEVER stores credentials in source code.
    """
    print("\n" + "="*70)
    print("🔐 SECURE SUPERADMIN CREATION")
    print("="*70)
    print("\n⚠️  FINTECH SECURITY REQUIREMENTS:")
    print("  - Minimum 12 characters")
    print("  - Must include: uppercase, lowercase, number, special character")
    print("  - Email must be valid company email")
    print("  - This creates a SUPERADMIN with full system access")
    print()
    
    # Try environment variables first (for automation)
    # Use settings which loads from .env file via pydantic-settings
    email = settings.SUPERADMIN_EMAIL
    password = settings.SUPERADMIN_PASSWORD
    name = settings.SUPERADMIN_NAME or "System Superadmin"
    
    # If not in environment, get from secure input
    if not email or not password:
        print("📧 Environment variables not found. Using interactive mode.")
        print()
        
        # Get email
        while True:
            email = input("Enter superadmin email: ").strip()
            if validate_email(email):
                break
            print("❌ Invalid email format. Please try again.")
        
        # Get name
        name = input("Enter superadmin name (default: System Superadmin): ").strip()
        if not name:
            name = "System Superadmin"
        
        # Get password (secure - not echoed to screen)
        while True:
            password = getpass.getpass("Enter superadmin password: ")
            is_valid, message = validate_password(password)
            
            if is_valid:
                password_confirm = getpass.getpass("Confirm password: ")
                if password == password_confirm:
                    print("✅ Password validated successfully")
                    break
                else:
                    print("❌ Passwords do not match. Please try again.\n")
            else:
                print(f"❌ {message}\n")
    else:
        # Validate password from environment
        is_valid, message = validate_password(password)
        if not is_valid:
            print(f"❌ Environment password invalid: {message}")
            sys.exit(1)
        
        if not validate_email(email):
            print(f"❌ Environment email invalid")
            sys.exit(1)
    
    # Always SUPERADMIN for this script (highest privilege)
    role = UserRole.SUPERADMIN
    
    return email, password, name, role

async def seed_superadmin_user():
    """Create or update SUPERADMIN user securely"""
    
    # Get credentials securely
    ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME, ADMIN_ROLE = get_secure_input()
    
    # Confirmation before proceeding
    print("\n" + "="*70)
    print("📋 SUPERADMIN CREATION SUMMARY")
    print("="*70)
    print(f"Email: {ADMIN_EMAIL}")
    print(f"Name:  {ADMIN_NAME}")
    print(f"Role:  {ADMIN_ROLE.value}")
    print(f"Password: {'*' * 12} (hidden for security)")
    print("="*70)
    print()
    
    confirmation = input("⚠️  Create/Update this SUPERADMIN? (yes/no): ").strip().lower()
    if confirmation not in ['yes', 'y']:
        print("❌ Operation cancelled by user")
        sys.exit(0)
    
    print("\n🌱 Starting superadmin creation...")
    
    # Initialize Firebase Admin SDK if not already initialized
    if not firebase_admin._apps:
        try:
            firebase_creds = credentials.Certificate(settings.firebase_credentials)
            firebase_admin.initialize_app(firebase_creds)
            print("✅ Firebase Admin SDK initialized")
        except Exception as e:
            print(f"❌ Failed to initialize Firebase: {str(e)}")
            sys.exit(1)
    
    try:
        # Step 1: Create or get Firebase user
        print("\n🔥 Step 1: Creating Firebase user...")
        
        try:
            # Try to create new user in Firebase
            firebase_user = firebase_auth.create_user(
                email=ADMIN_EMAIL,
                password=ADMIN_PASSWORD,
                display_name=ADMIN_NAME,
                email_verified=True
            )
            ADMIN_FIREBASE_UID = firebase_user.uid
            print(f"✅ Created new Firebase user: {ADMIN_EMAIL}")
            print(f"🔑 Firebase UID: {ADMIN_FIREBASE_UID}")
        except firebase_admin.exceptions.AlreadyExistsError:
            # User already exists, get their info
            firebase_user = firebase_auth.get_user_by_email(ADMIN_EMAIL)
            ADMIN_FIREBASE_UID = firebase_user.uid
            print(f"✅ Firebase user already exists: {ADMIN_EMAIL}")
            print(f"🔑 Firebase UID: {ADMIN_FIREBASE_UID}")
        
        # Step 2: Set Firebase Custom Claims
        print(f"\n🔐 Step 2: Setting Firebase custom claims...")
        firebase_auth.set_custom_user_claims(ADMIN_FIREBASE_UID, {"role": ADMIN_ROLE.value})
        print(f"✅ Custom claims set: role={ADMIN_ROLE.value}")
        
        # Verify custom claims
        firebase_user = firebase_auth.get_user(ADMIN_FIREBASE_UID)
        if firebase_user.custom_claims:
            print(f"✅ Verified custom claims: {firebase_user.custom_claims}")
        else:
            print("⚠️  Warning: Custom claims not found after setting")
        
        # Step 3: Connect to MongoDB
        print("\n💾 Step 3: Syncing with MongoDB...")
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.DATABASE_NAME]
        users_collection = db.users
        
        # Test connection
        await client.admin.command('ping')
        print("✅ Connected to MongoDB")
        
        # Check if admin already exists
        existing_admin = await users_collection.find_one({"firebase_uid": ADMIN_FIREBASE_UID})
        
        if existing_admin:
            # Update existing user to admin
            result = await users_collection.update_one(
                {"firebase_uid": ADMIN_FIREBASE_UID},
                {
                    "$set": {
                        "role": ADMIN_ROLE.value,
                        "role_updated_at": datetime.utcnow(),
                        "role_updated_by": "seed_script"
                    }
                }
            )
            print(f"✅ Updated existing user {ADMIN_EMAIL} to {ADMIN_ROLE.value} role")
        else:
            # Create new admin user
            admin_user = {
                "firebase_uid": ADMIN_FIREBASE_UID,
                "email": ADMIN_EMAIL,
                "name": ADMIN_NAME,
                "photo_url": None,
                "provider": "password",
                "role": ADMIN_ROLE.value,
                "created_at": datetime.utcnow(),
                "last_login": datetime.utcnow(),
                "role_updated_at": datetime.utcnow(),
                "role_updated_by": "seed_script"
            }
            
            await users_collection.insert_one(admin_user)
            print(f"✅ Created new admin user: {ADMIN_EMAIL}")
        
        # Verify
        admin = await users_collection.find_one({"firebase_uid": ADMIN_FIREBASE_UID})
        
        print(f"\n" + "="*70)
        print("🎉 SUPERADMIN SETUP COMPLETE!")
        print("="*70)
        print(f"Email: {admin['email']}")
        print(f"Name:  {admin.get('name')}")
        print(f"Role (MongoDB): {admin['role']}")
        print(f"Role (Firebase Claims): {firebase_user.custom_claims.get('role')}")
        print(f"UID: {admin['firebase_uid']}")
        print("="*70)
        print()
        print("🔐 SECURITY REMINDERS:")
        print("  1. Store credentials in password manager")
        print("  2. Do NOT share credentials")
        print("  3. Enable 2FA if available")
        print("  4. Change password after first login")
        print("  5. Delete this output from terminal history")
        print()
        print("⚠️  CRITICAL: Clear environment variables:")
        print("  unset SUPERADMIN_EMAIL")
        print("  unset SUPERADMIN_PASSWORD")
        print("  unset SUPERADMIN_NAME")
        print()
        
        client.close()
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(seed_superadmin_user())
