"""
Utility functions for the application
"""
from typing import Optional
from datetime import datetime
import re


def format_currency(amount: float, currency: str = "USD") -> str:
    """Format amount as currency string"""
    if currency == "USD":
        return f"${amount:,.2f}"
    return f"{amount:,.2f}"


def validate_hex_color(color: str) -> bool:
    """Validate hex color code"""
    pattern = r'^#[0-9A-Fa-f]{6}$'
    return bool(re.match(pattern, color))


def calculate_percentage(part: float, total: float) -> float:
    """Calculate percentage with handling for zero total"""
    if total == 0:
        return 0.0
    return round((part / total) * 100, 2)


def format_date_range(start_date: datetime, end_date: datetime) -> str:
    """Format date range as string"""
    if start_date.year == end_date.year:
        if start_date.month == end_date.month:
            return f"{start_date.strftime('%B %Y')}"
        return f"{start_date.strftime('%B')} - {end_date.strftime('%B %Y')}"
    return f"{start_date.strftime('%B %Y')} - {end_date.strftime('%B %Y')}"


def get_month_name(month: int) -> str:
    """Get month name from number"""
    months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]
    return months[month - 1] if 1 <= month <= 12 else ""
