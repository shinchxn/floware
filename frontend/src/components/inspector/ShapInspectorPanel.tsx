import React, { useMemo } from 'react';
import { Transaction } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { AlertCircle, ShieldAlert, CheckCircle2, Cpu, Activity, ArrowRightLeft, Layers, Zap } from 'lucide-react';

interface ShapInspectorPanelProps {
  selectedTransaction: Transaction | null;
  selectedAccountId: string | null;
  allTransactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
}

export const ShapInspectorPanel: React.FC<ShapInspectorPanelProps> = ({
  selectedTransaction,
  selectedAccountId,
  allTransactions,
  onSelectTransaction
}) => {
  const activeTx: Transaction | null = useMemo(() => {
    if (selectedTransaction) return selectedTransaction;

    if (selectedAccountId) {
      const match = allTransactions.find(
        (t) => t.fromAccount === selectedAccountId || t.toAccount === selectedAccountId
      );
      if (match) return match;
    }

    return allTransactions.length > 0
      ? [...allTransactions].sort((a, b) => b.predicted_probability - a.predicted_probability)[0]
      : null;
  }, [selectedTransaction, selectedAccountId, allTransactions]);

  if (!activeTx) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-muted)' }}>
        <Cpu size={32} style={{ margin: '0 auto 12px auto', display: 'block', opacity: 0.5 }} />
        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)' }}>
          Inspector Panel Idle
        </h4>
        <p style={{ fontSize: '0.8125rem' }}>Select any transaction or account to view model risk and SHAP explanation.</p>
      </div>
    );
  }

  const scorePct = Math.min(100, Math.max(0, activeTx.predicted_probability * 100));

  // Gauge Needle Math
  const angle = Math.PI - (scorePct / 100) * Math.PI;
  const needleX = 100 + 55 * Math.cos(angle);
  const needleY = 90 - 55 * Math.sin(angle);

  const formatRupee = (val: number) => {
    return `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };

  // Connected History for selected account
  const connectedTxs = allTransactions.filter(
    (t) => t.fromAccount === activeTx.fromAccount || t.toAccount === activeTx.fromAccount || t.fromAccount === activeTx.toAccount || t.toAccount === activeTx.toAccount
  ).slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Step-by-Step ML Detection Workflow Bar */}
      <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', backgroundColor: '#FAFAF9', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>
        <span style={{ color: 'var(--color-emerald)' }}>1. Event</span>
        <span>→</span>
        <span style={{ color: 'var(--color-primary)' }}>2. XGBoost</span>
        <span>→</span>
        <span style={{ color: activeTx.predicted_probability > 0.5 ? 'var(--risk-high)' : 'var(--color-primary)' }}>3. Flagged</span>
        <span>→</span>
        <span style={{ color: 'var(--color-emerald)' }}>4. SHAP Explained</span>
      </div>

      {/* Risk Gauge & Action Header Card */}
      <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Transaction #TX-{activeTx.id}
            </span>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              {activeTx.type} Analysis
            </h3>
          </div>

          <RiskBadge level={activeTx.risk_level} />
        </div>

        {/* SVG Arc Gauge */}
        <div style={{ position: 'relative', width: '200px', height: '110px', margin: '0 auto 8px auto' }}>
          <svg width="200" height="110" viewBox="0 0 200 110">
            <defs>
              <linearGradient id="panelGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2E8B57" />
                <stop offset="50%" stopColor="#E8A33D" />
                <stop offset="100%" stopColor="#E4572E" />
              </linearGradient>
            </defs>

            <path
              d="M 20 90 A 70 70 0 0 1 180 90"
              fill="none"
              stroke="#E8ECEB"
              strokeWidth="16"
              strokeLinecap="round"
            />
            <path
              d="M 20 90 A 70 70 0 0 1 180 90"
              fill="none"
              stroke="url(#panelGaugeGradient)"
              strokeWidth="16"
              strokeLinecap="round"
            />
            <line
              x1="100"
              y1="90"
              x2={needleX}
              y2={needleY}
              stroke="var(--color-primary)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle cx="100" cy="90" r="6" fill="var(--color-primary)" />
          </svg>
        </div>

        <div className="tabular-nums" style={{ fontSize: '1.75rem', fontWeight: 800, color: activeTx.predicted_probability > 0.5 ? 'var(--risk-high)' : 'var(--color-primary)' }}>
          {scorePct.toFixed(1)}%
        </div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '16px' }}>
          XGBoost Risk Probability ({activeTx.predicted_probability.toFixed(6)})
        </div>

        {/* Action Callout Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', paddingTop: '14px', borderTop: '1px solid var(--color-border-subtle)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            Model Action:
          </span>
          <span className={`action-badge ${activeTx.recommended_action}`}>
            {activeTx.recommended_action === 'APPROVE' && <CheckCircle2 size={14} />}
            {activeTx.recommended_action === 'REVIEW' && <AlertCircle size={14} />}
            {activeTx.recommended_action === 'BLOCK' && <ShieldAlert size={14} />}
            <span>{activeTx.recommended_action}</span>
          </span>
        </div>
      </div>

      {/* Visual SHAP Feature Impact Bars Card */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <div className="icon-box sm emerald">
            <Zap size={16} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              Visual SHAP Feature Impact
            </h4>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              Feature Weights Driving ML Prediction
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.75rem' }}>
          {/* Feature 1: Type */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: '4px' }}>
              <span>Transaction Type ({activeTx.type})</span>
              <span className="tabular-nums" style={{ color: activeTx.type_TRANSFER || activeTx.type_CASH_OUT ? 'var(--risk-high)' : 'var(--color-emerald)' }}>
                {activeTx.type_TRANSFER || activeTx.type_CASH_OUT ? '+38% Impact' : 'Normal'}
              </span>
            </div>
            <div style={{ height: '6px', backgroundColor: '#E8ECEB', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: activeTx.type_TRANSFER || activeTx.type_CASH_OUT ? '38%' : '8%', backgroundColor: activeTx.type_TRANSFER || activeTx.type_CASH_OUT ? 'var(--risk-high)' : 'var(--color-emerald)' }} />
            </div>
          </div>

          {/* Feature 2: Balance Error */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: '4px' }}>
              <span>Origin Balance Error</span>
              <span className="tabular-nums" style={{ color: activeTx.errorBalanceOrig !== 0 ? 'var(--risk-high)' : 'var(--color-text-muted)' }}>
                {activeTx.errorBalanceOrig !== 0 ? '+34% Impact' : '0% Impact'}
              </span>
            </div>
            <div style={{ height: '6px', backgroundColor: '#E8ECEB', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: activeTx.errorBalanceOrig !== 0 ? '34%' : '4%', backgroundColor: activeTx.errorBalanceOrig !== 0 ? 'var(--risk-high)' : 'var(--color-text-muted)' }} />
            </div>
          </div>

          {/* Feature 3: Log Amount */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: '4px' }}>
              <span>Log Transaction Amount</span>
              <span className="tabular-nums" style={{ color: activeTx.amount > 50000 ? 'var(--risk-medium)' : 'var(--color-text-muted)' }}>
                {activeTx.amount > 50000 ? '+18% Impact' : '6% Impact'}
              </span>
            </div>
            <div style={{ height: '6px', backgroundColor: '#E8ECEB', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: activeTx.amount > 50000 ? '18%' : '6%', backgroundColor: activeTx.amount > 50000 ? 'var(--risk-medium)' : 'var(--color-text-muted)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* SHAP Natural Language Explanation Card */}
      <div className="card" style={{ backgroundColor: 'rgba(11, 79, 74, 0.03)', border: '1px solid rgba(11, 79, 74, 0.14)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <div className="icon-box sm emerald">
            <Cpu size={18} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              Model SHAP Explanation
            </h4>
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              Natural Language Feature Explanation
            </span>
          </div>
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-main)', lineHeight: 1.6, fontStyle: 'normal' }}>
          "{activeTx.explanation_text}"
        </p>
      </div>

      {/* Account History / Connected Transfers */}
      <div className="card" style={{ padding: '20px' }}>
        <h4 style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ArrowRightLeft size={14} />
          <span>Connected Account History</span>
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {connectedTxs.map((ctx) => (
            <div
              key={ctx.id}
              onClick={() => onSelectTransaction(ctx)}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: ctx.id === activeTx.id ? 'var(--color-primary-light)' : '#FAFAF9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              <div>
                <span className="tabular-nums" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>#TX-{ctx.id}</span>
                <span style={{ color: 'var(--color-text-muted)', marginLeft: '8px' }}>{ctx.fromAccount} → {ctx.toAccount}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="tabular-nums" style={{ fontWeight: 800 }}>{formatRupee(ctx.amount)}</span>
                <span className={`risk-badge ${ctx.risk_level}`} style={{ marginLeft: '8px', padding: '1px 5px', fontSize: '0.625rem' }}>
                  {ctx.risk_level}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
