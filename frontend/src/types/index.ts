export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type RecommendedAction = 'APPROVE' | 'REVIEW' | 'BLOCK' | string;
export type NodeTier = 'source' | 'target' | 'downstream';
export type ActiveTab = 'overview' | 'explorer' | 'auditor' | 'controls';

export interface Transaction {
  id: number;
  timestamp: string;
  fromAccount: string;
  toAccount: string;
  hour_of_day: number;
  amount_log: number;
  errorBalanceOrig: number;
  errorBalanceDest: number;
  type_TRANSFER: number;
  type_CASH_OUT: number;
  amount: number;
  actual_isFraud: number;
  predicted_probability: number;
  type: string;
  risk_level: RiskLevel;
  recommended_action: RecommendedAction;
  explanation_text: string;
}

export interface AccountNode {
  id: string;
  label: string;
  tier: NodeTier;
  riskLevel: RiskLevel;
  maxProbability: number;
  totalAmount: number;
  transactionCount: number;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  amount: number;
  transactionId: number;
  riskLevel: RiskLevel;
  probability: number;
  type: string;
}

export interface ModelDetails {
  featureNames: string[];
  numTrees: number;
  objectiveName: string;
  scalePosWeight: string | number;
}

export interface PerformanceMetrics {
  totalCount: number;
  fraudCount: number;
  nonFraudCount: number;
  fraudPercentage: number;
  tp: number;
  fp: number;
  tn: number;
  fn: number;
  precision: number;
  recall: number;
  f1Score: number;
  prAuc: number;
  riskCounts: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
  };
}

export type ViewFilter = 'ALL' | 'FLAGGED' | 'MEDIUM' | 'LOW';
