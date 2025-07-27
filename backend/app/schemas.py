from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, validator
from pydantic import EmailStr
from enum import Enum

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category: str
    brand: str
    stock_quantity: int
    rating: Optional[float] = None
    is_active: bool = True

class Product(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    city: str
    country: str
    is_active: bool = True

class User(UserBase):
   
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    user_id: int
    product_id: int
    quantity: int
    unit_price: float
    total_amount: float
    status: str

class Order(OrderBase):
    id: int
    order_date: datetime
    user: Optional[User] = None
    product: Optional[Product] = None
    
    class Config:
        from_attributes = True

class PaginatedResponse(BaseModel):
    items: List[dict]
    total: int
    page: int
    size: int
    pages: int

# Validation enums for sort parameters
class ProductSortFields(str, Enum):
    id = "id"
    name = "name"
    price = "price"
    category = "category"
    brand = "brand"
    stock_quantity = "stock_quantity"
    rating = "rating"
    created_at = "created_at"
    updated_at = "updated_at"

class UserSortFields(str, Enum):
    id = "id"
    email = "email"
    first_name = "first_name"
    last_name = "last_name"
    city = "city"
    country = "country"
    created_at = "created_at"

class OrderSortFields(str, Enum):
    id = "id"
    user_id = "user_id"
    product_id = "product_id"
    quantity = "quantity"
    unit_price = "unit_price"
    total_amount = "total_amount"
    status = "status"
    order_date = "order_date"

class SortOrder(str, Enum):
    asc = "asc"
    desc = "desc"

class OrderStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    shipped = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"

# Query parameter validation schemas
class ProductQueryParams(BaseModel):
    page: int = Field(1, ge=1, description="Page number")
    size: int = Field(50, ge=1, le=1000, description="Page size")
    search: Optional[str] = Field(None, max_length=255, description="Search term")
    category: Optional[str] = Field(None, max_length=100, description="Product category")
    brand: Optional[str] = Field(None, max_length=100, description="Product brand")
    min_price: Optional[float] = Field(None, ge=0, description="Minimum price")
    max_price: Optional[float] = Field(None, ge=0, description="Maximum price")
    sort_by: ProductSortFields = Field(ProductSortFields.id, description="Sort field")
    sort_order: SortOrder = Field(SortOrder.asc, description="Sort order (asc or desc only)")
    
    @validator('max_price')
    def validate_price_range(cls, v, values):
        if v is not None and 'min_price' in values and values['min_price'] is not None:
            if v < values['min_price']:
                raise ValueError('max_price must be greater than or equal to min_price')
        return v
    
    @validator('sort_order')
    def validate_sort_order(cls, v):
        if v not in [SortOrder.asc, SortOrder.desc]:
            raise ValueError('sort_order must be either "asc" or "desc"')
        return v

class UserQueryParams(BaseModel):
    page: int = Field(1, ge=1, description="Page number")
    size: int = Field(50, ge=1, le=1000, description="Page size")
    search: Optional[str] = Field(None, max_length=255, description="Search term")
    city: Optional[str] = Field(None, max_length=100, description="City")
    country: Optional[str] = Field(None, max_length=100, description="Country")
    sort_by: UserSortFields = Field(UserSortFields.id, description="Sort field")
    sort_order: SortOrder = Field(SortOrder.asc, description="Sort order (asc or desc only)")
    
    @validator('sort_order')
    def validate_sort_order(cls, v):
        if v not in [SortOrder.asc, SortOrder.desc]:
            raise ValueError('sort_order must be either "asc" or "desc"')
        return v

class OrderQueryParams(BaseModel):
    page: int = Field(1, ge=1, description="Page number")
    size: int = Field(50, ge=1, le=1000, description="Page size")
    user_id: Optional[int] = Field(None, ge=1, description="User ID")
    status: Optional[OrderStatus] = Field(None, description="Order status")
    sort_by: OrderSortFields = Field(OrderSortFields.id, description="Sort field")
    sort_order: SortOrder = Field(SortOrder.asc, description="Sort order (asc or desc only)")
    
    @validator('sort_order')
    def validate_sort_order(cls, v):
        if v not in [SortOrder.asc, SortOrder.desc]:
            raise ValueError('sort_order must be either "asc" or "desc"')
        return v