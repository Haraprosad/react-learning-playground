"""
Script to fix duplicate accounts in MongoDB.
Merges users with the same email but different firebase_uid.

Usage:
    python fix_duplicate_accounts.py
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from config import settings
from collections import defaultdict

async def fix_duplicate_accounts():
    """Merge duplicate accounts with same email"""
    
    print("🔧 Starting duplicate account fix...")
    
    try:
        # Connect to MongoDB
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.DATABASE_NAME]
        users_collection = db.users
        
        # Test connection
        await client.admin.command('ping')
        print("✅ Connected to MongoDB")
        
        # Find all users
        users = await users_collection.find({}).to_list(length=None)
        print(f"📊 Found {len(users)} total users")
        
        # Group by email
        email_groups = defaultdict(list)
        for user in users:
            email_groups[user['email']].append(user)
        
        # Find duplicates
        duplicates = {email: users for email, users in email_groups.items() if len(users) > 1}
        
        if not duplicates:
            print("✅ No duplicate accounts found!")
            client.close()
            return
        
        print(f"\n⚠️  Found {len(duplicates)} emails with duplicate accounts:")
        
        # Process each duplicate
        for email, duplicate_users in duplicates.items():
            print(f"\n📧 Email: {email}")
            print(f"   {len(duplicate_users)} accounts found:")
            
            for i, user in enumerate(duplicate_users, 1):
                print(f"   {i}. Provider: {user.get('provider', 'unknown')}, UID: {user['firebase_uid'][:20]}...")
            
            # Keep the most recent one (by last_login)
            duplicate_users.sort(key=lambda x: x.get('last_login', x.get('created_at')), reverse=True)
            keep_user = duplicate_users[0]
            delete_users = duplicate_users[1:]
            
            print(f"   ✅ Keeping: {keep_user.get('provider', 'unknown')} account (most recent)")
            print(f"   🗑️  Deleting {len(delete_users)} older account(s)")
            
            # Delete old accounts
            for user in delete_users:
                await users_collection.delete_one({"_id": user["_id"]})
                print(f"      Deleted: {user.get('provider', 'unknown')} - {user['firebase_uid'][:20]}...")
        
        print(f"\n✅ Fixed {len(duplicates)} duplicate account(s)!")
        print("\n⚠️  Note: Users will need to sign in with their most recent provider")
        print("   (Email/Password or Google - whichever they used last)")
        
        client.close()
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(fix_duplicate_accounts())
