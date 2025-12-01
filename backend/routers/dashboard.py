from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
import database, models, auth

router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"]
)

@router.get("/stats")
def get_stats(
    client_id: int = None, 
    status: str = None, 
    start_date: str = None, 
    end_date: str = None,
    db: Session = Depends(database.get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    query = db.query(models.Invoice)
    
    if client_id:
        query = query.filter(models.Invoice.client_id == client_id)
    if status:
        query = query.filter(models.Invoice.status == status)
    if start_date:
        query = query.filter(models.Invoice.issue_date >= start_date)
    if end_date:
        query = query.filter(models.Invoice.issue_date <= end_date)
        
    total_invoices = query.count()
    
    if client_id:
        total_clients = 1
    else:
        total_clients = db.query(models.Client).count()
        
    pending_amount = query.filter(models.Invoice.status == "PENDING").with_entities(func.sum(models.Invoice.amount)).scalar() or 0
    overdue_count = query.filter(models.Invoice.status == "OVERDUE").count()
    
    return {
        "total_invoices": total_invoices,
        "total_clients": total_clients,
        "pending_amount": pending_amount,
        "overdue_count": overdue_count
    }

@router.get("/charts")
def get_charts_data(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Paid vs Unpaid (Pending + Overdue)
    paid = db.query(func.sum(models.Invoice.amount)).filter(models.Invoice.status == "PAID").scalar() or 0
    unpaid = db.query(func.sum(models.Invoice.amount)).filter(models.Invoice.status.in_(["PENDING", "OVERDUE"])).scalar() or 0
    
    return {
        "pie_chart": [
            {"name": "Pagado", "value": paid},
            {"name": "Por Cobrar", "value": unpaid}
        ]
    }

@router.get("/top-debtors")
def get_top_debtors(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Top 5 clients by overdue amount
    results = db.query(
        models.Client.name,
        func.sum(models.Invoice.amount).label("total_debt")
    ).join(models.Invoice).filter(
        models.Invoice.status == "OVERDUE"
    ).group_by(models.Client.id).order_by(desc("total_debt")).limit(5).all()
    
    return [{"name": r[0], "debt": r[1]} for r in results]
