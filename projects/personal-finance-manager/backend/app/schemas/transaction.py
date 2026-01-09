from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class TransactionType(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"


class TransactionBase(BaseModel):
    category_id: str
    type: TransactionType
    amount: float = Field(..., gt=0)
    description: Optional[str] = None
    date: datetime


class TransactionCreate(TransactionBase):
    user_id: str


class TransactionUpdate(BaseModel):
    category_id: Optional[str] = None
    type: Optional[TransactionType] = None
    amount: Optional[float] = Field(None, gt=0)
    description: Optional[str] = None
    date: Optional[datetime] = None


class CategoryInfo(BaseModel):
    id: str
    name: str
    color: str
    icon: str
    type: str

    class Config:
        from_attributes = True


class UserInfo(BaseModel):
    id: str
    name: str
    email: str

    class Config:
        from_attributes = True


class TransactionResponse(TransactionBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryInfo] = None
    user: Optional[UserInfo] = None

    class Config:
        from_attributes = True


class TransactionListResponse(BaseModel):
    transactions: list[TransactionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
