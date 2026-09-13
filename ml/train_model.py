"""
FLOWARE ML Pipeline - Model Training Script
EFOS Global Finance Hackathon 2026 - Track 02 (Audit & Risk)
"""

import os
import json
import argparse
import numpy as np
import pandas as pd
from typing import Dict, Any

from data_loader import load_paysim_data, get_train_val_split, TARGET_COLUMN
from feature_engineering import engineer_features, get_feature_names

def train_xgboost_model(data_path: str, output_dir: str = "../models") -> Dict[str, Any]:
    """
    Train XGBoost Fraud Detection Classifier on PaySim transactions.
    """
    import xgboost as xgb
    from sklearn.metrics import precision_score, recall_score, f1_score, precision_recall_curve, auc

    print("==================================================")
    print("      FLOWARE XGBoost Fraud Detection Trainer     ")
    print("==================================================")

    # 1. Load Data & Feature Engineering
    df = load_paysim_data(data_path)
    train_df, val_df = get_train_val_split(df, test_size=0.2, random_state=42)

    X_train = engineer_features(train_df)
    y_train = train_df[TARGET_COLUMN].values

    X_val = engineer_features(val_df)
    y_val = val_df[TARGET_COLUMN].values

    print(f"[TRAIN] Training records: {len(X_train):,}")
    print(f"[TRAIN] Validation records: {len(X_val):,}")
    print(f"[TRAIN] Fraud ratio in training: {y_train.mean()*100:.3f}%")

    # Compute scale_pos_weight dynamically based on class imbalance
    num_neg = (y_train == 0).sum()
    num_pos = (y_train == 1).sum()
    scale_pos_weight = float(num_neg / max(1, num_pos))
    print(f"[TRAIN] Dynamic scale_pos_weight: {scale_pos_weight:.4f}")

    # 2. Hyperparameter Setup
    params = {
        'objective': 'binary:logistic',
        'n_estimators': 200,
        'max_depth': 6,
        'learning_rate': 0.05,
        'scale_pos_weight': scale_pos_weight,
        'subsample': 0.8,
        'colsample_bytree': 0.8,
        'random_state': 42,
        'eval_metric': 'aucpr'
    }

    print("[TRAIN] Initializing XGBClassifier with 200 trees...")
    model = xgb.XGBClassifier(**params)
    model.fit(
        X_train, y_train,
        eval_set=[(X_val, y_val)],
        verbose=50
    )

    # 3. Model Evaluation on Validation Set
    val_probs = model.predict_proba(X_val)[:, 1]
    val_preds = (val_probs >= 0.50).astype(int)

    precision = float(precision_score(y_val, val_preds, zero_division=0))
    recall = float(recall_score(y_val, val_preds, zero_division=0))
    f1 = float(f1_score(y_val, val_preds, zero_division=0))
    
    precisions, recalls, _ = precision_recall_curve(y_val, val_probs)
    pr_auc = float(auc(recalls, precisions))

    print("\n--------------------------------------------------")
    print(f" [RESULTS] Validation Precision: {precision:.4f} (Target: 0.72)")
    print(f" [RESULTS] Validation Recall:    {recall:.4f} (Target: 0.82)")
    print(f" [RESULTS] Validation F1 Score:  {f1:.4f} (Target: 0.77)")
    print(f" [RESULTS] Validation PR-AUC:    {pr_auc:.4f} (Target: 0.87)")
    print("--------------------------------------------------\n")

    # 4. Save Model & Metadata Artifacts
    os.makedirs(output_dir, exist_ok=True)
    model_json_path = os.path.join(output_dir, "xgboost_model.json")
    meta_json_path = os.path.join(output_dir, "model_metadata.json")

    model.save_model(model_json_path)
    print(f"[EXPORT] Saved XGBoost model to: {model_json_path}")

    metadata = {
        "model_name": "FLOWARE XGBoost Fraud Classifier",
        "version": "1.0.0",
        "algorithm": "xgboost.XGBClassifier",
        "objective": "binary:logistic",
        "hyperparameters": params,
        "metrics": {
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1_score": round(f1, 4),
            "pr_auc": round(pr_auc, 4)
        },
        "features": get_feature_names()
    }

    with open(meta_json_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"[EXPORT] Saved model metadata to: {meta_json_path}")

    return metadata

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train FLOWARE XGBoost Model")
    parser.add_argument("--data", type=str, default="../data/sample_transactions.csv", help="Path to PaySim CSV dataset")
    parser.add_argument("--out", type=str, default="../models", help="Output directory for model JSON")
    args = parser.parse_args()

    if os.path.exists(args.data):
        train_xgboost_model(args.data, args.out)
    else:
        print(f"[TRAIN] Data file not found at {args.data}. Run with valid --data argument.")
