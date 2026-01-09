from sqlalchemy import Column, String, Enum
from sqlalchemy.orm import relationship
import uuid
import enum

from app.core.database import Base


class CategoryType(str, enum.Enum):
    INCOME = "income"
    EXPENSE = "expense"


class Category(Base):
    __tablename__ = "categories"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, unique=True, nullable=False)
    color = Column(String, nullable=False)  # Hex color code
    icon = Column(String, nullable=False)  # Icon name or emoji
    type = Column(Enum(CategoryType), nullable=False)

    # Relationships
    transactions = relationship("Transaction", back_populates="category")
