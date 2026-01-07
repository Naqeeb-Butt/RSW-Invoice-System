import json
import os
from pathlib import Path
from typing import Dict, List, Any
from datetime import datetime

class NetlifyDatabase:
    """Netlify-compatible database using file storage"""
    
    def __init__(self):
        # Use Netlify's /tmp directory for persistence
        self.base_dir = Path("/tmp")
        self.users_file = self.base_dir / "users.json"
        self.clients_file = self.base_dir / "clients.json"
        self.invoices_file = self.base_dir / "invoices.json"
        
        # Initialize files
        self._init_files()
    
    def _init_files(self):
        """Initialize JSON files if they don't exist"""
        self.base_dir.mkdir(parents=True, exist_ok=True)
        
        for file_path in [self.users_file, self.clients_file, self.invoices_file]:
            if not file_path.exists():
                with open(file_path, 'w') as f:
                    json.dump([], f)
    
    def _read_json(self, file_path: Path) -> List[Dict]:
        """Read JSON file"""
        try:
            if file_path.exists():
                with open(file_path, 'r') as f:
                    return json.load(f)
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
            return []
    
    def _write_json(self, file_path: Path, data: List[Dict]):
        """Write JSON file"""
        try:
            with open(file_path, 'w') as f:
                json.dump(data, f, indent=2, default=str)
        except Exception as e:
            print(f"Error writing {file_path}: {e}")
    
    def get_users(self) -> List[Dict]:
        return self._read_json(self.users_file)
    
    def save_user(self, user_data: Dict):
        users = self.get_users()
        # Remove existing user with same email
        users = [u for u in users if u.get("email") != user_data.get("email")]
        users.append(user_data)
        self._write_json(self.users_file, users)
    
    def get_user_by_email(self, email: str) -> Dict:
        users = self.get_users()
        for user in users:
            if user.get("email") == email:
                return user
        return None
    
    def get_clients(self) -> List[Dict]:
        return self._read_json(self.clients_file)
    
    def save_client(self, client_data: Dict):
        clients = self.get_clients()
        clients.append(client_data)
        self._write_json(self.clients_file, clients)
    
    def get_invoices(self) -> List[Dict]:
        return self._read_json(self.invoices_file)
    
    def save_invoice(self, invoice_data: Dict):
        invoices = self.get_invoices()
        invoices.append(invoice_data)
        self._write_json(self.invoices_file, invoices)

# Global instance
netlify_db = NetlifyDatabase()
