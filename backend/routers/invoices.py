from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from typing import List
import database, models, schemas, auth
import pandas as pd
import io
from datetime import datetime

router = APIRouter(
    prefix="/invoices",
    tags=["invoices"]
)

@router.get("/", response_model=List[schemas.Invoice])
def read_invoices(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    invoices = db.query(models.Invoice).offset(skip).limit(limit).all()
    return invoices

@router.post("/upload")
async def upload_invoices(file: UploadFile = File(...), db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    if not file.filename.endswith(('.csv', '.xlsx')):
        raise HTTPException(status_code=400, detail="Invalid file format")
    
    contents = await file.read()
    if file.filename.endswith('.csv'):
        df = pd.read_csv(io.BytesIO(contents))
    else:
        df = pd.read_excel(io.BytesIO(contents))
        
    # Expected columns: NumDoc, MovFe, MovFv, Monto, Tipo, Nombre, Rut, Ciudad, Pais, Dirreccion, Fono, EMail, Cuenta de abono
    
    results = []
    for index, row in df.iterrows():
        # Find or Create Client
        # Using Rut as unique identifier if present, otherwise email
        rut = str(row.get('Rut', '')).strip()
        email = str(row.get('EMail', '')).strip()
        
        client = None
        if rut:
            client = db.query(models.Client).filter(models.Client.rut == rut).first()
        
        if not client and email:
             client = db.query(models.Client).filter(models.Client.email == email).first()

        if not client:
            client = models.Client(
                name=row.get('Nombre', 'Unknown'),
                email=email if email else f"unknown_{index}@example.com",
                rut=rut,
                phone=str(row.get('Fono', '')),
                address=str(row.get('Dirreccion', '')),
                city=str(row.get('Ciudad', '')),
                country=str(row.get('Pais', ''))
            )
            db.add(client)
            db.commit()
            db.refresh(client)
            
        # Create Invoice
        # Parse dates
        try:
            issue_date = pd.to_datetime(row.get('MovFe'), dayfirst=True).date()
            due_date = pd.to_datetime(row.get('MovFv'), dayfirst=True).date()
        except:
            issue_date = datetime.now().date()
            due_date = datetime.now().date()

        # Determine status
        status = "PENDING"
        if due_date < datetime.now().date():
            status = "OVERDUE"
            
        invoice = models.Invoice(
            client_id=client.id,
            document_number=str(row.get('NumDoc', '')),
            amount=float(row.get('Monto', 0)),
            issue_date=issue_date,
            due_date=due_date,
            type=str(row.get('Tipo', '')),
            account_number=str(row.get('Cuenta de abono', '')),
            status=status
        )
        db.add(invoice)
        results.append(invoice)
    
    db.commit()
    return {"message": f"Uploaded {len(results)} invoices"}

@router.post("/create", response_model=schemas.Invoice)
def create_invoice(invoice: schemas.InvoiceCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_invoice = models.Invoice(
        client_id=invoice.client_id,
        amount=invoice.amount,
        issue_date=invoice.issue_date,
        due_date=invoice.due_date,
        status=invoice.status
    )
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    return db_invoice
