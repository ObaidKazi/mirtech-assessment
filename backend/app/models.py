from datetime import datetime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey



Base = declarative_base()

class Product(Base):
   
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True)
    description = Column(Text)
    price = Column(Float, index=True)
    category = Column(String(100), index=True)
    brand = Column(String(100), index=True)
    stock_quantity = Column(Integer, index=True)
    rating = Column(Float, index=True)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    orders = relationship("Order", back_populates="product")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    first_name = Column(String(100), index=True)
    last_name = Column(String(100), index=True)
    phone = Column(String(35))
    address = Column(Text)
    city = Column(String(100), index=True)
    country = Column(String(100), index=True)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    orders = relationship("Order", back_populates="user")

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    product_id = Column(Integer, ForeignKey("products.id"), index=True)
    quantity = Column(Integer)
    unit_price = Column(Float)
    total_amount = Column(Float, index=True)
    status = Column(String(50), index=True)
    order_date = Column(DateTime, default=datetime.utcnow, index=True)
    user = relationship("User", back_populates="orders")
    product = relationship("Product", back_populates="orders")