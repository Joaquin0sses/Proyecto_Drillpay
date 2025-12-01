from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np
import os

app = FastAPI(title="DrillPay AI Engine")

# Load model
model_path = "model.pkl"
if os.path.exists(model_path):
    model = joblib.load(model_path)
else:
    # Fallback if model not found (should be created by Dockerfile)
    from sklearn.ensemble import RandomForestClassifier
    model = RandomForestClassifier()
    model.fit([[0, 1, 10], [60, 0, 2]], [0, 1])

class PredictionRequest(BaseModel):
    avg_days_overdue: float
    paid_ratio: float
    total_invoices: int

@app.post("/predict")
def predict_risk(data: PredictionRequest):
    features = np.array([[data.avg_days_overdue, data.paid_ratio, data.total_invoices]])
    prediction = model.predict(features)[0]
    probability = model.predict_proba(features)[0][1] # Probability of class 1 (High Risk)
    
    return {
        "risk_class": int(prediction),
        "risk_score": float(probability),
        "risk_label": "High Risk" if prediction == 1 else "Low Risk"
    }

@app.get("/")
def health_check():
    return {"status": "AI Engine Running"}
