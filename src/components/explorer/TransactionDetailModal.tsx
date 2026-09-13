import React from 'react';
import { Transaction } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { X, AlertCircle, DollarSign, Clock, ShieldAlert, CheckCircle, HelpCircle } from 'lucide-react';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose
}) => {
  if (!transaction) return null;

  const scorePct = Math.min(100, Math.max(0, transaction.predicted_probability * 100));

  // Gauge Arc Math (Semi-circle from 180 deg to 0 deg)
  // Radius r = 70, center at (100, 90)
  // Start angle: PI (180deg), End angle: 0 (0deg)
  const angle = Math.PI - (scorePct / 100) * Math.PI;
  const needleX = 100 + 55 * Math.cos(angle);
  const needleY = 90 - 55 * Math.sin(angle);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(val);
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FAFAF9' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Transaction #TX-{transaction.id}
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              {transaction.type} Details
            </h3>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost"
            style={{ padding: '8px', borderRadius: '50%' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Top Overview Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: '#FAFAF9', border: '1px solid var(--color-border)' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, display: 'block' }}>Amount</span>
              <span className="tabular-nums" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
                {formatCurrency(transaction.amount)}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Risk Tier</span>
              <RiskBadge level={transaction.risk_level} />
            </div>
          </div>

          {/* Risk Score Arc Gauge Card */}
          <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              ML Risk Score Gauge
            </h4>

            {/* SVG Arc Gauge */}
            <div style={{ position: 'relative', width: '200px', height: '110px', margin: '0 auto' }}>
              <svg width="200" height="110" viewBox="0 0 200 110">
                <defs>
                  <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2E8B57" />
                    <stop offset="50%" stopColor="#E8A33D" />
                    <stop offset="100%" stopColor="#E4572E" />
                  </linearGradient>
                </defs>

                {/* Arc Track Background */}
                <path
                  d="M 20 90 A 70 70 0 0 1 180 90"
                  fill="none"
                  stroke="#E8ECEB"
                  strokeWidth="16"
                  strokeLinecap="round"
                />

                {/* Gradient Arc Meter */}
                <path
                  d="M 20 90 A 70 70 0 0 1 180 90"
                  fill="none"
                  stroke="url(#gaugeGradient)"
                  strokeWidth="16"
                  strokeLinecap="round"
                />

                {/* Needle Pointer */}
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

            {/* Gauge Percentage Text */}
            <div className="tabular-nums" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '-12px' }}>
              {scorePct.toFixed(1)}%
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              Model Probability: {transaction.predicted_probability.toFixed(6)}
            </div>

            {/* Action Callout */}
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Recommended Action
              </span>
              <span className={`action-badge ${transaction.recommended_action}`}>
                {transaction.recommended_action === 'APPROVE' && <CheckCircle size={14} />}
                {transaction.recommended_action === 'REVIEW' && <AlertCircle size={14} />}
                {transaction.recommended_action === 'BLOCK' && <ShieldAlert size={14} />}
                <span>{transaction.recommended_action}</span>
              </span>
            </div>
          </div>

          {/* "Why this was flagged" Card */}
          <div className="card" style={{ backgroundColor: 'rgba(11, 79, 74, 0.03)', border: '1px solid rgba(11, 79, 74, 0.12)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div className="icon-box sm">
                <AlertCircle size={18} />
              </div>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                Why this was flagged
              </h4>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-main)', lineHeight: 1.6, fontStyle: 'normal' }}>
              "{transaction.explanation_text}"
            </p>
          </div>

          {/* Full Field Breakdown Grid */}
          <div className="card">
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '14px' }}>
              Feature & Balance Metrics
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.8125rem' }}>
              <div style={{ padding: '10px 12px', backgroundColor: '#FAFAF9', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>Hour of Day</span>
                <strong className="tabular-nums" style={{ color: 'var(--color-text-main)' }}>{transaction.hour_of_day}:00 hrs</strong>
              </div>

              <div style={{ padding: '10px 12px', backgroundColor: '#FAFAF9', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>Amount Log Scale</span>
                <strong className="tabular-nums" style={{ color: 'var(--color-text-main)' }}>{transaction.amount_log.toFixed(4)}</strong>
              </div>

              <div style={{ padding: '10px 12px', backgroundColor: '#FAFAF9', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>Orig Balance Error</span>
                <strong className="tabular-nums" style={{ color: transaction.errorBalanceOrig !== 0 ? 'var(--risk-high)' : 'var(--color-text-main)' }}>
                  {formatCurrency(transaction.errorBalanceOrig)}
                </strong>
              </div>

              <div style={{ padding: '10px 12px', backgroundColor: '#FAFAF9', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>Dest Balance Error</span>
                <strong className="tabular-nums" style={{ color: transaction.errorBalanceDest !== 0 ? 'var(--risk-medium)' : 'var(--color-text-main)' }}>
                  {formatCurrency(transaction.errorBalanceDest)}
                </strong>
              </div>

              <div style={{ padding: '10px 12px', backgroundColor: '#FAFAF9', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>Transfer Flag</span>
                <strong className="tabular-nums">{transaction.type_TRANSFER}</strong>
              </div>

              <div style={{ padding: '10px 12px', backgroundColor: '#FAFAF9', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>Cash-Out Flag</span>
                <strong className="tabular-nums">{transaction.type_CASH_OUT}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
