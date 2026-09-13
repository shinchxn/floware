import { Transaction, RiskLevel, NodeTier } from '../types';

export interface AccountCardNode {
  id: string;
  shortName: string;
  category: string;
  totalIn: number;
  totalOut: number;
  riskLevel: RiskLevel;
  maxProbability: number;
  isFlagged: boolean;
  tier: NodeTier;
  transactionCount: number;
}

export interface MoneyTransferEdge {
  id: string;
  sourceId: string;
  targetId: string;
  amount: number;
  formattedAmount: string;
  timeStr: string;
  timestamp: string;
  type: string;
  riskLevel: RiskLevel;
  probability: number;
  transactionId: number;
}

export function buildEcosystemFlowData(
  transactions: Transaction[],
  focusedAccountId?: string | null,
  focusedTxId?: number | null
) {
  // Determine primary investigation focus account
  let activeFocusAccount: string | null = focusedAccountId || null;
  
  if (!activeFocusAccount && focusedTxId) {
    const matchedTx = transactions.find((t) => t.id === focusedTxId);
    if (matchedTx) {
      activeFocusAccount = matchedTx.risk_level === 'HIGH' ? matchedTx.fromAccount : matchedTx.toAccount;
    }
  }

  // If no focus account selected yet, find highest risk account in dataset
  if (!activeFocusAccount && transactions.length > 0) {
    const highestRiskTx = [...transactions].sort((a, b) => b.predicted_probability - a.predicted_probability)[0];
    activeFocusAccount = highestRiskTx ? highestRiskTx.fromAccount : transactions[0].fromAccount;
  }

  // Filter transactions connected to focus account or representative sample
  let relevantTxs: Transaction[] = [];
  if (activeFocusAccount) {
    relevantTxs = transactions.filter(
      (t) => t.fromAccount === activeFocusAccount || t.toAccount === activeFocusAccount
    );
  }

  if (relevantTxs.length < 5) {
    // Add extra high and medium risk transactions to enrich ecosystem view
    const extraHigh = transactions.filter((t) => t.risk_level === 'HIGH').slice(0, 8);
    const extraMed = transactions.filter((t) => t.risk_level === 'MEDIUM').slice(0, 4);
    const set = new Set([...relevantTxs, ...extraHigh, ...extraMed]);
    relevantTxs = Array.from(set);
  }

  const nodesMap = new Map<string, AccountCardNode>();
  const edges: MoneyTransferEdge[] = [];

  const formatRupee = (amt: number) => {
    return `₹${amt.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  relevantTxs.forEach((tx) => {
    // Source Node
    if (!nodesMap.has(tx.fromAccount)) {
      const shortId = tx.fromAccount.replace('ACC-ORIG-', '').replace('ACC-', '');
      nodesMap.set(tx.fromAccount, {
        id: tx.fromAccount,
        shortName: `ACC ••••${shortId}`,
        category: 'Personal Account',
        totalIn: 0,
        totalOut: tx.amount,
        riskLevel: tx.risk_level,
        maxProbability: tx.predicted_probability,
        isFlagged: tx.risk_level === 'HIGH',
        tier: 'source',
        transactionCount: 1
      });
    } else {
      const node = nodesMap.get(tx.fromAccount)!;
      node.totalOut += tx.amount;
      node.transactionCount++;
      if (tx.predicted_probability > node.maxProbability) {
        node.maxProbability = tx.predicted_probability;
        node.riskLevel = tx.risk_level;
        node.isFlagged = tx.risk_level === 'HIGH';
      }
    }

    // Target Node
    const isMerchant = tx.toAccount.startsWith('MERCHANT');
    const targetTier: NodeTier = isMerchant ? 'downstream' : 'target';

    if (!nodesMap.has(tx.toAccount)) {
      const shortId = tx.toAccount.replace('ACC-DEST-', '').replace('ACC-INTERMEDIARY-', '').replace('MERCHANT-', '');
      nodesMap.set(tx.toAccount, {
        id: tx.toAccount,
        shortName: isMerchant ? `MERCHANT ••••${shortId.slice(-4)}` : `ACC ••••${shortId}`,
        category: isMerchant ? 'Merchant Endpoint' : 'Intermediary Hub',
        totalIn: tx.amount,
        totalOut: 0,
        riskLevel: tx.risk_level,
        maxProbability: tx.predicted_probability,
        isFlagged: tx.risk_level === 'HIGH',
        tier: targetTier,
        transactionCount: 1
      });
    } else {
      const node = nodesMap.get(tx.toAccount)!;
      node.totalIn += tx.amount;
      node.transactionCount++;
      if (tx.predicted_probability > node.maxProbability) {
        node.maxProbability = tx.predicted_probability;
        node.riskLevel = tx.risk_level;
        node.isFlagged = tx.risk_level === 'HIGH';
      }
    }

    // Money Transfer Edge
    const timeParts = tx.timestamp.split(' ')[1] || '10:42:00';
    const hourNum = parseInt(timeParts.split(':')[0], 10) || 10;
    const timeStr = `${hourNum > 12 ? hourNum - 12 : hourNum}:${timeParts.split(':')[1]} ${hourNum >= 12 ? 'PM' : 'AM'}`;

    edges.push({
      id: `edge-${tx.id}`,
      sourceId: tx.fromAccount,
      targetId: tx.toAccount,
      amount: tx.amount,
      formattedAmount: formatRupee(tx.amount),
      timeStr,
      timestamp: timeParts,
      type: tx.type,
      riskLevel: tx.risk_level,
      probability: tx.predicted_probability,
      transactionId: tx.id
    });
  });

  const nodes = Array.from(nodesMap.values());

  const sourceNodes = nodes.filter((n) => n.tier === 'source');
  const targetNodes = nodes.filter((n) => n.tier === 'target');
  const downstreamNodes = nodes.filter((n) => n.tier === 'downstream');

  return {
    nodes,
    sourceNodes,
    targetNodes,
    downstreamNodes,
    edges,
    activeFocusAccount,
    relevantTxs
  };
}
