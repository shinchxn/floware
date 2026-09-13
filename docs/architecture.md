# FLOWARE System Architecture

> **Real-Time Financial Transaction Ecosystem Monitoring & Explainable Fraud Detection**  
> *EFOS Global Finance Hackathon 2026 — Track 02 (Audit & Risk)*

---

## 🏗️ High-Level System Architecture

```mermaid
graph TD
    %% Styling Node Classes
    classDef pythonLayer fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#fff
    classDef mlLayer fill:#0f172a,stroke:#8b5cf6,stroke-width:2px,color:#fff
    classDef apiLayer fill:#1e1b4b,stroke:#6366f1,stroke-width:2px,color:#fff
    classDef uiLayer fill:#022c22,stroke:#10b981,stroke-width:2px,color:#fff
    classDef alertLayer fill:#450a0a,stroke:#ef4444,stroke-width:2px,color:#fff

    subgraph STREAM ["1. Ingestion Stream"]
        A["💳 Live Transaction Feed"]
    end

    subgraph PYTHON_ML ["2. Python Intelligence Layer (ml/)"]
        B["⚙️ Feature Engineering<br/>errorBalanceOrig, errorBalanceDest, log_amount"]
        C["🤖 XGBoost Classifier<br/>200 Trees, scale_pos_weight: 200.41"]
        D["📈 Composite Risk Engine<br/>Score 0-100 & Risk Tier"]
        E["🔍 TreeSHAP Explainer<br/>Attribution Weights & Natural Language"]
    end

    subgraph API_SERVER ["3. FastAPI Web Service (api/)"]
        F["⚡ REST API Gateway<br/>/api/v1/predict & /api/v1/explain"]
    end

    subgraph REACT_UI ["4. React / TypeScript Product Interface (frontend/)"]
        G["🌐 Live Financial Flow Canvas<br/>Account Nodes & Edge Streams"]
        H["⚡ Live Stream Ticker<br/>350ms Cadence Feed"]
        I["🎯 Visual SHAP Inspector<br/>Risk Score Arc Gauge & Feature Bars"]
        J["🛡️ Auditor Queue & Controls<br/>Triage & Governance Cards"]
    end

    %% Flow Connections
    A -->|Raw Transaction| B
    B -->|Feature Matrix| C
    C -->|Probability| D
    D -->|Risk Tier| E
    D & E -->|Prediction & SHAP Payload| F

    F -->|Stream Events| G
    F -->|Real-Time Feed| H
    F -->|Attribution Data| I

    G & H -->|Investigation Focus| I
    I -->|High/Medium Triage| J

    class B,C,D,E pythonLayer
    class F apiLayer
    class G,H,I,J uiLayer
```

---

## 🧩 Component Subsystems

### 1. Python ML Engine (`ml/`)
- **Data Ingestion (`data_loader.py`)**: Loads and validates PaySim financial transactions schema.
- **Feature Engineering (`feature_engineering.py`)**: Computes balance error features (`errorBalanceOrig`, `errorBalanceDest`), log transaction amounts, and identity indicators.
- **XGBoost Classifier (`train_model.py`)**: 200 trees binary classifier tuned with `scale_pos_weight: 200.4184` for severe class imbalance.
- **TreeSHAP Explainer (`explain.py`)**: Computes exact feature contribution weights and generates human-readable attribution text.

### 2. FastAPI Web Service (`api/`)
- **REST Endpoints**:
  - `POST /api/v1/predict`: Real-time transaction scoring.
  - `POST /api/v1/explain`: TreeSHAP attribution and natural language explanations.
  - `GET /model/metadata`: Model hyperparameters and validation benchmarks.

### 3. React / TypeScript Frontend (`frontend/`)
- **Live Financial Flow Canvas**: Permanent Account Nodes & directional money transfer edges.
- **Visual SHAP Inspector**: Arc gauge risk score meter and color-coded feature attribution bars.
- **Auditor Triage Queue**: High and medium risk case review tools.
