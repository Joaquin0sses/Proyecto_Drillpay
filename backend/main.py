from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
from routers import auth, invoices, clients, dashboard, emails
import models
import time
from sqlalchemy.exc import OperationalError
from auth import get_password_hash

app = FastAPI(title="DrillPay API")

# Retry DB connection
while True:
    try:
        # WARNING: This drops all tables to ensure schema update. 
        # Remove this in production or use Alembic.
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        break
    except OperationalError:
        print("Database not ready, waiting 3 seconds...")
        time.sleep(3)

def create_defaults():
    db = SessionLocal()
    try:
        # Create Roles
        admin_role = db.query(models.Role).filter(models.Role.name == "admin").first()
        if not admin_role:
            admin_role = models.Role(name="admin", permissions="all")
            db.add(admin_role)
        
        user_role = db.query(models.Role).filter(models.Role.name == "user").first()
        if not user_role:
            user_role = models.Role(name="user", permissions="read_only")
            db.add(user_role)
        
        db.commit()
        
        # Create Users
        # Admin
        admin = db.query(models.User).filter(models.User.username == "admin").first()
        if not admin:
            pwd = get_password_hash("admin123")
            admin = models.User(username="admin", email="admin@drillpay.com", password_hash=pwd, role_id=admin_role.id)
            db.add(admin)
            
        # Normal User
        user = db.query(models.User).filter(models.User.username == "user").first()
        if not user:
            pwd = get_password_hash("user123")
            user = models.User(username="user", email="user@drillpay.com", password_hash=pwd, role_id=user_role.id)
            db.add(user)
            
        db.commit()
    except Exception as e:
        print(f"Error creating defaults: {e}")
    finally:
        db.close()

create_defaults()

# CORS
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(invoices.router)
app.include_router(clients.router)
app.include_router(dashboard.router)
app.include_router(emails.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to DrillPay API"}
