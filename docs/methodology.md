# FLOWARE Risk Scoring & Audit Governance Methodology

## 1. Risk Tier Categorization

Every processed transaction is assigned a continuous Risk Probability ($P \in [0, 1]$) and converted into a normalized **Risk Score** (0–100):

| Risk Score Range | Risk Tier | Action Code | Workflow Action |
| :--- | :--- | :--- | :--- |
| **0 – 35** | `LOW` | `APPROVE` | Straight-through automated clearance |
| **36 – 70** | `MEDIUM` | `REVIEW` | Escalated to Auditor Review Queue |
| **71 – 100** | `HIGH` | `BLOCK` | Automated hold & live risk interception |

---

## 2. Institutional Governance Controls

1. **Dual Authorization Protocol**: Transactions $> \text{₹}500,000$ scored above 0.70 require 4-eye secondary compliance sign-off.
2. **Hard Velocity Safeguards**: Automatic 15-minute freeze on destination accounts experiencing $> 3$ consecutive high-risk incoming transfers.
3. **Monthly Retraining Pipeline**: Scheduled drift evaluation to detect evolving fraud patterns and update decision trees.
4. **Human-in-the-Loop Override**: Compliance officers can override model predictions with mandatory audit justification logging.
5. **Immutable Audit Trail**: SHA-256 hashed log entries for every scored transaction and auditor review decision.
