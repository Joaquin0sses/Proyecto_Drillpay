import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import joblib

# Generate dummy data
# Features: [avg_days_overdue, paid_ratio, total_invoices]
# Target: 1 (High Risk), 0 (Low Risk)

X = np.array([
    [0, 1.0, 10],   # Good payer
    [5, 0.8, 5],    # Okay payer
    [30, 0.2, 3],   # Bad payer
    [60, 0.0, 2],   # Very bad payer
    [2, 0.9, 20],   # Good payer
    [15, 0.5, 8]    # Risky
])

y = np.array([0, 0, 1, 1, 0, 1])

model = RandomForestClassifier(n_estimators=10)
model.fit(X, y)

joblib.dump(model, "model.pkl")
print("Model trained and saved to model.pkl")
