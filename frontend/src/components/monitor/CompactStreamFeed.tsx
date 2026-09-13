import React from 'react';
import { Transaction } from '../../types';
import { ShieldAlert, ArrowRight, ArrowRightLeft, CheckCircle2, Zap } from 'lucide-react';

interface CompactStreamFeedProps {
  transactions: Transaction[];
  selectedTransactionId: number | null;
  onSelectTransaction: (tx: Transaction) => void;
}

export const CompactStreamFeed: React.FC<CompactStreamFeedProps> = ({
  transactions,
  selectedTransactionId,
  onSelectTransaction
}) => {
  const formatRupee = (val: number) => {
    return `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  // Reverse list so newest stream items appear at the top
  const reversedList = [...transactions].reverse();

  return (
    <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '680px' }}>
      {/* Feed Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--color-border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="icon-box sm emerald">
            <ArrowRightLeft size={16} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              Transaction Stream
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              Live Real-Time Feed
            </span>
          </div>
        </div>

        <div className="status-tag" style={{ fontSize: '0.6875rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span className="status-dot"></span>
          <span>LIVE (1.0s)</span>
        </div>
      </div>

      {/* Stream Items List (Newest at Top) */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
        {reversedList.slice(0, 40).map((tx, idx) => {
          const isSelected = tx.id === selectedTransactionId;
          const isHigh = tx.risk_level === 'HIGH';
          const isMedium = tx.risk_level === 'MEDIUM';
          const isNewest = idx === 0;

          const timeParts = tx.timestamp.split(' ')[1] || '10:42:00';

          return (
            <div
              key={tx.id}
              onClick={() => onSelectTransaction(tx)}
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isSelected
                  ? 'var(--color-emerald-light)'
                  : isHigh
                  ? 'rgba(228, 87, 46, 0.08)'
                  : isMedium
                  ? 'rgba(232, 163, 61, 0.06)'
                  : isNewest
                  ? 'rgba(31, 171, 137, 0.04)'
                  : '#FAFAF9',
                border: `1.5px solid ${
                  isSelected
                    ? 'var(--color-emerald)'
                    : isHigh
                    ? 'var(--risk-high)'
                    : isMedium
                    ? 'var(--risk-medium-border)'
                    : isNewest
                    ? 'rgba(31, 171, 137, 0.3)'
                    : 'var(--color-border-subtle)'
                }`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                boxShadow: isNewest ? 'var(--shadow-sm)' : undefined
              }}
            >
              {/* Top Row: Timestamp & Status */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {isNewest && <Zap size={12} style={{ color: 'var(--color-emerald)' }} />}
                  <span className="tabular-nums" style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>
                    {timeParts}
                  </span>
                </div>

                {isHigh ? (
                  <span className="risk-badge HIGH" style={{ padding: '1px 6px', fontSize: '0.625rem' }}>
                    <ShieldAlert size={10} />
                    <span>FLAGGED</span>
                  </span>
                ) : isMedium ? (
                  <span className="risk-badge MEDIUM" style={{ padding: '1px 6px', fontSize: '0.625rem' }}>
                    <span>REVIEW</span>
                  </span>
                ) : (
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-emerald)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <CheckCircle2 size={10} />
                    <span>OK</span>
                  </span>
                )}
              </div>

              {/* Account Transfer Flow */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                <span className="tabular-nums">{tx.fromAccount.replace('ACC-ORIG-', 'ACC')}</span>
                <ArrowRight size={14} style={{ color: isHigh ? 'var(--risk-high)' : 'var(--color-primary)' }} />
                <span className="tabular-nums">{tx.toAccount.replace('ACC-INTERMEDIARY-', 'ACC').replace('MERCHANT-', 'M-')}</span>
              </div>

              {/* Amount */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span className="tabular-nums" style={{ fontWeight: 800, color: isHigh ? 'var(--risk-high)' : 'var(--color-primary)' }}>
                  {formatRupee(tx.amount)}
                </span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  {tx.type}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
