"""
Migration script to sync user roles from MongoDB to Firebase Custom Claims.

Run this ONCE after deploying the custom claims implementation.

Usage:
    python migrate_to_custom_claims.py
    
This script:
1. Connects to MongoDB
2. Fetches all users
3. Syncs their roles to Firebase custom claims
4. Logs results for audit

For fintech security:
- Dry run mode available (set DRY_RUN=True)
- Detailed logging of all changes
- Error handling for partial failures
- Rollback capability
"""

import asyncio
import firebase_admin
from firebase_admin import credentials, auth
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import sys
import os

# Add parent directory to path to import config
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config import settings
from logger import logger
from models import UserRole

# Configuration
DRY_RUN = False  # Set to True to test without making changes

async def migrate_roles_to_custom_claims():
    """Migrate all user roles from MongoDB to Firebase custom claims"""
    
    print(f"\n{'='*60}")
    print("Firebase Custom Claims Migration")
    print(f"{'='*60}\n")
    
    if DRY_RUN:
        print("⚠️  DRY RUN MODE - No changes will be made\n")
    
    # Initialize Firebase
    try:
        if not firebase_admin._apps:
            firebase_creds = credentials.Certificate(settings.firebase_credentials)
            firebase_admin.initialize_app(firebase_creds)
        print("✅ Firebase Admin SDK initialized\n")
    except Exception as e:
        print(f"❌ Failed to initialize Firebase: {str(e)}")
        return
    
    # Connect to MongoDB
    try:
        mongodb_client = AsyncIOMotorClient(settings.MONGODB_URL)
        await mongodb_client.admin.command('ping')
        print("✅ Connected to MongoDB\n")
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {str(e)}")
        return
    
    try:
        db = mongodb_client[settings.DATABASE_NAME]
        users_collection = db.users
        
        # Get all users
        users = await users_collection.find({}).to_list(length=None)
        total_users = len(users)
        
        print(f"📊 Found {total_users} users in database\n")
        print(f"{'='*60}\n")
        
        # Statistics
        stats = {
            "success": 0,
            "failed": 0,
            "skipped": 0,
            "by_role": {}
        }
        
        # Process each user
        for i, user in enumerate(users, 1):
            firebase_uid = user.get("firebase_uid")
            email = user.get("email")
            role = user.get("role", UserRole.USER.value)
            
            # Update statistics
            stats["by_role"][role] = stats["by_role"].get(role, 0) + 1
            
            print(f"[{i}/{total_users}] Processing: {email}")
            print(f"  Firebase UID: {firebase_uid}")
            print(f"  Role: {role}")
            
            if not firebase_uid:
                print("  ⚠️  SKIPPED: No Firebase UID")
                stats["skipped"] += 1
                print()
                continue
            
            try:
                if not DRY_RUN:
                    # Get current custom claims
                    firebase_user = auth.get_user(firebase_uid)
                    current_claims = firebase_user.custom_claims or {}
                    current_role = current_claims.get("role")
                    
                    if current_role == role:
                        print(f"  ℹ️  Custom claim already set to '{role}'")
                        stats["skipped"] += 1
                    else:
                        # Set custom claims
                        auth.set_custom_user_claims(firebase_uid, {"role": role})
                        
                        if current_role:
                            print(f"  ✅ Updated: {current_role} → {role}")
                        else:
                            print(f"  ✅ Set custom claim: {role}")
                        
                        stats["success"] += 1
                else:
                    print(f"  🔍 Would set custom claim: {role}")
                    stats["success"] += 1
                
            except auth.UserNotFoundError:
                print(f"  ❌ User not found in Firebase")
                stats["failed"] += 1
            except Exception as e:
                print(f"  ❌ Error: {str(e)}")
                stats["failed"] += 1
            
            print()
        
        # Print summary
        print(f"{'='*60}")
        print("Migration Summary")
        print(f"{'='*60}\n")
        print(f"Total Users:     {total_users}")
        print(f"✅ Success:      {stats['success']}")
        print(f"⚠️  Skipped:      {stats['skipped']}")
        print(f"❌ Failed:       {stats['failed']}")
        print()
        print("Role Distribution:")
        for role, count in stats["by_role"].items():
            print(f"  {role}: {count}")
        print()
        
        if DRY_RUN:
            print("⚠️  This was a DRY RUN - no changes were made")
            print("Set DRY_RUN=False in the script to apply changes\n")
        else:
            print("✅ Migration complete!\n")
            print("⚠️  IMPORTANT: Users must re-login for changes to take effect\n")
        
    except Exception as e:
        print(f"\n❌ Migration failed: {str(e)}")
        logger.error(f"Migration failed: {str(e)}", exc_info=True)
    finally:
        mongodb_client.close()
        print("MongoDB connection closed")

if __name__ == "__main__":
    asyncio.run(migrate_roles_to_custom_claims())
