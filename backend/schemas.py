from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str
    is_active: bool = True
    is_admin: bool = False

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None
    password: Optional[str] = None

class User(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Client schemas
class ClientBase(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    ntn: Optional[str] = None
    gst: Optional[str] = None
    vendor_code: Optional[str] = None

class ClientCreate(ClientBase):
    pass

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    ntn: Optional[str] = None
    gst: Optional[str] = None
    vendor_code: Optional[str] = None

class Client(ClientBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Invoice Item schemas
class InvoiceItemBase(BaseModel):
    description: str
    quantity: float
    unit: str
    unit_price: float
    tax_rate: float = 0.0

class InvoiceItemCreate(InvoiceItemBase):
    pass

class InvoiceItem(InvoiceItemBase):
    id: int
    total_price: float
    tax_amount: float
    invoice_id: int
    
    class Config:
        from_attributes = True

# Invoice schemas
class InvoiceBase(BaseModel):
    invoice_number: str
    po_number: Optional[str] = None
    invoice_date: datetime
    due_date: Optional[datetime] = None
    status: str = "draft"
    notes: Optional[str] = None
    client_id: int

class InvoiceCreate(InvoiceBase):
    items: List[InvoiceItemCreate]

class InvoiceUpdate(BaseModel):
    po_number: Optional[str] = None
    invoice_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    client_id: Optional[int] = None
    items: Optional[List[InvoiceItemCreate]] = None

class Invoice(InvoiceBase):
    id: int
    subtotal: float
    tax_amount: float
    total_amount: float
    amount_in_words: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    created_by: int
    client: Client
    items: List[InvoiceItem]
    
    class Config:
        from_attributes = True

# Auth schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Dashboard schemas
class DashboardStats(BaseModel):
    total_invoices: int
    total_amount: float
    paid_invoices: int
    pending_invoices: int
    overdue_invoices: int
    
class MonthlyRevenue(BaseModel):
    month: str
    revenue: float

class DashboardData(BaseModel):
    stats: DashboardStats
    monthly_revenue: List[MonthlyRevenue]
    recent_invoices: List[Invoice]
