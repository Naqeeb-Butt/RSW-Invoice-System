import os
import sys
from pathlib import Path

from mangum import Mangum

# Netlify functions run in an ephemeral environment.
# Use /tmp for file-based storage so the function can write.
os.environ.setdefault("FILE_DB_DIR", "/tmp/invoice_system")

# Add backend to path (repo_root/backend)
repo_root = Path(__file__).resolve().parents[3]
backend_path = repo_root / "backend"
sys.path.insert(0, str(backend_path))

from main import app  # noqa: E402

# Single AWS Lambda handler export
handler = Mangum(app, api_gateway_base_path="/.netlify/functions/api")
