from typing import Optional
from cache import cache
import time
import hashlib
from fastapi import FastAPI, Depends, HTTPException, Query, Path
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from crud import get_products as get_products_crud, get_orders as get_orders_crud, get_users as get_users_crud, get_product as get_product_crud, get_user as get_user_crud, get_order as get_order_crud, truncate_all_data
from schemas import (
    PaginatedResponse, Product as SchemaProduct, User as SchemaUser, Order as SchemaOrder,
    ProductQueryParams, UserQueryParams, OrderQueryParams, SortOrder
)
from models import Product, User, Order, Base
from database import engine, get_db
from seed_data import seed_all_data

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="High-Performance Data API",
    description="FastAPI backend for handling 100k+ records with <100ms response times",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware to track response times
@app.middleware("http")
async def add_process_time_header(request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

def generate_cache_key(endpoint: str, **params) -> str:
    """Generate a cache key based on endpoint and parameters"""
    param_str = "&".join([f"{k}={v}" for k, v in sorted(params.items()) if v is not None])
    cache_string = f"{endpoint}?{param_str}"
    return hashlib.md5(cache_string.encode()).hexdigest()

@app.get("/")
def read_root():
    return {"message": "Assessment API", "status": "running"}

@app.post("/seed-data")
def seed_database(db: Session = Depends(get_db)):
    """Seed the database with sample data"""
    try:
        seed_all_data(db)
        cache.clear_pattern("*")  # Clear all cached data
        return {"message": "Database seeded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/products", response_model=PaginatedResponse)
def get_products(
    params: ProductQueryParams = Depends(),
    db: Session = Depends(get_db)
):
    # Additional validation for sort_order
    if params.sort_order.value not in ['asc', 'desc']:
        raise HTTPException(
            status_code=400, 
            detail="sort_order must be either 'asc' or 'desc'"
        )
    
    # Validate other parameters
    if params.page < 1:
        raise HTTPException(status_code=400, detail="Page must be greater than 0")
    if params.size < 1 or params.size > 1000:
        raise HTTPException(status_code=400, detail="Size must be between 1 and 1000")
    
    # Generate cache key
    cache_key = generate_cache_key(
        "products",
        page=params.page,
        size=params.size,
        search=params.search,
        category=params.category,
        brand=params.brand,
        min_price=params.min_price,
        max_price=params.max_price,
        sort_by=params.sort_by.value,
        sort_order=params.sort_order.value
    )
    
    # Try to get from cache
    cached_result = cache.get(cache_key)
    if cached_result:
        return cached_result
    
    skip = (params.page - 1) * params.size
    result = get_products_crud(
        db=db,
        skip=skip,
        limit=params.size,
        search=params.search,
        category=params.category,
        brand=params.brand,
        min_price=params.min_price,
        max_price=params.max_price,
        sort_by=params.sort_by.value,
        sort_order=params.sort_order.value
    )
    
    # Convert SQLAlchemy objects to dict for JSON serialization
    items_dict = [{
        "id": item.id,
        "name": item.name,
        "description": item.description,
        "price": item.price,
        "category": item.category,
        "brand": item.brand,
        "stock_quantity": item.stock_quantity,
        "rating": item.rating,
        "is_active": item.is_active,
        "created_at": item.created_at.isoformat(),
        "updated_at": item.updated_at.isoformat()
    } for item in result["items"]]
    
    response_data = {
        "items": items_dict,
        "total": result["total"],
        "page": result["page"],
        "size": result["size"],
        "pages": result["pages"]
    }
    
    # Cache the result for 5 minutes
    cache.set(cache_key, response_data, ttl=300)
    
    return response_data

@app.get("/products/{product_id}", response_model=SchemaProduct)
def get_product(product_id: int = Path(..., ge=1), db: Session = Depends(get_db)):
    if product_id < 1:
        raise HTTPException(status_code=400, detail="Product ID must be greater than 0")
    
    cache_key = f"product_{product_id}"
    
    cached_result = cache.get(cache_key)
    if cached_result:
        return cached_result
    
    product = get_product_crud(db, product_id=product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product_dict = {
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "price": product.price,
        "category": product.category,
        "brand": product.brand,
        "stock_quantity": product.stock_quantity,
        "rating": product.rating,
        "is_active": product.is_active,
        "created_at": product.created_at.isoformat(),
        "updated_at": product.updated_at.isoformat()
    }
    
    cache.set(cache_key, product_dict, ttl=600)
    return product_dict



@app.get("/users", response_model=PaginatedResponse)
def get_users(
    params: UserQueryParams = Depends(),
    db: Session = Depends(get_db)
):
    # Additional validation for sort_order
    if params.sort_order.value not in ['asc', 'desc']:
        raise HTTPException(
            status_code=400, 
            detail="sort_order must be either 'asc' or 'desc'"
        )
    
    # Validate other parameters
    if params.page < 1:
        raise HTTPException(status_code=400, detail="Page must be greater than 0")
    if params.size < 1 or params.size > 1000:
        raise HTTPException(status_code=400, detail="Size must be between 1 and 1000")
    
    cache_key = generate_cache_key(
        "users",
        page=params.page,
        size=params.size,
        search=params.search,
        city=params.city,
        country=params.country,
        sort_by=params.sort_by.value,
        sort_order=params.sort_order.value
    )
    
    cached_result = cache.get(cache_key)
    if cached_result:
        return cached_result
    
    skip = (params.page - 1) * params.size
    result = get_users_crud(
        db=db,
        skip=skip,
        limit=params.size,
        search=params.search,
        city=params.city,
        country=params.country,
        sort_by=params.sort_by.value,
        sort_order=params.sort_order.value
    )
    
    items_dict = [{
        "id": item.id,
        "email": item.email,
        "first_name": item.first_name,
        "last_name": item.last_name,
        "phone": item.phone,
        "address": item.address,
        "city": item.city,
        "country": item.country,
        "is_active": item.is_active,
        "created_at": item.created_at.isoformat()
    } for item in result["items"]]
    
    response_data = {
        "items": items_dict,
        "total": result["total"],
        "page": result["page"],
        "size": result["size"],
        "pages": result["pages"]
    }
    
    cache.set(cache_key, response_data, ttl=300)
    return response_data

@app.get("/orders", response_model=PaginatedResponse)
def get_orders(
    params: OrderQueryParams = Depends(),
    db: Session = Depends(get_db)
):
    # Additional validation for sort_order
    if params.sort_order.value not in ['asc', 'desc']:
        raise HTTPException(
            status_code=400, 
            detail="sort_order must be either 'asc' or 'desc'"
        )
    
    # Validate other parameters
    if params.page < 1:
        raise HTTPException(status_code=400, detail="Page must be greater than 0")
    if params.size < 1 or params.size > 1000:
        raise HTTPException(status_code=400, detail="Size must be between 1 and 1000")
    if params.user_id is not None and params.user_id < 1:
        raise HTTPException(status_code=400, detail="User ID must be greater than 0")
    
    cache_key = generate_cache_key(
        "orders",
        page=params.page,
        size=params.size,
        user_id=params.user_id,
        status=params.status.value if params.status else None,
        sort_by=params.sort_by.value,
        sort_order=params.sort_order.value
    )
    
    cached_result = cache.get(cache_key)
    if cached_result:
        return cached_result
    
    skip = (params.page - 1) * params.size
    result = get_orders_crud(
        db=db,
        skip=skip,
        limit=params.size,
        user_id=params.user_id,
        status=params.status.value if params.status else None,
        sort_by=params.sort_by.value,
        sort_order=params.sort_order.value
    )
    
    items_dict = [{
        "id": item.id,
        "user_id": item.user_id,
        "product_id": item.product_id,
        "quantity": item.quantity,
        "unit_price": item.unit_price,
        "total_amount": item.total_amount,
        "status": item.status,
        "order_date": item.order_date.isoformat(),
        "user": {
            "id": item.user.id,
            "email": item.user.email,
            "first_name": item.user.first_name,
            "last_name": item.user.last_name,
            "phone": item.user.phone,
            "address": item.user.address,
            "city": item.user.city,
            "country": item.user.country,
            "is_active": item.user.is_active,
            "created_at": item.user.created_at.isoformat()
        } if item.user else None,
        "product": {
            "id": item.product.id,
            "name": item.product.name,
            "description": item.product.description,
            "price": item.product.price,
            "category": item.product.category,
            "brand": item.product.brand,
            "stock_quantity": item.product.stock_quantity,
            "rating": item.product.rating,
            "is_active": item.product.is_active,
            "created_at": item.product.created_at.isoformat(),
            "updated_at": item.product.updated_at.isoformat()
        } if item.product else None
    } for item in result["items"]]
    
    response_data = {
        "items": items_dict,
        "total": result["total"],
        "page": result["page"],
        "size": result["size"],
        "pages": result["pages"]
    }
    
    cache.set(cache_key, response_data, ttl=300)
    return response_data

@app.get("/users/{user_id}", response_model=SchemaUser)
def get_user(user_id: int = Path(..., ge=1), db: Session = Depends(get_db)):
    if user_id < 1:
        raise HTTPException(status_code=400, detail="User ID must be greater than 0")
    
    cache_key = f"user_{user_id}"
    
    cached_result = cache.get(cache_key)
    if cached_result:
        return cached_result
    
    user = get_user_crud(db, user_id=user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_dict = {
        "id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "phone": user.phone,
        "address": user.address,
        "city": user.city,
        "country": user.country,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat()
    }
    
    cache.set(cache_key, user_dict, ttl=600)
    return user_dict

@app.get("/orders/{order_id}", response_model=SchemaOrder)
def get_order(order_id: int = Path(..., ge=1), db: Session = Depends(get_db)):
    if order_id < 1:
        raise HTTPException(status_code=400, detail="Order ID must be greater than 0")
    
    cache_key = f"order_{order_id}"
    
    cached_result = cache.get(cache_key)
    if cached_result:
        return cached_result
    
    order = get_order_crud(db, order_id=order_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order_dict = {
        "id": order.id,
        "user_id": order.user_id,
        "product_id": order.product_id,
        "quantity": order.quantity,
        "unit_price": order.unit_price,
        "total_amount": order.total_amount,
        "status": order.status,
        "order_date": order.order_date.isoformat(),
        "user": {
            "id": order.user.id,
            "email": order.user.email,
            "first_name": order.user.first_name,
            "last_name": order.user.last_name,
            "phone": order.user.phone,
            "address": order.user.address,
            "city": order.user.city,
            "country": order.user.country,
            "is_active": order.user.is_active,
            "created_at": order.user.created_at.isoformat()
        } if order.user else None,
        "product": {
            "id": order.product.id,
            "name": order.product.name,
            "description": order.product.description,
            "price": order.product.price,
            "category": order.product.category,
            "brand": order.product.brand,
            "stock_quantity": order.product.stock_quantity,
            "rating": order.product.rating,
            "is_active": order.product.is_active,
            "created_at": order.product.created_at.isoformat(),
            "updated_at": order.product.updated_at.isoformat()
        } if order.product else None
    }
    
    cache.set(cache_key, order_dict, ttl=600)
    return order_dict

@app.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    """Get database statistics"""
    cache_key = "stats"
    cached_result = cache.get(cache_key)
    if cached_result:
        return cached_result
    
    stats = {
        "total_products": db.query(Product).count(),
        "total_users": db.query(User).count(),
        "total_orders": db.query(Order).count(),
        "active_products": db.query(Product).filter(Product.is_active == True).count(),
        "active_users": db.query(User).filter(User.is_active == True).count()
    }
    
    cache.set(cache_key, stats, ttl=60)  # Cache for 1 minute
    return stats

@app.delete("/truncate-all")
def truncate_all_data_endpoint(db: Session = Depends(get_db)):
    """
    Truncate all data from the database.
    WARNING: This will permanently delete all products, users, and orders.
    """
    try:
        result = truncate_all_data(db)
        
        # Clear all Redis cache after truncating data
        cache.clear_pattern("*")  # Clear all cached data
        
        if result["success"]:
            return {
                "message": result["message"],
                "deleted_counts": result["deleted_counts"],
                "cache_cleared": True
            }
        else:
            raise HTTPException(status_code=500, detail=result["message"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to truncate data: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)