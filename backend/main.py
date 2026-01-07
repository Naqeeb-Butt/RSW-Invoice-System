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

# Initialize Netlify database
try:
    from database_netlify import netlify_db
    logger.info("Netlify database initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize Netlify database: {str(e)}")

# Initialize admin user
try:
    from database_netlify import netlify_db
    from models import User
    from auth import get_password_hash
    from config import settings
    
    # Check if admin user exists in Netlify database
    admin_user = netlify_db.get_user_by_email(settings.ADMIN_EMAIL)
    if not admin_user:
        logger.info(f"Creating admin user: {settings.ADMIN_EMAIL}")
        admin_user_data = {
            "id": 1,
            "email": settings.ADMIN_EMAIL,
            "name": settings.ADMIN_NAME,
            "hashed_password": get_password_hash(settings.ADMIN_PASSWORD),
            "is_active": True,
            "created_at": datetime.utcnow().isoformat()
        }
        netlify_db.save_user(admin_user_data)
        logger.info("Admin user created successfully")
    else:
        logger.info(f"Admin user already exists: {settings.ADMIN_EMAIL}")
except Exception as e:
    logger.error(f"Failed to initialize admin user: {str(e)}")

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
    form_data: OAuth2PasswordRequestForm = Depends()
):
    try:
        logger.info(f"Login attempt started", extra={
            "username": form_data.username,
            "timestamp": datetime.utcnow().isoformat(),
            "user_agent": "netlify_function",
            "environment": "production"
        })
        
        # Use Netlify database instead of SQLAlchemy
        from database_netlify import netlify_db
        
        user = netlify_db.get_user_by_email(form_data.username)
        
        if not user:
            logger.warning(f"Authentication failed for user: {form_data.username}", extra={
                "username": form_data.username,
                "reason": "invalid_credentials",
                "timestamp": datetime.utcnow().isoformat()
            })
            log_auth_event("LOGIN_FAILED", form_data.username, False, "Invalid credentials")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Verify password (simple comparison for demo)
        if form_data.password != settings.ADMIN_PASSWORD:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        
        logger.info(f"User logged in successfully", extra={
            "user_email": user.email,
            "user_id": user.id,
            "token_expires_minutes": settings.ACCESS_TOKEN_EXPIRE_MINUTES,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        log_auth_event("LOGIN_SUCCESS", user.email, True, f"Token expires in {settings.ACCESS_TOKEN_EXPIRE_MINUTES} minutes")
        
        return {"access_token": access_token, "token_type": "bearer"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login failed with unexpected error: {str(e)}", extra={
            "error_type": "server_error",
            "error_details": str(e),
            "username": form_data.username,
            "timestamp": datetime.utcnow().isoformat()
        })
        log_error(e, "User login", user_email=form_data.username)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed due to server error"
        )

@app.get(f"{settings.API_V1_STR}/debug/health")
async def debug_health_check():
    """Debug endpoint to check system health"""
    try:
        from database_netlify import netlify_db
        
        # Check if admin user exists
        admin_user = netlify_db.get_user_by_email(settings.ADMIN_EMAIL)
        
        # Count users
        users = netlify_db.get_users()
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "database": {
                "status": "netlify_json",
                "user_count": len(users),
                "admin_user_exists": admin_user is not None,
                "admin_email": settings.ADMIN_EMAIL
            },
            "environment": {
                "api_version": settings.API_V1_STR,
                "token_expire_minutes": settings.ACCESS_TOKEN_EXPIRE_MINUTES
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "timestamp": datetime.utcnow().isoformat(),
            "error": str(e),
            "database": {
                "status": "disconnected"
            }
        }

@app.get(f"{settings.API_V1_STR}/debug/users")
async def debug_list_users():
    """Debug endpoint to list all users"""
    try:
        from database_netlify import netlify_db
        users = netlify_db.get_users()
        return {
            "user_count": len(users),
            "users": users
        }
    except Exception as e:
        logger.error(f"Debug users endpoint failed: {str(e)}")
        return {"error": str(e)}

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
