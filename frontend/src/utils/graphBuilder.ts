import { Transaction, AccountNode, FlowEdge, RiskLevel, NodeTier } from '../types';

export function enrichTransactionsWithAccounts(rawTransactions: Partial<Transaction>[]): Transaction[] {
  return rawTransactions.map((tx, idx) => {
    const id = tx.id || idx + 1;
    const hour = tx.hour_of_day || 0;
    const typeStr = (tx.type || 'PAYMENT').trim().toUpperCase();

    // Deterministic Account Names based on ID and type
    const fromAccount = `ACC-ORIG-${(1000 + (id * 17) % 8999)}`;
    
    let toAccount = '';
    if (typeStr === 'CASH_OUT') {
      toAccount = `MERCHANT-CASHOUT-${(5000 + (id * 31) % 4999)}`;
    } else if (typeStr === 'TRANSFER') {
      toAccount = `ACC-INTERMEDIARY-${(2000 + (id * 23) % 7999)}`;
    } else if (typeStr === 'PAYMENT') {
      toAccount = `MERCHANT-PAY-${(6000 + (id * 13) % 3999)}`;
    } else {
      toAccount = `ACC-DEST-${(4000 + (id * 29) % 5999)}`;
    }

    const minStr = String((id * 7) % 60).padStart(2, '0');
    const secStr = String((id * 13) % 60).padStart(2, '0');
    const hrStr = String(hour).padStart(2, '0');
    const timestamp = `2026-09-13 ${hrStr}:${minStr}:${secStr}`;

    const prob = tx.predicted_probability || 0;
    const riskLevel: RiskLevel = tx.risk_level || (prob > 0.7 ? 'HIGH' : prob > 0.3 ? 'MEDIUM' : 'LOW');
    const recommendedAction = tx.recommended_action || (prob > 0.7 ? 'BLOCK' : prob > 0.3 ? 'REVIEW' : 'APPROVE');

    return {
      id,
      timestamp,
      fromAccount,
      toAccount,
      hour_of_day: hour,
      amount_log: tx.amount_log || 0,
      errorBalanceOrig: tx.errorBalanceOrig || 0,
      errorBalanceDest: tx.errorBalanceDest || 0,
      type_TRANSFER: tx.type_TRANSFER || 0,
      type_CASH_OUT: tx.type_CASH_OUT || 0,
      amount: tx.amount || 0,
      actual_isFraud: tx.actual_isFraud || 0,
      predicted_probability: prob,
      type: typeStr,
      risk_level: riskLevel,
      recommended_action: recommendedAction,
      explanation_text: tx.explanation_text ? tx.explanation_text.trim() : 'No explanation provided.'
    };
  });
}

export function buildHierarchicalMoneyFlow(transactions: Transaction[], selectedTxId?: number | null, selectedAccountId?: string | null) {
  // Filter relevant subset for visual graph (e.g. top suspicious / flagged or selected transaction neighborhood)
  let subset: Transaction[] = [];

  if (selectedTxId) {
    const sel = transactions.find((t) => t.id === selectedTxId);
    if (sel) {
      // Find related transactions by account
      subset = transactions.filter(
        (t) => t.id === selectedTxId || t.fromAccount === sel.fromAccount || t.toAccount === sel.toAccount
      ).slice(0, 12);
    }
  } else if (selectedAccountId) {
    subset = transactions.filter(
      (t) => t.fromAccount === selectedAccountId || t.toAccount === selectedAccountId
    ).slice(0, 12);
  }

  // Default fallback: show representative subset of HIGH & MEDIUM risk transactions plus normal
  if (subset.length === 0) {
    const high = transactions.filter((t) => t.risk_level === 'HIGH').slice(0, 5);
    const med = transactions.filter((t) => t.risk_level === 'MEDIUM').slice(0, 4);
    const low = transactions.filter((t) => t.risk_level === 'LOW').slice(0, 3);
    subset = [...high, ...med, ...low];
  }

  const nodesMap = new Map<string, AccountNode>();
  const edges: FlowEdge[] = [];

  subset.forEach((tx) => {
    // 1. Source Account Node
    if (!nodesMap.has(tx.fromAccount)) {
      nodesMap.set(tx.fromAccount, {
        id: tx.fromAccount,
        label: tx.fromAccount,
        tier: 'source',
        riskLevel: tx.risk_level,
        maxProbability: tx.predicted_probability,
        totalAmount: tx.amount,
        transactionCount: 1
      });
    } else {
      const existing = nodesMap.get(tx.fromAccount)!;
      existing.totalAmount += tx.amount;
      existing.transactionCount++;
      if (tx.predicted_probability > existing.maxProbability) {
        existing.maxProbability = tx.predicted_probability;
        existing.riskLevel = tx.risk_level;
      }
    }

    // 2. Target / Downstream Account Node
    const isDownstream = tx.toAccount.startsWith('MERCHANT');
    const targetTier: NodeTier = isDownstream ? 'downstream' : 'target';

    if (!nodesMap.has(tx.toAccount)) {
      nodesMap.set(tx.toAccount, {
        id: tx.toAccount,
        label: tx.toAccount,
        tier: targetTier,
        riskLevel: tx.risk_level,
        maxProbability: tx.predicted_probability,
        totalAmount: tx.amount,
        transactionCount: 1
      });
    } else {
      const existing = nodesMap.get(tx.toAccount)!;
      existing.totalAmount += tx.amount;
      existing.transactionCount++;
      if (tx.predicted_probability > existing.maxProbability) {
        existing.maxProbability = tx.predicted_probability;
        existing.riskLevel = tx.risk_level;
      }
    }

    // 3. Flow Edge
    edges.push({
      id: `edge-${tx.id}`,
      source: tx.fromAccount,
      target: tx.toAccount,
      amount: tx.amount,
      transactionId: tx.id,
      riskLevel: tx.risk_level,
      probability: tx.predicted_probability,
      type: tx.type
    });
  });

  const nodes = Array.from(nodesMap.values());

  // Group nodes by tier for 3-level hierarchy layout
  const sourceNodes = nodes.filter((n) => n.tier === 'source');
  const targetNodes = nodes.filter((n) => n.tier === 'target');
  const downstreamNodes = nodes.filter((n) => n.tier === 'downstream');

  return {
    nodes,
    sourceNodes,
    targetNodes,
    downstreamNodes,
    edges,
    activeSubset: subset
  };
}
