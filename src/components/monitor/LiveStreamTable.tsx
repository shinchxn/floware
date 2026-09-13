import React, { useState, useMemo } from 'react';
import { Transaction, ViewFilter } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { Search, ShieldAlert, CheckCircle2, ChevronLeft, ChevronRight, ArrowRightLeft } from 'lucide-react';

interface LiveStreamTableProps {
  transactions: Transaction[];
  selectedTransactionId: number | null;
  onSelectTransaction: (tx: Transaction) => void;
}

export const LiveStreamTable: React.FC<LiveStreamTableProps> = ({
  transactions,
  selectedTransactionId,
  onSelectTransaction
}) => {
  const [filter, setFilter] = useState<ViewFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 35;

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Risk filter
      if (filter === 'FLAGGED' && tx.risk_level !== 'HIGH') return false;
      if (filter === 'MEDIUM' && tx.risk_level !== 'MEDIUM') return false;
      if (filter === 'LOW' && tx.risk_level !== 'LOW') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          tx.fromAccount.toLowerCase().includes(q) ||
          tx.toAccount.toLowerCase().includes(q) ||
          tx.id.toString().includes(q) ||
          tx.type.toLowerCase().includes(q) ||
          tx.amount.toString().includes(q) ||
          tx.explanation_text.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [transactions, filter, searchQuery]);

  const totalPages = Math.ceil(filteredTransactions.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentRows = filteredTransactions.slice(startIndex, startIndex + pageSize);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(val);
  };

  return (
    <div className="table-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '620px' }}>
      {/* Table Header Controls */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', backgroundColor: '#FAFAF9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="icon-box sm emerald">
            <ArrowRightLeft size={16} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              Live Transaction Stream
            </h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              {filteredTransactions.length.toLocaleString()} Active Stream Records
            </div>
          </div>
        </div>

        {/* Search & Risk Filter Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search account / ID..."
              style={{
                width: '100%',
                padding: '6px 10px 6px 30px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                fontSize: '0.8125rem',
                outline: 'none',
                backgroundColor: '#FFFFFF'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {(['ALL', 'FLAGGED', 'MEDIUM', 'LOW'] as const).map((f) => (
              <button
                key={f}
                className={`btn ${filter === f ? (f === 'FLAGGED' ? 'btn-primary' : 'btn-secondary') : 'btn-ghost'}`}
                onClick={() => { setFilter(f); setCurrentPage(1); }}
                style={{
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: filter === f && f === 'FLAGGED' ? 'var(--risk-high)' : undefined,
                  color: filter === f && f === 'FLAGGED' ? '#FFFFFF' : undefined
                }}
              >
                {f === 'FLAGGED' ? 'FLAGGED (HIGH)' : f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stream Table */}
      <div style={{ flex: 1, overflowY: 'auto', maxHeight: '560px' }}>
        <table className="custom-table" style={{ fontSize: '0.8125rem' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
            <tr>
              <th>Timestamp</th>
              <th>Transaction ID</th>
              <th>From Account</th>
              <th>To Account</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.map((tx) => {
              const isSelected = tx.id === selectedTransactionId;
              const isFlagged = tx.risk_level === 'HIGH';
              const isMedium = tx.risk_level === 'MEDIUM';

              let rowBg = 'transparent';
              if (isSelected) {
                rowBg = 'rgba(31, 171, 137, 0.12)';
              } else if (isFlagged) {
                rowBg = 'rgba(228, 87, 46, 0.06)';
              } else if (isMedium) {
                rowBg = 'rgba(232, 163, 61, 0.05)';
              }

              return (
                <tr
                  key={tx.id}
                  onClick={() => onSelectTransaction(tx)}
                  style={{
                    backgroundColor: rowBg,
                    borderLeft: isFlagged ? '4px solid var(--risk-high)' : isMedium ? '4px solid var(--risk-medium)' : '4px solid transparent',
                    fontWeight: isFlagged || isSelected ? 700 : 400
                  }}
                >
                  <td className="tabular-nums" style={{ color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                    {tx.timestamp.split(' ')[1]}
                  </td>
                  <td className="tabular-nums" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                    #TX-{tx.id}
                  </td>
                  <td className="tabular-nums" style={{ fontWeight: isFlagged ? 800 : 600, color: isFlagged ? 'var(--risk-high)' : 'var(--color-text-main)' }}>
                    {tx.fromAccount}
                  </td>
                  <td className="tabular-nums" style={{ fontWeight: isFlagged ? 800 : 600, color: isFlagged ? 'var(--risk-high)' : 'var(--color-text-main)' }}>
                    {tx.toAccount}
                  </td>
                  <td className="tabular-nums" style={{ fontWeight: 800 }}>
                    {formatCurrency(tx.amount)}
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.02em', color: 'var(--color-primary)' }}>
                      {tx.type}
                    </span>
                  </td>
                  <td>
                    {isFlagged ? (
                      <span className="risk-badge HIGH" style={{ padding: '2px 8px', fontSize: '0.6875rem' }}>
                        <ShieldAlert size={10} />
                        <span>FLAGGED</span>
                      </span>
                    ) : isMedium ? (
                      <span className="risk-badge MEDIUM" style={{ padding: '2px 8px', fontSize: '0.6875rem' }}>
                        <span>REVIEW</span>
                      </span>
                    ) : (
                      <span className="risk-badge LOW" style={{ padding: '2px 8px', fontSize: '0.6875rem' }}>
                        <CheckCircle2 size={10} />
                        <span>APPROVED</span>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid var(--color-border)', backgroundColor: '#FAFAF9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
        <div style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>
          Page <span className="tabular-nums" style={{ fontWeight: 800, color: 'var(--color-text-main)' }}>{currentPage}</span> of <span className="tabular-nums" style={{ fontWeight: 800, color: 'var(--color-text-main)' }}>{totalPages}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            className="btn btn-secondary"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            style={{ padding: '4px 10px', fontSize: '0.75rem', opacity: currentPage <= 1 ? 0.5 : 1 }}
          >
            <ChevronLeft size={14} />
            <span>Prev</span>
          </button>
          <button
            className="btn btn-secondary"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            style={{ padding: '4px 10px', fontSize: '0.75rem', opacity: currentPage >= totalPages ? 0.5 : 1 }}
          >
            <span>Next</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
