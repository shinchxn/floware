"""
FLOWARE ML Pipeline - Prediction & Inference Engine
EFOS Global Finance Hackathon 2026 - Track 02 (Audit & Risk)
"""

import os
import json
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Union

from feature_engineering import engineer_features, get_feature_names

class FraudPredictor:
    """
    Production inference engine for FLOWARE transaction risk scoring.
    """
    def __init__(self, model_path: str = None):
        self.model_path = model_path or self._find_default_model_path()
        self.model = None
        self.feature_names = get_feature_names()
        self.load_model()

    def _find_default_model_path(self) -> str:
        possible_paths = [
            os.path.join(os.path.dirname(__file__), "../models/xgboost_model.json"),
            os.path.join(os.path.dirname(__file__), "../frontend/public/data/model_xgboost.json"),
            "models/xgboost_model.json"
        ]
        for path in possible_paths:
            if os.path.exists(path):
                return path
        return possible_paths[0]

    def load_model(self):
        """
        Load XGBoost model JSON into memory.
        """
        if os.path.exists(self.model_path):
            try:
                import xgboost as xgb
                self.model = xgb.Booster()
                self.model.load_model(self.model_path)
                print(f"[PREDICTOR] Successfully loaded XGBoost model from: {self.model_path}")
            except Exception as e:
                print(f"[PREDICTOR WARNING] Failed to load XGBoost Booster ({e}). Using heuristic model.")
                self.model = None
        else:
            print(f"[PREDICTOR WARNING] Model file not found at {self.model_path}. Using heuristic fallback.")

    def predict_single(self, transaction: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict risk score and recommended action for a single transaction.
        """
        df_input = pd.DataFrame([transaction])
        X_feats = engineer_features(df_input)

        if self.model is not None:
            import xgboost as xgb
            dmatrix = xgb.DMatrix(X_feats, feature_names=self.feature_names)
            prob = float(self.model.predict(dmatrix)[0])
        else:
            # High-precision heuristic fallback if XGBoost binary C++ lib is unlinked
            prob = self._heuristic_predict(transaction)

        risk_score = int(round(prob * 100))
        risk_tier = "HIGH" if prob > 0.70 else "MEDIUM" if prob > 0.35 else "LOW"
        action = "BLOCK" if prob > 0.70 else "REVIEW" if prob > 0.35 else "APPROVE"

        return {
            "transaction_id": transaction.get("step", "TX_001"),
            "predicted_probability": round(prob, 4),
            "risk_score": risk_score,
            "risk_tier": risk_tier,
            "recommended_action": action,
            "is_flagged": prob > 0.70
        }

    def _heuristic_predict(self, tx: Dict[str, Any]) -> float:
        """
        Domain heuristic prediction fallback mimicking PaySim XGBoost decision tree logic.
        """
        tx_type = str(tx.get('type', '')).upper()
        amount = float(tx.get('amount', 0.0))
        old_orig = float(tx.get('oldbalanceOrg', 0.0))
        new_orig = float(tx.get('newbalanceOrig', 0.0))

        if tx_type not in ['TRANSFER', 'CASH_OUT']:
            return 0.02

        # Check balance wipe anomaly
        balance_err = abs(new_orig + amount - old_orig)
        if tx_type == 'TRANSFER' and new_orig == 0.0 and old_orig > 0:
            if amount > 50000.0 or balance_err < 1.0:
                return 0.94
        
        if tx_type == 'CASH_OUT' and old_orig == 0.0 and amount > 100000.0:
            return 0.88

        if amount > 500000.0:
            return 0.75

        return 0.15

if __name__ == "__main__":
    predictor = FraudPredictor()
    sample_tx = {
        'step': 1, 'type': 'TRANSFER', 'amount': 180000.0,
        'oldbalanceOrg': 180000.0, 'newbalanceOrig': 0.0,
        'nameDest': 'C998877', 'oldbalanceDest': 0.0, 'newbalanceDest': 0.0
    }
    res = predictor.predict_single(sample_tx)
    print("[PREDICTOR TEST RESULT]", json.dumps(res, indent=2))
