"""
FLOWARE ML Pipeline - Data Loader & Validation Module
EFOS Global Finance Hackathon 2026 - Track 02 (Audit & Risk)
"""

import pandas as pd
import numpy as np
from typing import Tuple, List, Dict, Any

REQUIRED_COLUMNS = [
    'step', 'type', 'amount', 'nameOrig', 'oldbalanceOrg',
    'newbalanceOrig', 'nameDest', 'oldbalanceDest', 'newbalanceDest'
]

TARGET_COLUMN = 'isFraud'

def load_paysim_data(filepath: str) -> pd.DataFrame:
    """
    Load PaySim synthetic financial transactions CSV dataset.
    """
    print(f"[DATA LOADER] Loading dataset from: {filepath}")
    df = pd.read_csv(filepath)
    df = clean_data(df)
    validate_schema(df)
    print(f"[DATA LOADER] Successfully loaded {len(df):,} transaction records.")
    return df

def validate_schema(df: pd.DataFrame) -> bool:
    """
    Validate that required transaction features are present.
    """
    missing_cols = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing_cols:
        raise ValueError(f"Dataset schema invalid. Missing required columns: {missing_cols}")
    return True

def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Perform data type sanitization and missing value handling.
    """
    df = df.copy()
    
    # Strip whitespace from string columns
    for str_col in ['type', 'nameOrig', 'nameDest']:
        if str_col in df.columns:
            df[str_col] = df[str_col].astype(str).str.strip()

    # Fill numeric NaNs if any
    num_cols = ['step', 'amount', 'oldbalanceOrg', 'newbalanceOrig', 'oldbalanceDest', 'newbalanceDest']
    for num_col in num_cols:
        if num_col in df.columns:
            df[num_col] = pd.to_numeric(df[num_col], errors='coerce').fillna(0.0)

    # Ensure target column is integer binary flag
    if TARGET_COLUMN in df.columns:
        df[TARGET_COLUMN] = pd.to_numeric(df[TARGET_COLUMN], errors='coerce').fillna(0).astype(int)

    return df

def get_train_val_split(df: pd.DataFrame, test_size: float = 0.2, random_state: int = 42) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Perform stratified split to maintain fraud class proportion across splits.
    """
    from sklearn.model_selection import train_test_split
    
    if TARGET_COLUMN not in df.columns:
        raise KeyError(f"Target column '{TARGET_COLUMN}' not found in DataFrame.")

    train_df, val_df = train_test_split(
        df,
        test_size=test_size,
        stratify=df[TARGET_COLUMN],
        random_state=random_state
    )
    return train_df, val_df

if __name__ == "__main__":
    print("[DATA LOADER] Running self-test verification...")
    # Quick sanity check with synthetic dummy row
    dummy_data = {
        'step': [1], 'type': ['TRANSFER'], 'amount': [18000.0],
        'nameOrig': ['C12345'], 'oldbalanceOrg': [18000.0], 'newbalanceOrig': [0.0],
        'nameDest': ['C67890'], 'oldbalanceDest': [0.0], 'newbalanceDest': [0.0],
        'isFraud': [1]
    }
    test_df = pd.DataFrame(dummy_data)
    validate_schema(test_df)
    print("[DATA LOADER] Sanity check passed successfully.")
