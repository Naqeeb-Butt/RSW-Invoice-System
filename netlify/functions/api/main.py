import json
import os
import sys
from pathlib import Path
from datetime import datetime

# Add backend to path
backend_path = Path(__file__).parent.parent.parent / "backend"
sys.path.insert(0, str(backend_path))

# Import Netlify database
from database_netlify import netlify_db

# Import FastAPI app
from main import app
from mangum import Mangum

# Create Lambda handler
handler = Mangum(app)

def handler(event, context):
    """
    AWS Lambda handler for Netlify Functions
    """
    # Initialize admin user for Netlify database
    from models import User
    from auth import get_password_hash
    from config import settings
    
    # Check if admin user exists in Netlify database
    admin_user = netlify_db.get_user_by_email(settings.ADMIN_EMAIL)
    if not admin_user:
        print(f"Creating admin user: {settings.ADMIN_EMAIL}")
        admin_user_data = {
            "id": 1,
            "email": settings.ADMIN_EMAIL,
            "name": settings.ADMIN_NAME,
            "hashed_password": get_password_hash(settings.ADMIN_PASSWORD),
            "is_active": True,
            "created_at": datetime.utcnow().isoformat()
        }
        netlify_db.save_user(admin_user_data)
        print("Admin user created successfully")
    else:
        print(f"Admin user already exists: {settings.ADMIN_EMAIL}")
    
    return handler(event, context)
