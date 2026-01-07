import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./invoice_system.db"
    )
    
    # API
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY",
        "your-secret-key-here-change-in-production"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30 * 24 * 60  # 30 days
    
    # CORS
    BACKEND_CORS_ORIGINS: list = [
        "http://localhost:2004",
        "http://127.0.0.1:2004",
    ]
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 2205
    
    # Admin User
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "admin@aasko.com")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "admin123")
    ADMIN_NAME: str = os.getenv("ADMIN_NAME", "Admin User")
    
    # Company Info
    COMPANY_NAME: str = "Aasko Construction"
    COMPANY_ADDRESS: str = "123 Construction Ave, Building City"
    COMPANY_PHONE: str = "+1-555-0123"
    COMPANY_EMAIL: str = "info@aasko.com"
    COMPANY_WEBSITE: str = "www.aasko.com"
    
    # File Upload
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    UPLOAD_DIR: str = "uploads"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
