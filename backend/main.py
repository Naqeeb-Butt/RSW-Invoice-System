from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import pandas as pd
import io
from typing import List

from database import get_db, engine, Base
from models import User, Client, Invoice, InvoiceItem
from schemas import (
    User as UserSchema, UserCreate, UserUpdate, Client as ClientSchema,
    ClientCreate, ClientUpdate, Invoice as InvoiceSchema, InvoiceCreate,
    InvoiceUpdate, Token, DashboardStats, MonthlyRevenue, DashboardData
)
from auth import (
    authenticate_user, create_access_token, get_current_active_user,
    get_current_admin_user, get_password_hash
)
from utils import generate_invoice_number, create_invoice_with_items, number_to_words
from config import settings
from logger import setup_logging, RequestLoggingMiddleware, log_auth_event, log_database_operation, log_business_event, log_error

# Setup logging
logger = setup_logging()
logger.info("Aasko Invoice System starting up...")

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Aasko Construction Invoice System", 
    version="1.0.0",
    description="Production-level invoice management system for Aasko Construction"
)

# Add request logging middleware
app.add_middleware(RequestLoggingMiddleware)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize admin user
def create_admin_user(db: Session):
    logger.info("Checking for admin user...")
    admin = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
    if not admin:
        logger.info(f"Creating admin user: {settings.ADMIN_EMAIL}")
        admin_user = User(
            email=settings.ADMIN_EMAIL,
            name=settings.ADMIN_NAME,
            hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
            is_admin=True,
            is_active=True
        )
        db.add(admin_user)
        db.commit()
        log_database_operation("CREATE", "users", admin_user.id, admin_user.id)
        log_business_event("ADMIN_USER_CREATED", f"Admin user created: {settings.ADMIN_EMAIL}", admin_user.id)
        logger.info("Admin user created successfully")
    else:
        logger.info("Admin user already exists")

@app.on_event("startup")
async def startup_event():
    db = next(get_db())
    try:
        create_admin_user(db)
        logger.info("Application startup completed successfully")
    except Exception as e:
        log_error(e, "Application startup")
        raise
    finally:
        db.close()

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Aasko Invoice System shutting down...")

# Auth endpoints
@app.post(f"{settings.API_V1_STR}/auth/login", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    try:
        logger.info(f"Login attempt for user: {form_data.username}")
        user = authenticate_user(db, form_data.username, form_data.password)
        if not user:
            log_auth_event("LOGIN_FAILED", form_data.username, False, "Invalid credentials")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        
        log_auth_event("LOGIN_SUCCESS", user.email, True, f"Token expires in {settings.ACCESS_TOKEN_EXPIRE_MINUTES} minutes")
        logger.info(f"User {user.email} logged in successfully")
        
        return {"access_token": access_token, "token_type": "bearer"}
        
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "User login", user_email=form_data.username)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed due to server error"
        )

@app.get(f"{settings.API_V1_STR}/auth/me", response_model=UserSchema)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    logger.info(f"Current user requested: {current_user.email}")
    return current_user

# Health check endpoint
@app.get("/health")
async def health_check():
    logger.info("Health check endpoint accessed")
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)
