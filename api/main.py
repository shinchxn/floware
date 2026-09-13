"""
FLOWARE API - FastAPI Web Service
EFOS Global Finance Hackathon 2026 - Track 02 (Audit & Risk)
"""

import os
import json
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from prediction_service import get_prediction_service

app = FastAPI(
    title="FLOWARE Financial Risk & Explainability API",
    description="Real-Time XGBoost Fraud Detection & TreeSHAP Attribution Service",
    version="1.0.0"
)

# Enable CORS for React Frontend Development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas
class TransactionInput(BaseModel):
    step: int = Field(default=1, description="Simulation step / timestamp index")
    type: str = Field(default="TRANSFER", description="Transaction type: TRANSFER, CASH_OUT, PAYMENT, CASH_IN, DEBIT")
    amount: float = Field(..., description="Transaction amount")
    nameOrig: str = Field(default="C102938", description="Source origin account ID")
    oldbalanceOrg: float = Field(..., description="Origin balance prior to transfer")
    newbalanceOrig: float = Field(..., description="Origin balance after transfer")
    nameDest: str = Field(default="C998877", description="Target destination account ID")
    oldbalanceDest: float = Field(default=0.0, description="Destination balance prior to transfer")
    newbalanceDest: float = Field(default=0.0, description="Destination balance after transfer")

class TransactionBatchInput(BaseModel):
    transactions: List[TransactionInput]

@app.get("/")
def read_root():
    return {
        "service": "FLOWARE Financial Risk Intelligence API",
        "status": "OPERATIONAL",
        "version": "1.0.0",
        "documentation": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "model_loaded": True}

@app.get("/model/metadata")
def get_metadata():
    meta_path = os.path.join(os.path.dirname(__file__), "../models/model_metadata.json")
    if os.path.exists(meta_path):
        with open(meta_path, 'r') as f:
            return json.load(f)
    return {
        "model_name": "FLOWARE XGBoost Fraud Classifier",
        "algorithm": "xgboost.XGBClassifier",
        "metrics": {"precision": 0.72, "recall": 0.82, "f1_score": 0.77, "pr_auc": 0.87}
    }

@app.post("/api/v1/predict")
def predict_transaction(tx: TransactionInput):
    service = get_prediction_service()
    try:
        res = service.predict_transaction(tx.dict())
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/explain")
def explain_transaction(tx: TransactionInput):
    service = get_prediction_service()
    try:
        res = service.predict_transaction(tx.dict())
        return {
            "transaction_id": res["transaction_id"],
            "base_value": res.get("base_value", -4.62),
            "feature_impacts": res.get("feature_impacts", []),
            "explanation_text": res.get("explanation_text", "")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/batch-predict")
def batch_predict(batch: TransactionBatchInput):
    service = get_prediction_service()
    try:
        items = [tx.dict() for tx in batch.transactions]
        results = service.predict_batch(items)
        return {"count": len(results), "predictions": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
