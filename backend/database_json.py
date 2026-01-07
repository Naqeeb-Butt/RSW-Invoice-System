import json
import os
from pathlib import Path
from typing import Dict, List, Any
from datetime import datetime

class JSONDatabase:
    """Simple JSON-based database for Netlify functions"""
    
    def __init__(self, data_file: str = "invoice_data.json"):
        self.data_file = Path("/tmp") / data_file
        self.data = self._load_data()
    
    def _load_data(self) -> Dict[str, Any]:
        """Load data from JSON file"""
        try:
            if self.data_file.exists():
                with open(self.data_file, 'r') as f:
                    return json.load(f)
        except Exception as e:
            print(f"Error loading data: {e}")
            return {"users": [], "clients": [], "invoices": []}
    
    def _save_data(self):
        """Save data to JSON file"""
        try:
            # Ensure directory exists
            self.data_file.parent.mkdir(parents=True, exist_ok=True)
            with open(self.data_file, 'w') as f:
                json.dump(self.data, f, indent=2, default=str)
        except Exception as e:
            print(f"Error saving data: {e}")
    
    def get_users(self) -> List[Dict]:
        return self.data.get("users", [])
    
    def save_user(self, user_data: Dict):
        users = self.get_users()
        # Check if user already exists
        for i, user in enumerate(users):
            if user.get("email") == user_data.get("email"):
                users[i] = user_data
                break
        else:
            users.append(user_data)
        
        self.data["users"] = users
        self._save_data()
    
    def get_user_by_email(self, email: str) -> Dict:
        users = self.get_users()
        for user in users:
            if user.get("email") == email:
                return user
        return None
    
    def get_clients(self) -> List[Dict]:
        return self.data.get("clients", [])
    
    def save_client(self, client_data: Dict):
        clients = self.get_clients()
        clients.append(client_data)
        self.data["clients"] = clients
        self._save_data()
    
    def get_invoices(self) -> List[Dict]:
        return self.data.get("invoices", [])
    
    def save_invoice(self, invoice_data: Dict):
        invoices = self.get_invoices()
        invoices.append(invoice_data)
        self.data["invoices"] = invoices
        self._save_data()

# Global instance
json_db = JSONDatabase()
