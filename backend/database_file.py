import json
import os
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime
import hashlib
import secrets

class FileDatabase:
    """File-based database system for production deployment"""
    
    def __init__(self, data_dir: str = "data"):
        effective_dir = os.getenv("FILE_DB_DIR", data_dir)
        self.data_dir = Path(effective_dir)
        self.data_dir.mkdir(exist_ok=True)
        self.users_file = self.data_dir / "users.json"
        self.clients_file = self.data_dir / "clients.json"
        self.invoices_file = self.data_dir / "invoices.json"
        self._initialize_files()
    
    def _initialize_files(self):
        """Initialize JSON files if they don't exist"""
        for file_path in [self.users_file, self.clients_file, self.invoices_file]:
            if not file_path.exists():
                with open(file_path, 'w') as f:
                    json.dump([], f, indent=2)
    
    def _read_json(self, file_path: Path) -> List[Dict]:
        """Read JSON file safely"""
        try:
            with open(file_path, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return []
    
    def _write_json(self, file_path: Path, data: List[Dict]):
        """Write JSON file safely"""
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2, default=str)
    
    def get_users(self) -> List[Dict]:
        """Get all users"""
        return self._read_json(self.users_file)
    
    def save_user(self, user_data: Dict) -> Dict:
        """Save or update user"""
        users = self.get_users()
        
        # Check if user exists
        for i, user in enumerate(users):
            if user.get("email") == user_data.get("email"):
                # Update existing user
                user_data["updated_at"] = datetime.utcnow().isoformat()
                users[i] = user_data
                break
        else:
            # Add new user
            user_data["created_at"] = datetime.utcnow().isoformat()
            user_data["updated_at"] = datetime.utcnow().isoformat()
            if "id" not in user_data:
                user_data["id"] = len(users) + 1
            users.append(user_data)
        
        self._write_json(self.users_file, users)
        return user_data
    
    def get_user_by_email(self, email: str) -> Optional[Dict]:
        """Get user by email"""
        users = self.get_users()
        for user in users:
            if user.get("email") == email:
                return user
        return None
    
    def get_user_by_id(self, user_id: int) -> Optional[Dict]:
        """Get user by ID"""
        users = self.get_users()
        for user in users:
            if user.get("id") == user_id:
                return user
        return None
    
    def delete_user(self, email: str) -> bool:
        """Delete user by email"""
        users = self.get_users()
        original_length = len(users)
        users = [user for user in users if user.get("email") != email]
        
        if len(users) < original_length:
            self._write_json(self.users_file, users)
            return True
        return False
    
    def get_clients(self) -> List[Dict]:
        """Get all clients"""
        return self._read_json(self.clients_file)
    
    def save_client(self, client_data: Dict) -> Dict:
        """Save or update client"""
        clients = self.get_clients()
        
        # Check if client exists
        for i, client in enumerate(clients):
            if client.get("id") == client_data.get("id"):
                # Update existing client
                client_data["updated_at"] = datetime.utcnow().isoformat()
                clients[i] = client_data
                break
        else:
            # Add new client
            client_data["created_at"] = datetime.utcnow().isoformat()
            client_data["updated_at"] = datetime.utcnow().isoformat()
            if "id" not in client_data:
                client_data["id"] = len(clients) + 1
            clients.append(client_data)
        
        self._write_json(self.clients_file, clients)
        return client_data
    
    def get_client_by_id(self, client_id: int) -> Optional[Dict]:
        """Get client by ID"""
        clients = self.get_clients()
        for client in clients:
            if client.get("id") == client_id:
                return client
        return None
    
    def delete_client(self, client_id: int) -> bool:
        """Delete client by ID"""
        clients = self.get_clients()
        original_length = len(clients)
        clients = [client for client in clients if client.get("id") != client_id]
        
        if len(clients) < original_length:
            self._write_json(self.clients_file, clients)
            return True
        return False
    
    def get_invoices(self) -> List[Dict]:
        """Get all invoices"""
        return self._read_json(self.invoices_file)
    
    def save_invoice(self, invoice_data: Dict) -> Dict:
        """Save or update invoice"""
        invoices = self.get_invoices()
        
        # Check if invoice exists
        for i, invoice in enumerate(invoices):
            if invoice.get("id") == invoice_data.get("id"):
                # Update existing invoice
                invoice_data["updated_at"] = datetime.utcnow().isoformat()
                invoices[i] = invoice_data
                break
        else:
            # Add new invoice
            invoice_data["created_at"] = datetime.utcnow().isoformat()
            invoice_data["updated_at"] = datetime.utcnow().isoformat()
            if "id" not in invoice_data:
                invoice_data["id"] = len(invoices) + 1
            invoices.append(invoice_data)
        
        self._write_json(self.invoices_file, invoices)
        return invoice_data
    
    def get_invoice_by_id(self, invoice_id: int) -> Optional[Dict]:
        """Get invoice by ID"""
        invoices = self.get_invoices()
        for invoice in invoices:
            if invoice.get("id") == invoice_id:
                return invoice
        return None
    
    def get_invoice_by_number(self, invoice_number: str) -> Optional[Dict]:
        """Get invoice by number"""
        invoices = self.get_invoices()
        for invoice in invoices:
            if invoice.get("invoice_number") == invoice_number:
                return invoice
        return None
    
    def delete_invoice(self, invoice_id: int) -> bool:
        """Delete invoice by ID"""
        invoices = self.get_invoices()
        original_length = len(invoices)
        invoices = [invoice for invoice in invoices if invoice.get("id") != invoice_id]
        
        if len(invoices) < original_length:
            self._write_json(self.invoices_file, invoices)
            return True
        return False
    
    def get_stats(self) -> Dict:
        """Get database statistics"""
        users = self.get_users()
        clients = self.get_clients()
        invoices = self.get_invoices()
        
        # Calculate invoice stats
        total_revenue = sum(inv.get("total_amount", 0) for inv in invoices)
        paid_count = len([inv for inv in invoices if inv.get("status") == "paid"])
        pending_count = len([inv for inv in invoices if inv.get("status") in ["draft", "sent"]])
        
        return {
            "users_count": len(users),
            "clients_count": len(clients),
            "invoices_count": len(invoices),
            "total_revenue": total_revenue,
            "paid_invoices": paid_count,
            "pending_invoices": pending_count
        }

# Global instance
file_db = FileDatabase()
