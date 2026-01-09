from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class CategoryType(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"


class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    color: str = Field(..., pattern=r'^#[0-9A-Fa-f]{6}$')  # Hex color
    icon: str = Field(..., min_length=1, max_length=50)
    type: CategoryType


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    color: Optional[str] = Field(None, pattern=r'^#[0-9A-Fa-f]{6}$')
    icon: Optional[str] = Field(None, min_length=1, max_length=50)
    type: Optional[CategoryType] = None


class CategoryResponse(CategoryBase):
    id: str

    class Config:
        from_attributes = True


class CategoryWithStats(CategoryResponse):
    transaction_count: int
    total_amount: float
