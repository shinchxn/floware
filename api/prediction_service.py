"""
FLOWARE API - Prediction Service Wrapper
EFOS Global Finance Hackathon 2026 - Track 02 (Audit & Risk)
"""

import sys
import os
from typing import Dict, Any, List

# Add ml directory to Python system path
sys.path.append(os.path.join(os.path.dirname(__file__), "../ml"))

from risk_scoring import CompositeRiskEngine

class PredictionService:
    """
    Singleton service manager for ML inference and explanation requests.
    """
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(PredictionService, cls).__new__(cls)
            model_path = os.path.join(os.path.dirname(__file__), "../models/xgboost_model.json")
            cls._instance.engine = CompositeRiskEngine(model_path)
            print("[PREDICTION SERVICE] Service initialized with XGBoost model.")
        return cls._instance

    def predict_transaction(self, transaction: Dict[str, Any]) -> Dict[str, Any]:
        return self.engine.evaluate_transaction(transaction)

    def predict_batch(self, transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return [self.engine.evaluate_transaction(tx) for tx in transactions]

get_prediction_service = PredictionService
