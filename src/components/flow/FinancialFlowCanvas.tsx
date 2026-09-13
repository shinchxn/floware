import React from 'react';
import { Transaction } from '../../types';
import { buildEcosystemFlowData, AccountCardNode, MoneyTransferEdge } from '../../utils/flowEngine';
import { ShieldAlert, ArrowRight, Activity, Cpu, Zap, ArrowDown } from 'lucide-react';

interface FinancialFlowCanvasProps {
  transactions: Transaction[];
  focusedAccountId: string | null;
  focusedTxId: number | null;
  onSelectAccount: (accountId: string) => void;
  onSelectTransaction: (tx: Transaction) => void;
}

export const FinancialFlowCanvas: React.FC<FinancialFlowCanvasProps> = ({
  transactions,
  focusedAccountId,
  focusedTxId,
  onSelectAccount,
  onSelectTransaction
}) => {
  const { sourceNodes, targetNodes, downstreamNodes, edges, activeFocusAccount } = buildEcosystemFlowData(
    transactions,
    focusedAccountId,
    focusedTxId
  );

  const formatRupee = (val: number) => {
    return `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const renderAccountCard = (node: AccountCardNode) => {
    const isFocus = node.id === activeFocusAccount;
    const isFlagged = node.isFlagged;
    const isMedium = node.riskLevel === 'MEDIUM';

    let cardBorder = 'var(--color-border)';
    let cardBg = '#FFFFFF';
    let headerColor = 'var(--color-primary)';

    if (isFlagged) {
      cardBorder = 'var(--risk-high)';
      cardBg = 'rgba(228, 87, 46, 0.07)';
      headerColor = 'var(--risk-high)';
    } else if (isMedium) {
      cardBorder = 'var(--risk-medium)';
      cardBg = 'rgba(232, 163, 61, 0.07)';
      headerColor = 'var(--risk-medium)';
    } else if (isFocus) {
      cardBorder = 'var(--color-emerald)';
      cardBg = 'rgba(31, 171, 137, 0.07)';
    }

    return (
      <div
        key={node.id}
        onClick={() => onSelectAccount(node.id)}
        className={`card ${isFlagged ? 'pulse-red-aura' : ''}`}
        style={{
          padding: '16px',
          border: `2px solid ${cardBorder}`,
          backgroundColor: cardBg,
          cursor: 'pointer',
          boxShadow: isFocus || isFlagged ? 'var(--shadow-lg)' : 'var(--shadow-md)',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          minWidth: '210px',
          position: 'relative'
        }}
      >
        {/* Top Header Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.04em' }}>
            {node.category}
          </span>
          {isFlagged ? (
            <span className="risk-badge HIGH" style={{ padding: '2px 8px', fontSize: '0.625rem' }}>
              <ShieldAlert size={10} />
              <span>HIGH RISK</span>
            </span>
          ) : isMedium ? (
            <span className="risk-badge MEDIUM" style={{ padding: '2px 8px', fontSize: '0.625rem' }}>
              <span>MEDIUM</span>
            </span>
          ) : (
            <span className="risk-badge LOW" style={{ padding: '2px 8px', fontSize: '0.625rem' }}>
              <span>NORMAL</span>
            </span>
          )}
        </div>

        {/* Account Title */}
        <div className="tabular-nums" style={{ fontSize: '1rem', fontWeight: 800, color: headerColor, marginBottom: '10px' }}>
          {node.shortName}
        </div>

        {/* IN / OUT Amounts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingTop: '10px', borderTop: '1px solid rgba(0,0,0,0.06)', fontSize: '0.75rem' }}>
          <div style={{ padding: '6px 8px', backgroundColor: 'rgba(31, 171, 137, 0.08)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.6875rem', fontWeight: 600 }}>IN</span>
            <strong className="tabular-nums" style={{ color: 'var(--color-emerald)', fontWeight: 800 }}>{formatRupee(node.totalIn)}</strong>
          </div>

          <div style={{ padding: '6px 8px', backgroundColor: 'rgba(11, 79, 74, 0.06)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.6875rem', fontWeight: 600 }}>OUT</span>
            <strong className="tabular-nums" style={{ color: 'var(--color-primary)', fontWeight: 800 }}>{formatRupee(node.totalOut)}</strong>
          </div>
        </div>

        {/* Focus Indicator Pill */}
        {isFocus && (
          <div style={{ marginTop: '10px', textAlign: 'center', fontSize: '0.6875rem', fontWeight: 800, color: isFlagged ? 'var(--risk-high)' : 'var(--color-emerald)', letterSpacing: '0.04em' }}>
            ● INVESTIGATION FOCUS
          </div>
        )}
      </div>
    );
  };

  const renderTransferEdgeBadge = (edge: MoneyTransferEdge) => {
    const isSelected = edge.transactionId === focusedTxId;
    const isHigh = edge.riskLevel === 'HIGH';

    return (
      <div
        key={edge.id}
        onClick={(e) => {
          e.stopPropagation();
          const matched = transactions.find((t) => t.id === edge.transactionId);
          if (matched) onSelectTransaction(matched);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 14px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: isHigh ? 'var(--risk-high-bg)' : isSelected ? 'var(--color-emerald-light)' : '#FFFFFF',
          border: `1.5px solid ${isHigh ? 'var(--risk-high)' : isSelected ? 'var(--color-emerald)' : 'var(--color-border)'}`,
          boxShadow: isHigh || isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
          cursor: 'pointer',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: isHigh ? 'var(--risk-high)' : 'var(--color-text-main)',
          transition: 'all 0.2s ease',
          whiteSpace: 'nowrap'
        }}
      >
        <span className="tabular-nums" style={{ fontWeight: 800, fontSize: '0.8125rem' }}>
          {edge.formattedAmount}
        </span>
        <span style={{ opacity: 0.65, fontSize: '0.6875rem' }}>● {edge.timeStr}</span>
        <ArrowRight size={14} style={{ color: isHigh ? 'var(--risk-high)' : 'var(--color-emerald)' }} />
      </div>
    );
  };

  return (
    <div className="card" style={{ padding: '24px', minHeight: '680px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Live ML Scan Banner */}
      <div
        style={{
          backgroundColor: 'var(--color-primary)',
          color: '#FFFFFF',
          padding: '14px 20px',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Cpu size={20} style={{ color: '#53F6CE' }} />
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#FFFFFF' }}>
              Live ML Model Detection Active
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>
              Evaluating real-time money flows from PaySim validation dataset
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#53F6CE', backgroundColor: 'rgba(31,171,137,0.2)', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
          <Zap size={12} />
          <span>Real-time Stream Engine</span>
        </div>
      </div>

      {/* Canvas Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="icon-box sm emerald">
            <Activity size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              Live Financial Flow Canvas
            </h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              Permanent Account Nodes & Directional Transfer Streams
            </div>
          </div>
        </div>

        {activeFocusAccount && (
          <div className="pulse-red-aura" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--risk-high-bg)', color: 'var(--risk-high)', fontSize: '0.8125rem', fontWeight: 800, border: '1px solid var(--risk-high-border)' }}>
            <ShieldAlert size={14} />
            <span>Investigation Focus: <strong className="tabular-nums">{activeFocusAccount}</strong></span>
          </div>
        )}
      </div>

      {/* Ecosystem Canvas Flow Tiers */}
      <div style={{ flex: 1, backgroundColor: '#FAFAF9', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>
        
        {/* Tier 1: Source Accounts */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>1. Source Accounts (Originators)</span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>({sourceNodes.length} active nodes)</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
            {sourceNodes.slice(0, 3).map((node) => renderAccountCard(node))}
          </div>
        </div>

        {/* Animated Money Transfer Stream Line 1 */}
        <div style={{ padding: '10px 14px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-border)', display: 'flex', alignItems: 'center', gap: '12px', overflowX: 'auto' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--color-emerald)', textTransform: 'uppercase', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowDown size={12} />
            <span>Incoming Flows:</span>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {edges.slice(0, 4).map((edge) => renderTransferEdgeBadge(edge))}
          </div>
        </div>

        {/* Tier 2: Target Focus Account */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>2. Target Intermediary Hubs</span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>({targetNodes.length} active nodes)</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
            {targetNodes.slice(0, 3).map((node) => renderAccountCard(node))}
          </div>
        </div>

        {/* Animated Money Transfer Stream Line 2 */}
        <div style={{ padding: '10px 14px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-border)', display: 'flex', alignItems: 'center', gap: '12px', overflowX: 'auto' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--risk-high)', textTransform: 'uppercase', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowDown size={12} />
            <span>Outgoing Settlements:</span>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {edges.slice(4, 8).map((edge) => renderTransferEdgeBadge(edge))}
          </div>
        </div>

        {/* Tier 3: Downstream Accounts / Merchants */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>3. Downstream Merchants & Cash-Out Endpoints</span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>({downstreamNodes.length} active endpoints)</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
            {downstreamNodes.slice(0, 3).map((node) => renderAccountCard(node))}
          </div>
        </div>
      </div>
    </div>
  );
};
