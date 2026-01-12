"""
Seed script to create an admin user in Firebase and MongoDB.
This script creates the user in Firebase Authentication with email/password,
then syncs to MongoDB with admin role.

Usage:
    python seed_admin.py
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from config import settings
from models import UserRole
import sys
import firebase_admin
from firebase_admin import auth as firebase_auth

async def seed_admin_user():
    """Create or update admin user in Firebase and MongoDB"""
    
    # Admin user details - UPDATE THESE!
    ADMIN_EMAIL = "admin@example.com"
    ADMIN_PASSWORD = "Admin@123456"  # Change this to a secure password
    ADMIN_NAME = "Admin User"
    
    print("🌱 Starting admin user seeding...")
    print(f"📧 Admin Email: {ADMIN_EMAIL}")
    
    # Initialize Firebase Admin SDK if not already initialized
    if not firebase_admin._apps:
        from auth import initialize_firebase
        initialize_firebase()
    
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
        
        # Step 2: Connect to MongoDB
        print("\n💾 Step 2: Syncing with MongoDB...")
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
                {"$set": {"role": UserRole.ADMIN.value}}
            )
            print(f"✅ Updated existing user {ADMIN_EMAIL} to ADMIN role")
        else:
            # Create new admin user
            admin_user = {
                "firebase_uid": ADMIN_FIREBASE_UID,
                "email": ADMIN_EMAIL,
                "name": ADMIN_NAME,
                "photo_url": None,
                "provider": "google",
                "role": UserRole.ADMIN.value,
                "created_at": datetime.utcnow(),
                "last_login": datetime.utcnow()
            }
            
            await users_collection.insert_one(admin_user)
            print(f"✅ Created new admin user: {ADMIN_EMAIL}")
        
        # Verify
        admin = await users_collection.find_one({"firebase_uid": ADMIN_FIREBASE_UID})
        print(f"\n🎉 Admin user setup complete!")
        print(f"   Email: {admin['email']}")
        print(f"   Password: {ADMIN_PASSWORD}")
        print(f"   Role: {admin['role']}")
        print(f"   UID: {admin['firebase_uid']}")
        print(f"\n✨ You can now login with:")
        print(f"   Email: {ADMIN_EMAIL}")
        print(f"   Password: {ADMIN_PASSWORD}")
        
        client.close()
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(seed_admin_user())
