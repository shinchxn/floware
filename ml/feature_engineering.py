"""
FLOWARE ML Pipeline - Feature Engineering Module
EFOS Global Finance Hackathon 2026 - Track 02 (Audit & Risk)
"""

import pandas as pd
import numpy as np
from typing import List

FEATURE_NAMES = [
    'step',
    'type_TRANSFER',
    'type_CASH_OUT',
    'type_PAYMENT',
    'type_CASH_IN',
    'type_DEBIT',
    'amount',
    'oldbalanceOrg',
    'newbalanceOrig',
    'oldbalanceDest',
    'newbalanceDest',
    'errorBalanceOrig',
    'errorBalanceDest',
    'log_amount',
    'is_merchant_dest',
    'orig_zero_after',
    'dest_zero_before'
]

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Extract domain-specific fraud indicators and balance error features.
    """
    X = df.copy()

    # 1. Domain Balance Error Features
    # In PaySim, fraudulent transfers often wipe origin balances (newbalanceOrig = 0) 
    # regardless of starting balance, resulting in an exact balance error match.
    X['errorBalanceOrig'] = X['newbalanceOrig'] + X['amount'] - X['oldbalanceOrg']
    X['errorBalanceDest'] = X['oldbalanceDest'] + X['amount'] - X['newbalanceDest']

    # 2. Log-scaled Amount
    X['log_amount'] = np.log1p(np.maximum(0.0, X['amount']))

    # 3. Categorical One-Hot Encoding for Transaction Types
    types = ['TRANSFER', 'CASH_OUT', 'PAYMENT', 'CASH_IN', 'DEBIT']
    for t in types:
        X[f'type_{t}'] = (X['type'] == t).astype(int)

    # 4. Account Identity Prefix Indicators
    X['is_merchant_dest'] = X['nameDest'].astype(str).str.startswith('M').astype(int)

    # 5. Zero-Balance Anomaly Indicators
    X['orig_zero_after'] = (X['newbalanceOrig'] == 0.0).astype(int)
    X['dest_zero_before'] = (X['oldbalanceDest'] == 0.0).astype(int)

    # Reorder and filter down strictly to input model features
    missing_feats = [col for col in FEATURE_NAMES if col not in X.columns]
    for feat in missing_feats:
        X[feat] = 0.0

    return X[FEATURE_NAMES]

def get_feature_names() -> List[str]:
    """
    Return list of feature names used by XGBoost model.
    """
    return list(FEATURE_NAMES)

if __name__ == "__main__":
    print("[FEATURE ENGINEERING] Running self-test verification...")
    sample_tx = pd.DataFrame([{
        'step': 1, 'type': 'TRANSFER', 'amount': 250000.0,
        'nameOrig': 'C102938', 'oldbalanceOrg': 250000.0, 'newbalanceOrig': 0.0,
        'nameDest': 'C998877', 'oldbalanceDest': 0.0, 'newbalanceDest': 0.0
    }])
    feats = engineer_features(sample_tx)
    print(f"[FEATURE ENGINEERING] Extracted {feats.shape[1]} features:")
    print(feats.iloc[0].to_dict())
