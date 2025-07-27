"""
CRUD operations for managing products, users and orders in the e-commerce system.
Provides functions to retrieve and filter data from the database with pagination support.
"""
from typing import Dict, Any, Optional
import math
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_
from models import Product, User, Order


def get_products(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    category: Optional[str] = None,
    brand: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: str = "id",
    sort_order: str = "asc"
) -> Dict[str, Any]:
    
    query = db.query(Product)
    
    # Apply filters
    filters = []
    if search:
        search_filter = or_(
            Product.name.ilike(f"%{search}%"),
            Product.description.ilike(f"%{search}%"),
            Product.brand.ilike(f"%{search}%")
        )
        filters.append(search_filter)
    
    if category:
        filters.append(Product.category == category)
    
    if brand:
        filters.append(Product.brand == brand)
    
    if min_price is not None:
        filters.append(Product.price >= min_price)
    
    if max_price is not None:
        filters.append(Product.price <= max_price)
    
    if filters:
        query = query.filter(and_(*filters))
    
    # Get total count for pagination
    total = query.count()
    
    # Apply sorting
    sort_column = getattr(Product, sort_by, Product.id)
    if sort_order.lower() == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())
    
    # Apply pagination
    items = query.offset(skip).limit(limit).all()
    
    return {
        "items": items,
        "total": total,
        "page": (skip // limit) + 1,
        "size": limit,
        "pages": math.ceil(total / limit)
    }

def get_product(db: Session, product_id: int):
    return db.query(Product).filter(Product.id == product_id).first()

def get_users(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    city: Optional[str] = None,
    country: Optional[str] = None,
    sort_by: str = "id",
    sort_order: str = "asc"
) -> Dict[str, Any]:
    
    query = db.query(User)
    
    # Apply filters
    filters = []
    if search:
        search_filter = or_(
            User.first_name.ilike(f"%{search}%"),
            User.last_name.ilike(f"%{search}%"),
            User.email.ilike(f"%{search}%")
        )
        filters.append(search_filter)
    
    if city:
        filters.append(User.city == city)
    
    if country:
        filters.append(User.country == country)
    
    if filters:
        query = query.filter(and_(*filters))
    
    total = query.count()
    
    # Apply sorting
    sort_column = getattr(User, sort_by, User.id)
    if sort_order.lower() == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())
    
    items = query.offset(skip).limit(limit).all()
    
    return {
        "items": items,
        "total": total,
        "page": (skip // limit) + 1,
        "size": limit,
        "pages": math.ceil(total / limit)
    }

def get_orders(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[int] = None,
    status: Optional[str] = None,
    sort_by: str = "id",
    sort_order: str = "asc"
) -> Dict[str, Any]:
    
    query = db.query(Order).options(
        joinedload(Order.user),
        joinedload(Order.product)
    )
    
    filters = []
    if user_id:
        filters.append(Order.user_id == user_id)
    
    if status:
        filters.append(Order.status == status)
    
    if filters:
        query = query.filter(and_(*filters))
    
    total = query.count()
    
    # Apply sorting
    sort_column = getattr(Order, sort_by, Order.id)
    if sort_order.lower() == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())
    
    items = query.offset(skip).limit(limit).all()
    
    return {
        "items": items,
        "total": total,
        "page": (skip // limit) + 1,
        "size": limit,
        "pages": math.ceil(total / limit)
    }

def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def get_order(db: Session, order_id: int):
    return db.query(Order).options(
        joinedload(Order.user),
        joinedload(Order.product)
    ).filter(Order.id == order_id).first()

def truncate_all_data(db: Session) -> Dict[str, Any]:
    """
    Truncate all data from the database tables.
    Deletes all records from orders, users, and products tables in the correct order
    to respect foreign key constraints.
    """
    try:
        # Delete in order to respect foreign key constraints
        # Orders first (has foreign keys to users and products)
        orders_deleted = db.query(Order).count()
        db.query(Order).delete()
        
        # Then users and products (no dependencies between them)
        users_deleted = db.query(User).count()
        db.query(User).delete()
        
        products_deleted = db.query(Product).count()
        db.query(Product).delete()
        
        # Commit the transaction
        db.commit()
        
        return {
            "success": True,
            "message": "All data truncated successfully",
            "deleted_counts": {
                "orders": orders_deleted,
                "users": users_deleted,
                "products": products_deleted
            }
        }
    except Exception as e:
        db.rollback()
        return {
            "success": False,
            "message": f"Error truncating data: {str(e)}",
            "deleted_counts": {
                "orders": 0,
                "users": 0,
                "products": 0
            }
        }