from faker import Faker
from sqlalchemy.orm import Session
from models import Product, User,Order
import random
from datetime import datetime, timedelta

fake = Faker()

def seed_products(db: Session, count: int = 50000):
    categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Toys', 'Health', 'Automotive']
    brands = ['Apple', 'Samsung', 'Nike', 'Adidas', 'Sony', 'LG', 'Dell', 'HP', 'Canon', 'Microsoft']
    
    products = []
    for i in range(count):
        product = Product(
            name=fake.catch_phrase(),
            description=fake.text(max_nb_chars=500),
            price=round(random.uniform(10.0, 2000.0), 2),
            category=random.choice(categories),
            brand=random.choice(brands),
            stock_quantity=random.randint(0, 1000),
            rating=round(random.uniform(1.0, 5.0), 1),
            is_active=random.choice([True, True, True, False]),  # 75% active
            created_at=fake.date_time_between(start_date='-2y', end_date='now')
        )
        products.append(product)
        
        if len(products) >= 1000:  # Batch insert
            db.bulk_save_objects(products)
            db.commit()
            products = []
            print(f"Seeded {i+1} products...")
    
    if products:
        db.bulk_save_objects(products)
        db.commit()
    
    print(f"Finished seeding {count} products")

def seed_users(db: Session, count: int = 25000):
    users = []
    for i in range(count):
        user = User(
            email=fake.unique.email(),
            first_name=fake.first_name(),
            last_name=fake.last_name(),
            phone=fake.phone_number(),
            address=fake.address(),
            city=fake.city(),
            country=fake.country(),
            is_active=random.choice([True, True, True, False]),
            created_at=fake.date_time_between(start_date='-2y', end_date='now')
        )
        users.append(user)
        
        if len(users) >= 1000:
            db.bulk_save_objects(users)
            db.commit()
            users = []
            print(f"Seeded {i+1} users...")
    
    if users:
        db.bulk_save_objects(users)
        db.commit()
    
    print(f"Finished seeding {count} users")

def seed_orders(db: Session, count: int = 100000):
    # Get existing user and product IDs
    user_ids = [row[0] for row in db.query(User.id).all()]
    product_ids = [row[0] for row in db.query(Product.id).all()]
    
    if not user_ids or not product_ids:
        print("No users or products found. Please seed users and products first.")
        return
    
    statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    orders = []
    
    for i in range(count):
        quantity = random.randint(1, 5)
        unit_price = round(random.uniform(10.0, 500.0), 2)
        
        order = Order(
            user_id=random.choice(user_ids),
            product_id=random.choice(product_ids),
            quantity=quantity,
            unit_price=unit_price,
            total_amount=round(quantity * unit_price, 2),
            status=random.choice(statuses),
            order_date=fake.date_time_between(start_date='-1y', end_date='now')
        )
        orders.append(order)
        
        if len(orders) >= 1000:
            db.bulk_save_objects(orders)
            db.commit()
            orders = []
            print(f"Seeded {i+1} orders...")
    
    if orders:
        db.bulk_save_objects(orders)
        db.commit()
    
    print(f"Finished seeding {count} orders")

def seed_all_data(db: Session):
    print("Starting data seeding...")
    seed_products(db, 50000)
    seed_users(db, 25000)
    seed_orders(db, 100000)
    print("Data seeding completed!")