from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import database, models, auth
import smtplib
from email.mime.text import MIMEText
import os

router = APIRouter(
    prefix="/emails",
    tags=["emails"]
)

class TemplateUpdate(BaseModel):
    subject: str
    body: str
    include_table: bool = False

@router.get("/template")
def get_template(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    template = db.query(models.EmailTemplate).first()
    if not template:
        # Create default if not exists
        template = models.EmailTemplate(name="default")
        db.add(template)
        db.commit()
        db.refresh(template)
    return template

@router.post("/template")
def update_template(data: TemplateUpdate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    template = db.query(models.EmailTemplate).first()
    if not template:
        template = models.EmailTemplate(name="default")
        db.add(template)
    
    template.subject = data.subject
    template.body = data.body
    template.include_table = 1 if data.include_table else 0
    db.commit()
    return {"message": "Template updated"}

@router.post("/send/{client_id}")
def send_reminder(client_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
        
    # Get overdue invoices
    invoices = db.query(models.Invoice).filter(
        models.Invoice.client_id == client_id,
        models.Invoice.status == "OVERDUE"
    ).all()
    
    if not invoices:
        return {"message": "No overdue invoices for this client"}
        
    total_amount = sum(inv.amount for inv in invoices)
    
    # Get Template
    template = db.query(models.EmailTemplate).first()
    if not template:
        template = models.EmailTemplate() # Use defaults
        
    # Format message
    subject = template.subject
    body_content = template.body.format(
        cliente=client.name,
        monto=f"${total_amount:,.0f}",
        cantidad_facturas=len(invoices)
    )

    # Generate HTML Table if requested
    html_table = ""
    if template.include_table:
        html_table = """
        <br>
        <h3>Detalle de Facturas Vencidas</h3>
        <table style="width:100%; border-collapse: collapse; border: 1px solid #ddd; font-family: Arial, sans-serif;">
            <thead style="background-color: #f2f2f2;">
                <tr>
                    <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">N° Doc</th>
                    <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Vencimiento</th>
                    <th style="padding: 12px; border: 1px solid #ddd; text-align: right;">Monto</th>
                </tr>
            </thead>
            <tbody>
        """
        for inv in invoices:
            html_table += f"""
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;">{inv.document_number or 'S/N'}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">{inv.due_date}</td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${inv.amount:,.0f}</td>
                </tr>
            """
        html_table += """
            </tbody>
        </table>
        <br>
        """

    final_body = f"{body_content}\n{html_table}"
    
    # Send Email (Mock or Real)
    print(f"--- SENDING EMAIL TO {client.email} ---")
    print(f"Subject: {subject}")
    print(f"Body: {final_body}")
    print("---------------------------------------")
    
    # Record notification
    for inv in invoices:
        notif = models.Notification(invoice_id=inv.id, type="EMAIL", status="SENT")
        db.add(notif)
    
    db.commit()
    
    return {"message": f"Email sent to {client.email}"}
