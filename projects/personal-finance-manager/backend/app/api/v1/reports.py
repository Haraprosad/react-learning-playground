from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
import csv
import io

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.transaction import Transaction
from app.models.category import Category

router = APIRouter()


@router.get("/export/csv")
async def export_transactions_csv(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    user_id: Optional[str] = None,
    category_id: Optional[str] = None,
    type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Export transactions as CSV"""
    
    query = db.query(Transaction).join(Category).join(User)
    
    # Non-admin users can only export their own transactions
    if current_user.role != "admin":
        query = query.filter(Transaction.user_id == current_user.id)
    elif user_id:
        query = query.filter(Transaction.user_id == user_id)
    
    # Apply filters
    if category_id:
        query = query.filter(Transaction.category_id == category_id)
    if type:
        query = query.filter(Transaction.type == type)
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)
    
    transactions = query.order_by(Transaction.date.desc()).all()
    
    # Create CSV
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write headers
    writer.writerow([
        'Date', 'Type', 'Category', 'Amount', 'Description', 'User', 'Created At'
    ])
    
    # Write data
    for t in transactions:
        writer.writerow([
            t.date.strftime('%Y-%m-%d'),
            t.type,
            t.category.name,
            t.amount,
            t.description or '',
            t.user.name,
            t.created_at.strftime('%Y-%m-%d %H:%M:%S')
        ])
    
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=transactions_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        }
    )


@router.get("/summary")
async def get_report_summary(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get summary report for date range"""
    
    if not end_date:
        end_date = datetime.utcnow()
    if not start_date:
        start_date = datetime(end_date.year, end_date.month, 1)
    
    query = db.query(Transaction).filter(
        Transaction.date >= start_date,
        Transaction.date <= end_date
    )
    
    if current_user.role != "admin":
        query = query.filter(Transaction.user_id == current_user.id)
    
    transactions = query.all()
    
    income = sum(t.amount for t in transactions if t.type == "income")
    expenses = sum(t.amount for t in transactions if t.type == "expense")
    
    # Category breakdown
    category_totals = {}
    for t in transactions:
        if t.type == "expense":
            cat_name = t.category.name
            if cat_name not in category_totals:
                category_totals[cat_name] = 0
            category_totals[cat_name] += t.amount
    
    return {
        "period": {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        },
        "summary": {
            "total_income": income,
            "total_expenses": expenses,
            "net_balance": income - expenses,
            "transaction_count": len(transactions)
        },
        "category_breakdown": [
            {"category": cat, "amount": amount}
            for cat, amount in sorted(category_totals.items(), key=lambda x: x[1], reverse=True)
        ]
    }
