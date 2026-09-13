import React, { useState, useMemo } from 'react';
import { Transaction } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { TransactionDetailModal } from '../explorer/TransactionDetailModal';
import { UserCheck, HelpCircle, Eye, ShieldAlert, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

interface AuditorQueuePageProps {
  transactions: Transaction[];
}

export const AuditorQueuePage: React.FC<AuditorQueuePageProps> = ({ transactions }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Filter to MEDIUM and HIGH risk transactions ONLY, sorted by risk score descending
  const queueTransactions = useMemo(() => {
    return transactions
      .filter((t) => t.risk_level === 'MEDIUM' || t.risk_level === 'HIGH')
      .sort((a, b) => b.predicted_probability - a.predicted_probability);
  }, [transactions]);

  const totalPages = Math.ceil(queueTransactions.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentRows = queueTransactions.slice(startIndex, startIndex + pageSize);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(val);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Queue Header Banner */}
      <div
        className="card"
        style={{
          padding: '24px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderLeft: '5px solid var(--risk-high)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="icon-box lg" style={{ backgroundColor: 'var(--risk-high-bg)', color: 'var(--risk-high)' }}>
            <UserCheck size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '4px' }}>
              Human-in-the-Loop Auditor Queue
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Prioritized review queue showing MEDIUM and HIGH risk transactions ordered by risk score descending.
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div className="tabular-nums" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--risk-high)' }}>
            {queueTransactions.length.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Pending Items
          </div>
        </div>
      </div>

      {/* Auditor Queue Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Risk Score</th>
              <th>Risk Tier</th>
              <th>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span>Ground Truth (Validation)</span>
                  <div className="tooltip-trigger">
                    <HelpCircle size={14} style={{ color: 'var(--color-text-muted)' }} />
                    <div className="tooltip-box">
                      Shown ONLY because this is labeled validation data. In production, actual ground truth labels would not be available at review time.
                    </div>
                  </div>
                </div>
              </th>
              <th>Recommended Action</th>
              <th style={{ textAlign: 'right' }}>Inspect</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.length > 0 ? (
              currentRows.map((tx) => {
                const isActualFraud = tx.actual_isFraud === 1 || String(tx.actual_isFraud) === '1.0';

                return (
                  <tr key={tx.id} onClick={() => setSelectedTransaction(tx)}>
                    <td className="tabular-nums" style={{ fontWeight: 600, color: 'var(--color-text-muted)' }}>
                      #TX-{tx.id}
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--color-primary)' }}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="tabular-nums" style={{ fontWeight: 700 }}>
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="tabular-nums" style={{ fontWeight: 800, color: 'var(--risk-high)' }}>
                      {(tx.predicted_probability * 100).toFixed(1)}%
                    </td>
                    <td>
                      <RiskBadge level={tx.risk_level} />
                    </td>
                    <td>
                      {isActualFraud ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--risk-high)', fontWeight: 700, fontSize: '0.8125rem' }}>
                          <ShieldAlert size={14} />
                          <span>Actual Fraud (1.0)</span>
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--risk-low)', fontWeight: 600, fontSize: '0.8125rem' }}>
                          <CheckCircle2 size={14} />
                          <span>Legitimate (0.0)</span>
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`action-badge ${tx.recommended_action}`} style={{ fontSize: '0.75rem', padding: '3px 10px' }}>
                        {tx.recommended_action}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: '0.75rem' }}>
                        <Eye size={14} />
                        <span>Review</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-text-muted)' }}>
                  No MEDIUM or HIGH risk transactions requiring review in this dataset.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', backgroundColor: '#FAFAF9', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            Page <span className="tabular-nums" style={{ color: 'var(--color-text-main)', fontWeight: 700 }}>{currentPage}</span> of <span className="tabular-nums" style={{ color: 'var(--color-text-main)', fontWeight: 700 }}>{totalPages}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="btn btn-secondary"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              style={{ padding: '6px 12px', fontSize: '0.8125rem', opacity: currentPage <= 1 ? 0.5 : 1 }}
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>
            <button
              className="btn btn-secondary"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              style={{ padding: '6px 12px', fontSize: '0.8125rem', opacity: currentPage >= totalPages ? 0.5 : 1 }}
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Slide-over Detail Modal */}
      <TransactionDetailModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  );
};
