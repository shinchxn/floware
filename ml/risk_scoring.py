"""
FLOWARE ML Pipeline - Composite Risk Scoring Module
EFOS Global Finance Hackathon 2026 - Track 02 (Audit & Risk)
"""

from typing import Dict, Any
from predict import FraudPredictor
from explain import SHAPExplainer

class CompositeRiskEngine:
    """
    Unified risk scoring engine evaluating ML outputs and compliance business rules.
    """
    def __init__(self, model_path: str = None):
        self.predictor = FraudPredictor(model_path)
        self.explainer = SHAPExplainer(model_path)

    def evaluate_transaction(self, transaction: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluate full transaction risk profile.
        """
        prediction = self.predictor.predict_single(transaction)
        explanation = self.explainer.explain_transaction(transaction)

        # Merge results into cohesive assessment payload
        result = {
            **prediction,
            "base_value": explanation["base_value"],
            "feature_impacts": explanation["feature_impacts"],
            "explanation_text": explanation["explanation_text"]
        }
        return result

if __name__ == "__main__":
    engine = CompositeRiskEngine()
    test_tx = {
        'step': 1, 'type': 'TRANSFER', 'amount': 950000.0,
        'oldbalanceOrg': 950000.0, 'newbalanceOrig': 0.0,
        'nameDest': 'C109283', 'oldbalanceDest': 0.0, 'newbalanceDest': 0.0
    }
    eval_res = engine.evaluate_transaction(test_tx)
    print(f"[COMPOSITE RISK ENGINE] Score: {eval_res['risk_score']} | Tier: {eval_res['risk_tier']} | Action: {eval_res['recommended_action']}")
    print(f"[COMPOSITE RISK ENGINE] Explanation: {eval_res['explanation_text']}")
