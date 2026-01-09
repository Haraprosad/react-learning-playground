from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, timedelta
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.transaction import Transaction
from app.models.category import Category
from app.schemas.dashboard import (
    DashboardData,
    DashboardStats,
    CategoryBreakdown,
    MonthlyTrend,
    RecentTransaction
)

router = APIRouter()


@router.get("", response_model=DashboardData)
async def get_dashboard_data(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get comprehensive dashboard analytics"""
    
    # Set default date range (last 12 months)
    if not end_date:
        end_date = datetime.utcnow()
    if not start_date:
        start_date = end_date - timedelta(days=365)
    
    # Base query for transactions
    transaction_query = db.query(Transaction)
    if current_user.role != "admin":
        transaction_query = transaction_query.filter(Transaction.user_id == current_user.id)
    
    # Apply date filter
    transaction_query = transaction_query.filter(
        Transaction.date >= start_date,
        Transaction.date <= end_date
    )
    
    # Calculate stats
    total_users = db.query(User).count() if current_user.role == "admin" else 1
    active_users = db.query(User).filter(User.status == "active").count() if current_user.role == "admin" else 1
    total_transactions = transaction_query.count()
    
    # Income and expenses
    income_sum = transaction_query.filter(Transaction.type == "income").with_entities(
        func.coalesce(func.sum(Transaction.amount), 0)
    ).scalar()
    expense_sum = transaction_query.filter(Transaction.type == "expense").with_entities(
        func.coalesce(func.sum(Transaction.amount), 0)
    ).scalar()
    
    # Monthly income and expenses (current month)
    current_month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    monthly_query = transaction_query.filter(Transaction.date >= current_month_start)
    
    monthly_income = monthly_query.filter(Transaction.type == "income").with_entities(
        func.coalesce(func.sum(Transaction.amount), 0)
    ).scalar()
    monthly_expenses = monthly_query.filter(Transaction.type == "expense").with_entities(
        func.coalesce(func.sum(Transaction.amount), 0)
    ).scalar()
    
    stats = DashboardStats(
        total_users=total_users,
        active_users=active_users,
        total_transactions=total_transactions,
        total_income=float(income_sum),
        total_expenses=float(expense_sum),
        balance=float(income_sum - expense_sum),
        monthly_income=float(monthly_income),
        monthly_expenses=float(monthly_expenses)
    )
    
    # Category breakdown (expenses only)
    category_data = db.query(
        Category.id,
        Category.name,
        Category.color,
        Category.icon,
        func.sum(Transaction.amount).label('total'),
        func.count(Transaction.id).label('count')
    ).join(Transaction).filter(
        Transaction.type == "expense",
        Transaction.date >= start_date,
        Transaction.date <= end_date
    )
    
    if current_user.role != "admin":
        category_data = category_data.filter(Transaction.user_id == current_user.id)
    
    category_data = category_data.group_by(
        Category.id, Category.name, Category.color, Category.icon
    ).all()
    
    total_expense = sum([item.total for item in category_data])
    category_breakdown = [
        CategoryBreakdown(
            category_id=item.id,
            category_name=item.name,
            color=item.color,
            icon=item.icon,
            total_amount=float(item.total),
            percentage=round((item.total / total_expense * 100) if total_expense > 0 else 0, 2),
            transaction_count=item.count
        )
        for item in category_data
    ]
    
    # Sort by amount descending
    category_breakdown.sort(key=lambda x: x.total_amount, reverse=True)
    
    # Top 5 categories
    top_categories = category_breakdown[:5]
    
    # Monthly trends (last 6 months)
    monthly_trends = []
    for i in range(5, -1, -1):
        month_date = datetime.utcnow() - timedelta(days=30*i)
        month_str = month_date.strftime("%Y-%m")
        
        month_start = month_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        if i > 0:
            next_month = month_date.replace(day=28) + timedelta(days=4)
            month_end = next_month.replace(day=1) - timedelta(seconds=1)
        else:
            month_end = datetime.utcnow()
        
        month_query = db.query(Transaction).filter(
            Transaction.date >= month_start,
            Transaction.date <= month_end
        )
        
        if current_user.role != "admin":
            month_query = month_query.filter(Transaction.user_id == current_user.id)
        
        month_income = month_query.filter(Transaction.type == "income").with_entities(
            func.coalesce(func.sum(Transaction.amount), 0)
        ).scalar()
        
        month_expense = month_query.filter(Transaction.type == "expense").with_entities(
            func.coalesce(func.sum(Transaction.amount), 0)
        ).scalar()
        
        monthly_trends.append(MonthlyTrend(
            month=month_str,
            income=float(month_income),
            expenses=float(month_expense),
            balance=float(month_income - month_expense)
        ))
    
    # Recent transactions (last 10)
    recent_query = db.query(Transaction).join(Category).join(User)
    
    if current_user.role != "admin":
        recent_query = recent_query.filter(Transaction.user_id == current_user.id)
    
    recent_transactions_data = recent_query.order_by(
        Transaction.created_at.desc()
    ).limit(10).all()
    
    recent_transactions = [
        RecentTransaction(
            id=t.id,
            type=t.type,
            amount=t.amount,
            category_name=t.category.name,
            user_name=t.user.name,
            date=t.date,
            description=t.description
        )
        for t in recent_transactions_data
    ]
    
    return DashboardData(
        stats=stats,
        category_breakdown=category_breakdown,
        monthly_trends=monthly_trends,
        recent_transactions=recent_transactions,
        top_categories=top_categories
    )
