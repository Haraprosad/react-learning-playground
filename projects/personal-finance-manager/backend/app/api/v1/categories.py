from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.category import Category
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.category import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
    CategoryWithStats
)

router = APIRouter()


@router.get("", response_model=list[CategoryResponse])
async def get_categories(
    type: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all categories"""
    query = db.query(Category)
    
    if type:
        query = query.filter(Category.type == type)
    
    categories = query.all()
    return categories


@router.get("/with-stats", response_model=list[CategoryWithStats])
async def get_categories_with_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get categories with transaction statistics"""
    categories = db.query(
        Category,
        func.count(Transaction.id).label('transaction_count'),
        func.coalesce(func.sum(Transaction.amount), 0).label('total_amount')
    ).outerjoin(Transaction).group_by(Category.id).all()
    
    result = []
    for category, count, total in categories:
        result.append(CategoryWithStats(
            id=category.id,
            name=category.name,
            color=category.color,
            icon=category.icon,
            type=category.type,
            transaction_count=count,
            total_amount=float(total)
        ))
    
    return result


@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(
    category_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get category by ID"""
    category = db.query(Category).filter(Category.id == category_id).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    return category


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_data: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create new category (Admin only for now)"""
    # Check if category name already exists
    existing_category = db.query(Category).filter(Category.name == category_data.name).first()
    if existing_category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this name already exists"
        )
    
    new_category = Category(**category_data.model_dump())
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    
    return new_category


@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: str,
    category_data: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update category"""
    category = db.query(Category).filter(Category.id == category_id).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Check name uniqueness if being updated
    if category_data.name and category_data.name != category.name:
        existing_category = db.query(Category).filter(Category.name == category_data.name).first()
        if existing_category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category with this name already exists"
            )
    
    # Update fields
    update_data = category_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(category, field, value)
    
    db.commit()
    db.refresh(category)
    
    return category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete category"""
    category = db.query(Category).filter(Category.id == category_id).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Check if category has transactions
    transaction_count = db.query(Transaction).filter(Transaction.category_id == category_id).count()
    if transaction_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete category with {transaction_count} associated transactions"
        )
    
    db.delete(category)
    db.commit()
    
    return None
