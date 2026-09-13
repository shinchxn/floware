import React from 'react';
import { Transaction, AccountNode, FlowEdge } from '../../types';
import { buildHierarchicalMoneyFlow } from '../../utils/graphBuilder';
import { Network, ShieldAlert, ArrowDown, ArrowRight, Layers, UserCheck } from 'lucide-react';

interface MoneyFlowDiagramProps {
  transactions: Transaction[];
  selectedTransactionId: number | null;
  selectedAccountId: string | null;
  onSelectAccount: (accountId: string) => void;
  onSelectTransaction: (tx: Transaction) => void;
}

export const MoneyFlowDiagram: React.FC<MoneyFlowDiagramProps> = ({
  transactions,
  selectedTransactionId,
  selectedAccountId,
  onSelectAccount,
  onSelectTransaction
}) => {
  const { sourceNodes, targetNodes, downstreamNodes, edges, activeSubset } = buildHierarchicalMoneyFlow(
    transactions,
    selectedTransactionId,
    selectedAccountId
  );

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  const renderNodeCard = (node: AccountNode) => {
    const isSelected = selectedAccountId === node.id;
    const isFlagged = node.riskLevel === 'HIGH';
    const isMedium = node.riskLevel === 'MEDIUM';

    let borderColor = 'var(--color-border)';
    let bg = '#FFFFFF';
    if (isFlagged) {
      borderColor = 'var(--risk-high)';
      bg = 'rgba(228, 87, 46, 0.08)';
    } else if (isMedium) {
      borderColor = 'var(--risk-medium)';
      bg = 'rgba(232, 163, 61, 0.08)';
    } else if (isSelected) {
      borderColor = 'var(--color-emerald)';
      bg = 'rgba(31, 171, 137, 0.08)';
    }

    return (
      <div
        key={node.id}
        onClick={() => onSelectAccount(node.id)}
        style={{
          border: `2px solid ${borderColor}`,
          borderRadius: 'var(--radius-md)',
          padding: '12px 14px',
          backgroundColor: bg,
          cursor: 'pointer',
          boxShadow: isSelected || isFlagged ? 'var(--shadow-md)' : 'var(--shadow-sm)',
          transition: 'all 0.2s ease',
          minWidth: '180px',
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.04em' }}>
            {node.tier}
          </span>
          <span className={`risk-badge ${node.riskLevel}`} style={{ padding: '1px 6px', fontSize: '0.625rem' }}>
            {node.riskLevel}
          </span>
        </div>

        <div className="tabular-nums" style={{ fontSize: '0.875rem', fontWeight: 800, color: isFlagged ? 'var(--risk-high)' : 'var(--color-primary)', wordBreak: 'break-all' }}>
          {node.id}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', paddingTop: '6px', borderTop: '1px solid rgba(0,0,0,0.06)', fontSize: '0.75rem' }}>
          <span className="tabular-nums" style={{ color: 'var(--color-text-main)', fontWeight: 700 }}>
            {formatCurrency(node.totalAmount)}
          </span>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.6875rem', fontWeight: 600 }}>
            {node.transactionCount} txs
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Diagram Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="icon-box sm emerald">
            <Network size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              Hierarchical Money-Flow Graph
            </h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              Source Accounts ↓ Target Intermediaries ↓ Downstream Merchants
            </div>
          </div>
        </div>

        {selectedAccountId && (
          <button
            className="btn btn-ghost"
            onClick={() => onSelectAccount('')}
            style={{ padding: '4px 10px', fontSize: '0.75rem', color: 'var(--color-primary)' }}
          >
            Clear Node Focus
          </button>
        )}
      </div>

      {/* Hierarchical Flow Tiers Layout */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
        {/* Tier 1: Source Accounts */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Source Accounts (Originators)</span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>({sourceNodes.length} active)</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {sourceNodes.slice(0, 4).map((node) => renderNodeCard(node))}
          </div>
        </div>

        {/* Directed Flow Divider 1 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', opacity: 0.6 }}>
          <div style={{ height: '1px', flex: 1, backgroundColor: 'var(--color-border)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)' }}>
            <ArrowDown size={14} />
            <span>Fund Transfers</span>
          </div>
          <div style={{ height: '1px', flex: 1, backgroundColor: 'var(--color-border)' }} />
        </div>

        {/* Tier 2: Target / Intermediary Accounts */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Target Accounts (Intermediaries)</span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>({targetNodes.length} active)</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {targetNodes.slice(0, 4).map((node) => renderNodeCard(node))}
          </div>
        </div>

        {/* Directed Flow Divider 2 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', opacity: 0.6 }}>
          <div style={{ height: '1px', flex: 1, backgroundColor: 'var(--color-border)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)' }}>
            <ArrowDown size={14} />
            <span>Settlement / Cash-Out</span>
          </div>
          <div style={{ height: '1px', flex: 1, backgroundColor: 'var(--color-border)' }} />
        </div>

        {/* Tier 3: Downstream Accounts / Merchants */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Downstream Accounts & Merchants</span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>({downstreamNodes.length} active)</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {downstreamNodes.slice(0, 4).map((node) => renderNodeCard(node))}
          </div>
        </div>
      </div>

      {/* Connected Flow Path Transactions Bar */}
      <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '16px' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '8px' }}>
          Active Flow Transfers in Graph ({activeSubset.length} transactions):
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {activeSubset.map((tx) => {
            const isSelected = tx.id === selectedTransactionId;
            const isFlagged = tx.risk_level === 'HIGH';

            return (
              <button
                key={tx.id}
                onClick={() => onSelectTransaction(tx)}
                className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isFlagged && !isSelected ? 'var(--risk-high-bg)' : undefined,
                  color: isFlagged && !isSelected ? 'var(--risk-high)' : undefined,
                  borderColor: isFlagged && !isSelected ? 'var(--risk-high-border)' : undefined
                }}
              >
                {isFlagged && <ShieldAlert size={12} />}
                <span>#TX-{tx.id} ({formatCurrency(tx.amount)})</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
