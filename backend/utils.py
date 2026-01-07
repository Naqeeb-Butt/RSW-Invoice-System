from sqlalchemy.orm import Session
from models import Invoice, InvoiceItem, User
from schemas import InvoiceCreate, InvoiceItemCreate
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

def generate_invoice_number(db: Session) -> str:
    # Get the last invoice number
    last_invoice = db.query(Invoice).order_by(Invoice.id.desc()).first()
    
    if last_invoice:
        # Extract number from last invoice and increment
        try:
            last_num = int(last_invoice.invoice_number.split('-')[-1])
            new_num = last_num + 1
        except:
            new_num = 1
    else:
        new_num = 1
    
    return f"INV-{new_num:04d}"

def create_invoice_with_items(db: Session, invoice: InvoiceCreate, user_id: int) -> Invoice:
    # Calculate totals
    subtotal, tax_amount, total_amount = calculate_invoice_totals(invoice.items)
    
    # Create invoice
    db_invoice = Invoice(
        invoice_number=invoice.invoice_number,
        po_number=invoice.po_number,
        invoice_date=invoice.invoice_date,
        due_date=invoice.due_date,
        status=invoice.status,
        notes=invoice.notes,
        client_id=invoice.client_id,
        created_by=user_id,
        subtotal=subtotal,
        tax_amount=tax_amount,
        total_amount=total_amount,
        amount_in_words=number_to_words(total_amount)
    )
    
    db.add(db_invoice)
    db.flush()  # Get the ID without committing
    
    # Create invoice items
    for item_data in invoice.items:
        item_total = item_data.quantity * item_data.unit_price
        item_tax = item_total * (item_data.tax_rate / 100)
        
        db_item = InvoiceItem(
            description=item_data.description,
            quantity=item_data.quantity,
            unit=item_data.unit,
            unit_price=item_data.unit_price,
            tax_rate=item_data.tax_rate,
            total_price=item_total,
            tax_amount=item_tax,
            invoice_id=db_invoice.id
        )
        db.add(db_item)
    
    db.commit()
    db.refresh(db_invoice)
    return db_invoice
