from schemas import InvoiceCreate, InvoiceItemCreate
from database_file import file_db
from typing import List
import inflect

p = inflect.engine()

def calculate_invoice_totals(items: List[InvoiceItemCreate]) -> tuple:
    subtotal = 0.0
    total_tax = 0.0
    
    for item in items:
        item_total = item.quantity * item.unit_price
        item_tax = item_total * (item.tax_rate / 100)
        subtotal += item_total
        total_tax += item_tax
    
    total = subtotal + total_tax
    return subtotal, total_tax, total

def number_to_words(number: float) -> str:
    try:
        # Convert to integer for words, handle decimals separately
        integer_part = int(number)
        decimal_part = round((number - integer_part) * 100)
        
        words = p.number_to_words(integer_part, andword="").capitalize()
        
        if decimal_part > 0:
            decimal_words = p.number_to_words(decimal_part, andword="")
            words += f" and {decimal_words}/100"
        
        words += " Only"
        return words
    except:
        return str(number)

def generate_invoice_number() -> str:
    # Get last invoice number from file database
    invoices = file_db.get_invoices()
    
    if invoices:
        # Extract number from last invoice and increment
        try:
            last_invoice = max(invoices, key=lambda x: x.get("id", 0))
            last_num = int(last_invoice.get("invoice_number", "INV-0000").split('-')[-1])
            new_num = last_num + 1
        except:
            new_num = 1
    else:
        new_num = 1
    
    return f"INV-{new_num:04d}"
