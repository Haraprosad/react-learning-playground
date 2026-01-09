"""
Database seeding script - Creates initial data for development
Run: python seed_data.py
"""
from datetime import datetime, timedelta
import random

from app.core.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.category import Category
from app.models.transaction import Transaction
from app.core.security import get_password_hash


def seed_database():
    """Seed the database with initial data"""
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        print("🌱 Seeding database...")
        
        # Check if already seeded
        if db.query(User).first():
            print("⚠️  Database already contains data. Skipping seed.")
            return
        
        # Create Admin User
        admin_user = User(
            name="Admin User",
            email="admin@example.com",
            hashed_password=get_password_hash("admin123"),
            role="admin",
            status="active"
        )
        db.add(admin_user)
        
        # Create Regular User
        regular_user = User(
            name="John Doe",
            email="user@example.com",
            hashed_password=get_password_hash("user123"),
            role="user",
            status="active"
        )
        db.add(regular_user)
        
        # Create another user
        user2 = User(
            name="Jane Smith",
            email="jane@example.com",
            hashed_password=get_password_hash("jane123"),
            role="user",
            status="active"
        )
        db.add(user2)
        
        db.commit()
        print("✅ Users created")
        
        # Create Categories
        categories_data = [
            # Expense categories
            {"name": "Food & Dining", "color": "#FF6B6B", "icon": "🍔", "type": "expense"},
            {"name": "Transportation", "color": "#4ECDC4", "icon": "🚗", "type": "expense"},
            {"name": "Shopping", "color": "#95E1D3", "icon": "🛍️", "type": "expense"},
            {"name": "Entertainment", "color": "#F38181", "icon": "🎬", "type": "expense"},
            {"name": "Bills & Utilities", "color": "#AA96DA", "icon": "⚡", "type": "expense"},
            {"name": "Healthcare", "color": "#FCBAD3", "icon": "🏥", "type": "expense"},
            {"name": "Education", "color": "#A8D8EA", "icon": "📚", "type": "expense"},
            {"name": "Travel", "color": "#FECA57", "icon": "✈️", "type": "expense"},
            {"name": "Housing", "color": "#48C9B0", "icon": "🏠", "type": "expense"},
            {"name": "Other Expenses", "color": "#A8A8A8", "icon": "💸", "type": "expense"},
            # Income categories
            {"name": "Salary", "color": "#26de81", "icon": "💰", "type": "income"},
            {"name": "Freelance", "color": "#20bf6b", "icon": "💼", "type": "income"},
            {"name": "Investments", "color": "#45b7d1", "icon": "📈", "type": "income"},
            {"name": "Other Income", "color": "#4b6584", "icon": "💵", "type": "income"},
        ]
        
        categories = []
        for cat_data in categories_data:
            category = Category(**cat_data)
            db.add(category)
            categories.append(category)
        
        db.commit()
        db.refresh(categories[0])  # Refresh to get IDs
        print("✅ Categories created")
        
        # Get all categories with IDs
        expense_categories = [c for c in categories if c.type == "expense"]
        income_categories = [c for c in categories if c.type == "income"]
        
        # Create Sample Transactions (last 6 months)
        users = [regular_user, user2]
        transactions = []
        
        for i in range(100):  # 100 transactions
            user = random.choice(users)
            
            # 70% expenses, 30% income
            if random.random() < 0.7:
                trans_type = "expense"
                category = random.choice(expense_categories)
                amount = round(random.uniform(10, 500), 2)
            else:
                trans_type = "income"
                category = random.choice(income_categories)
                amount = round(random.uniform(500, 5000), 2)
            
            # Random date in last 6 months
            days_ago = random.randint(0, 180)
            trans_date = datetime.utcnow() - timedelta(days=days_ago)
            
            descriptions = {
                "expense": [
                    "Grocery shopping",
                    "Gas station",
                    "Restaurant dinner",
                    "Monthly subscription",
                    "Utility bill",
                    "Online purchase",
                    "Medical checkup",
                    "Movie tickets",
                    "Coffee shop",
                    "Gym membership"
                ],
                "income": [
                    "Monthly salary",
                    "Freelance project",
                    "Dividend payment",
                    "Bonus",
                    "Side hustle",
                    "Consulting fee"
                ]
            }
            
            transaction = Transaction(
                user_id=user.id,
                category_id=category.id,
                type=trans_type,
                amount=amount,
                description=random.choice(descriptions[trans_type]),
                date=trans_date
            )
            db.add(transaction)
            transactions.append(transaction)
        
        db.commit()
        print("✅ Transactions created")
        
        print("\n" + "="*50)
        print("🎉 Database seeded successfully!")
        print("="*50)
        print("\n📋 Default Credentials:")
        print("\nAdmin Account:")
        print("  Email: admin@example.com")
        print("  Password: admin123")
        print("\nRegular User:")
        print("  Email: user@example.com")
        print("  Password: user123")
        print("\nAnother User:")
        print("  Email: jane@example.com")
        print("  Password: jane123")
        print("\n" + "="*50)
        print(f"\n📊 Summary:")
        print(f"  Users: 3")
        print(f"  Categories: {len(categories)}")
        print(f"  Transactions: {len(transactions)}")
        print("="*50 + "\n")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
