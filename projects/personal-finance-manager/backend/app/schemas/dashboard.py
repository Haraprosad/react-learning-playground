from pydantic import BaseModel
from typing import List
from datetime import datetime


class DashboardStats(BaseModel):
    total_users: int
    active_users: int
    total_transactions: int
    total_income: float
    total_expenses: float
    balance: float
    monthly_income: float
    monthly_expenses: float


class CategoryBreakdown(BaseModel):
    category_id: str
    category_name: str
    color: str
    icon: str
    total_amount: float
    percentage: float
    transaction_count: int


class MonthlyTrend(BaseModel):
    month: str  # Format: "YYYY-MM"
    income: float
    expenses: float
    balance: float


class RecentTransaction(BaseModel):
    id: str
    type: str
    amount: float
    category_name: str
    user_name: str
    date: datetime
    description: str = None


class DashboardData(BaseModel):
    stats: DashboardStats
    category_breakdown: List[CategoryBreakdown]
    monthly_trends: List[MonthlyTrend]
    recent_transactions: List[RecentTransaction]
    top_categories: List[CategoryBreakdown]


class DateRangeFilter(BaseModel):
    start_date: datetime = None
    end_date: datetime = None
