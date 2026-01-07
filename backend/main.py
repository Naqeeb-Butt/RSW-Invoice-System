from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from datetime import datetime, timedelta
from typing import List, Optional

from database_file import file_db
from schemas import (
    User as UserSchema, UserCreate, UserUpdate, Client as ClientSchema,
    ClientCreate, ClientUpdate, Invoice as InvoiceSchema, InvoiceCreate,
    InvoiceUpdate, Token, DashboardStats, MonthlyRevenue, DashboardData
)
from auth_file import (
    authenticate_user, create_access_token, get_current_active_user,
    get_current_admin_user, get_password_hash, create_user, initialize_admin_user,
    get_current_user
)
from utils import generate_invoice_number, number_to_words
from config import settings

app = FastAPI(
    title="Aasko Construction Invoice System", 
    version="1.0.0",
    description="Production-level invoice management system for Aasko Construction"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize admin user on startup
@app.on_event("startup")
async def startup_event():
    try:
        admin_created = initialize_admin_user()
        if admin_created:
            print(f"Admin user created: {settings.ADMIN_EMAIL}")
        else:
            print(f"Admin user already exists: {settings.ADMIN_EMAIL}")
        print("Application startup completed successfully")
    except Exception as e:
        print(f"Application startup error: {str(e)}")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    print("Aasko Invoice System shutting down...")

# Auth endpoints
@app.post(f"{settings.API_V1_STR}/auth/login", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends()
):
    try:
        user = authenticate_user(form_data.username, form_data.password)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user"
            )
        
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user["email"]}, expires_delta=access_token_expires
        )
        
        return {"access_token": access_token, "token_type": "bearer"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed due to server error"
        )

@app.get(f"{settings.API_V1_STR}/auth/me", response_model=UserSchema)
async def read_users_me(current_user: dict = Depends(get_current_active_user)):
    return current_user

# User endpoints
@app.get(f"{settings.API_V1_STR}/users", response_model=List[UserSchema])
async def get_users(current_user: dict = Depends(get_current_admin_user)):
    return file_db.get_users()

@app.post(f"{settings.API_V1_STR}/users", response_model=UserSchema)
async def create_user_endpoint(
    user: UserCreate, 
    current_user: dict = Depends(get_current_admin_user)
):
    return create_user(user.email, user.name, user.password, user.is_admin)

# Client endpoints
@app.get(f"{settings.API_V1_STR}/clients", response_model=List[ClientSchema])
async def get_clients(current_user: dict = Depends(get_current_active_user)):
    return file_db.get_clients()

@app.post(f"{settings.API_V1_STR}/clients", response_model=ClientSchema)
async def create_client(
    client: ClientCreate, 
    current_user: dict = Depends(get_current_active_user)
):
    client_data = client.dict()
    return file_db.save_client(client_data)

@app.get(f"{settings.API_V1_STR}/clients/{{client_id}}", response_model=ClientSchema)
async def get_client(
    client_id: int, 
    current_user: dict = Depends(get_current_active_user)
):
    client = file_db.get_client_by_id(client_id)
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    return client

@app.put(f"{settings.API_V1_STR}/clients/{{client_id}}", response_model=ClientSchema)
async def update_client(
    client_id: int,
    client: ClientUpdate,
    current_user: dict = Depends(get_current_active_user)
):
    existing_client = file_db.get_client_by_id(client_id)
    if not existing_client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    client_data = existing_client.copy()
    update_data = client.dict(exclude_unset=True)
    client_data.update(update_data)
    
    return file_db.save_client(client_data)

@app.delete(f"{settings.API_V1_STR}/clients/{{client_id}}")
async def delete_client(
    client_id: int,
    current_user: dict = Depends(get_current_admin_user)
):
    success = file_db.delete_client(client_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    return {"message": "Client deleted successfully"}

# Invoice endpoints
@app.get(f"{settings.API_V1_STR}/invoices", response_model=List[InvoiceSchema])
async def get_invoices(current_user: dict = Depends(get_current_active_user)):
    return file_db.get_invoices()

@app.post(f"{settings.API_V1_STR}/invoices", response_model=InvoiceSchema)
async def create_invoice(
    invoice: InvoiceCreate,
    current_user: dict = Depends(get_current_active_user)
):
    invoice_data = invoice.dict()
    invoice_data["created_by"] = current_user["id"]
    
    # Generate invoice number if not provided
    if not invoice_data.get("invoice_number"):
        invoice_data["invoice_number"] = generate_invoice_number()
    
    return file_db.save_invoice(invoice_data)

@app.get(f"{settings.API_V1_STR}/invoices/{{invoice_id}}", response_model=InvoiceSchema)
async def get_invoice(
    invoice_id: int,
    current_user: dict = Depends(get_current_active_user)
):
    invoice = file_db.get_invoice_by_id(invoice_id)
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    return invoice

@app.put(f"{settings.API_V1_STR}/invoices/{{invoice_id}}", response_model=InvoiceSchema)
async def update_invoice(
    invoice_id: int,
    invoice: InvoiceUpdate,
    current_user: dict = Depends(get_current_active_user)
):
    existing_invoice = file_db.get_invoice_by_id(invoice_id)
    if not existing_invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    invoice_data = existing_invoice.copy()
    update_data = invoice.dict(exclude_unset=True)
    invoice_data.update(update_data)
    
    return file_db.save_invoice(invoice_data)

@app.delete(f"{settings.API_V1_STR}/invoices/{{invoice_id}}")
async def delete_invoice(
    invoice_id: int,
    current_user: dict = Depends(get_current_admin_user)
):
    success = file_db.delete_invoice(invoice_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    return {"message": "Invoice deleted successfully"}

# Dashboard endpoints
@app.get(f"{settings.API_V1_STR}/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(current_user: dict = Depends(get_current_active_user)):
    stats = file_db.get_stats()
    invoices = file_db.get_invoices()
    
    # Calculate monthly revenue
    monthly_revenue = []
    current_year = datetime.now().year
    
    for month in range(1, 13):
        month_invoices = [
            inv for inv in invoices 
            if datetime.fromisoformat(inv["created_at"]).year == current_year and
               datetime.fromisoformat(inv["created_at"]).month == month
        ]
        revenue = sum(inv.get("total_amount", 0) for inv in month_invoices)
        monthly_revenue.append({
            "month": datetime(current_year, month, 1).strftime("%b"),
            "revenue": revenue
        })
    
    return DashboardStats(
        total_invoices=stats["invoices_count"],
        total_revenue=stats["total_revenue"],
        paid_invoices=stats["paid_invoices"],
        pending_invoices=stats["pending_invoices"],
        monthly_revenue=monthly_revenue
    )

# Health check endpoints
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.get(f"{settings.API_V1_STR}/debug/health")
async def debug_health_check():
    """Debug endpoint to check system health"""
    try:
        stats = file_db.get_stats()
        admin_user = file_db.get_user_by_email(settings.ADMIN_EMAIL)
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "database": {
                "status": "file_based_json",
                "stats": stats,
                "admin_user_exists": admin_user is not None,
                "admin_email": settings.ADMIN_EMAIL
            },
            "environment": {
                "api_version": settings.API_V1_STR,
                "token_expire_minutes": settings.ACCESS_TOKEN_EXPIRE_MINUTES
            }
        }
    except Exception as e:
        print(f"Health check failed: {str(e)}")
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
        users = file_db.get_users()
        return {
            "user_count": len(users),
            "users": users
        }
    except Exception as e:
        print(f"Debug users endpoint failed: {str(e)}")
        return {"error": str(e)}


@app.post(f"{settings.API_V1_STR}/logs")
async def ingest_frontend_logs(payload: dict):
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)
