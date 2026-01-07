import json
import os
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent.parent / "backend"
sys.path.insert(0, str(backend_path))

# Import FastAPI app
from main import app
from mangum import Mangum

# Create Lambda handler
handler = Mangum(app)

def handler(event, context):
    """
    AWS Lambda handler for Netlify Functions
    """
    return handler(event, context)
