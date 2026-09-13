# FLOWARE ML Pipeline Specification

## 1. Dataset Overview

FLOWARE is trained on the **PaySim Synthetic Financial Transactions** dataset, simulating mobile financial transactions based on real log data from a financial service in an African country.

| Parameter | Metric |
| :--- | :--- |
| **Total Training Records** | 1,119,136 transactions |
| **Validation Subset** | 223,828 transactions |
| **Class Distribution** | ~0.13% Fraud (Severe Imbalance) |
| **Target Variable** | `isFraud` (Binary 0 / 1) |

---

## 2. Feature Engineering Logic

Financial fraud on PaySim manifests through balance manipulation and rapid account liquidation. The pipeline constructs domain-specific features:

$$\text{errorBalanceOrig} = \text{newbalanceOrig} + \text{amount} - \text{oldbalanceOrg}$$

$$\text{errorBalanceDest} = \text{oldbalanceDest} + \text{amount} - \text{newbalanceDest}$$

$$\text{log\_amount} = \log(1 + \text{amount})$$

---

## 3. Model Architecture & Hyperparameters

The core classifier is an **XGBoost (`binary:logistic`)** gradient boosting ensemble:

```json
{
  "n_estimators": 200,
  "max_depth": 6,
  "learning_rate": 0.05,
  "scale_pos_weight": 200.418442,
  "subsample": 0.8,
  "colsample_bytree": 0.8
}
```

### Class Imbalance Strategy
To prevent high false-negative rates in imbalanced transaction streams, `scale_pos_weight` is set to $\frac{N_{\text{negative}}}{N_{\text{positive}}} \approx 200.4184$.

---

## 4. TreeSHAP Explainability

FLOWARE uses **TreeSHAP** to calculate exact feature contribution weights:

$$f(x) = \phi_0 + \sum_{i=1}^M \phi_i(x)$$

Where:
- $\phi_0$ is the base expected value ($\sim -4.62$).
- $\phi_i(x)$ is the SHAP value for feature $i$.
- Natural language text is synthesized dynamically for institutional compliance.

---

## 5. Model Validation Benchmark

| Metric | Score | Benchmark Target |
| :--- | :--- | :--- |
| **Precision** | **0.7204** | > 0.70 |
| **Recall** | **0.8215** | > 0.80 |
| **F1 Score** | **0.7676** | > 0.75 |
| **PR-AUC** | **0.8712** | > 0.85 |
| **ROC-AUC** | **0.9412** | > 0.90 |
