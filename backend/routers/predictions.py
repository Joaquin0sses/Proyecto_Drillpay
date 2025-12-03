from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
import database, models, schemas, auth
import requests
import os
from datetime import datetime

router = APIRouter(
    prefix="/predictions",
    tags=["predictions"]
)

AI_ENGINE_URL = os.getenv("AI_ENGINE_URL", "http://ai_engine:8000")

def calculate_client_features(client_id: int, db: Session):
    invoices = db.query(models.Invoice).filter(models.Invoice.client_id == client_id).all()
    
    if not invoices:
        return None
        
    total_invoices = len(invoices)
    paid_invoices = [inv for inv in invoices if inv.status == "PAID"]
    paid_count = len(paid_invoices)
    
    paid_ratio = paid_count / total_invoices if total_invoices > 0 else 0
    
    total_days_overdue = 0
    overdue_count = 0
    
    for inv in invoices:
        if inv.status == "OVERDUE":
            days = (datetime.now().date() - inv.due_date).days
            total_days_overdue += days
            overdue_count += 1
        elif inv.status == "PAID" and inv.issue_date: 
            # Ideally we'd have a paid_date, but for now we can't calculate delay for paid ones 
            # without that field. We'll focus on current overdue status.
            pass
            
    avg_days_overdue = total_days_overdue / overdue_count if overdue_count > 0 else 0
    
    return {
        "avg_days_overdue": avg_days_overdue,
        "paid_ratio": paid_ratio,
        "total_invoices": total_invoices
    }

@router.post("/analyze/{client_id}", response_model=schemas.Prediction)
def analyze_client_risk(client_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    # 1. Calculate features
    features = calculate_client_features(client_id, db)
    if not features:
        raise HTTPException(status_code=404, detail="Not enough data to analyze client")
        
    # 2. Call AI Engine or Use Heuristic
    # We will prioritize a local heuristic to ensure realistic values for the demo
    # since the AI engine might be unreachable or untrained.
    
    # SIMULATION MODE: Weighted random distribution as requested
    # 60% Low, 30% Medium, 10% High
    import random
    rand_val = random.random()
    
    if rand_val < 0.6:
        # Low Risk (0.0 - 0.3)
        heuristic_score = round(random.uniform(0.05, 0.29), 4)
    elif rand_val < 0.9:
        # Medium Risk (0.3 - 0.7)
        heuristic_score = round(random.uniform(0.31, 0.69), 4)
    else:
        # High Risk (0.7 - 0.99)
        heuristic_score = round(random.uniform(0.71, 0.99), 4)
    
    # Optional: Still try to call AI for logging or future use, but use heuristic for now
    # to satisfy the user's request for "realistic values".
    
    prediction = models.Prediction(
        client_id=client_id,
        risk_score=heuristic_score,
        prediction_date=datetime.utcnow()
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)
    
    return prediction

@router.get("/{client_id}", response_model=schemas.Prediction)
def get_latest_prediction(client_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    prediction = db.query(models.Prediction).filter(
        models.Prediction.client_id == client_id
    ).order_by(models.Prediction.prediction_date.desc()).first()
    
    if not prediction:
        raise HTTPException(status_code=404, detail="No prediction found")
        
    return prediction

@router.post("/analyze-batch")
def analyze_batch(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Get all clients with overdue invoices
    debtors = db.query(models.Client).join(models.Invoice).filter(models.Invoice.status == "OVERDUE").distinct().all()
    
    results = []
    for client in debtors:
        try:
            # Reuse existing analysis logic
            # We call the internal function, not the route handler to avoid dependency injection issues
            features = calculate_client_features(client.id, db)
            if features:
                # SIMULATION MODE: Weighted random distribution as requested
                # 60% Low, 30% Medium, 10% High
                import random
                rand_val = random.random()
                
                if rand_val < 0.6:
                    # Low Risk (0.0 - 0.3)
                    heuristic_score = round(random.uniform(0.05, 0.29), 4)
                elif rand_val < 0.9:
                    # Medium Risk (0.3 - 0.7)
                    heuristic_score = round(random.uniform(0.31, 0.69), 4)
                else:
                    # High Risk (0.7 - 0.99)
                    heuristic_score = round(random.uniform(0.71, 0.99), 4)
                
                prediction = models.Prediction(
                    client_id=client.id,
                    risk_score=heuristic_score,
                    prediction_date=datetime.utcnow()
                )
                db.add(prediction)
                results.append({
                    "client_id": client.id,
                    "name": client.name,
                    "risk_score": heuristic_score,
                    "risk_label": "High" if heuristic_score > 0.7 else "Medium" if heuristic_score > 0.3 else "Low"
                })
        except Exception as e:
            print(f"Error analyzing client {client.id}: {e}")
            continue
            
    db.commit()
    return results
