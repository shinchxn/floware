import React, { useState, useMemo } from 'react';
import { Transaction, RiskLevel } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { TransactionDetailModal } from './TransactionDetailModal';
import { Search, Filter, ChevronLeft, ChevronRight, Eye, AlertCircle } from 'lucide-react';

interface TransactionExplorerProps {
  transactions: Transaction[];
}

export const TransactionExplorer: React.FC<TransactionExplorerProps> = ({ transactions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<RiskLevel | 'ALL'>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Filter pipeline
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Risk filter
      if (selectedRisk !== 'ALL' && t.risk_level !== selectedRisk) {
        return false;
      }
      // Type filter
      if (selectedType !== 'ALL' && t.type !== selectedType) {
        return false;
      }
      // Search term
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const amtStr = t.amount.toString();
        const typeStr = t.type.toLowerCase();
        const expStr = t.explanation_text.toLowerCase();
        const actStr = t.recommended_action.toLowerCase();

        return (
          amtStr.includes(query) ||
          typeStr.includes(query) ||
          expStr.includes(query) ||
          actStr.includes(query)
        );
      }
      return true;
    });
  }, [transactions, selectedRisk, selectedType, searchTerm]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedRisk, selectedType, searchTerm, pageSize]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredTransactions.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentRows = filteredTransactions.slice(startIndex, startIndex + pageSize);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(val);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Controls & Filters Bar */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          {/* Risk Filter Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-muted)', marginRight: '4px' }}>
              Risk Level:
            </span>
            {(['ALL', 'LOW', 'MEDIUM', 'HIGH'] as const).map((lvl) => (
              <button
                key={lvl}
                className={`btn ${selectedRisk === lvl ? (lvl === 'ALL' ? 'btn-primary' : '') : 'btn-secondary'}`}
                onClick={() => setSelectedRisk(lvl)}
                style={{
                  padding: '6px 14px',
                  fontSize: '0.8125rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: selectedRisk === lvl && lvl !== 'ALL'
                    ? (lvl === 'LOW' ? 'var(--risk-low-bg)' : lvl === 'MEDIUM' ? 'var(--risk-medium-bg)' : 'var(--risk-high-bg)')
                    : undefined,
                  color: selectedRisk === lvl && lvl !== 'ALL'
                    ? (lvl === 'LOW' ? 'var(--risk-low)' : lvl === 'MEDIUM' ? 'var(--risk-medium)' : 'var(--risk-high)')
                    : undefined,
                  borderColor: selectedRisk === lvl && lvl !== 'ALL'
                    ? (lvl === 'LOW' ? 'var(--risk-low-border)' : lvl === 'MEDIUM' ? 'var(--risk-medium-border)' : 'var(--risk-high-border)')
                    : undefined
                }}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Search Input & Type Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, maxWidth: '520px' }}>
            {/* Search Box */}
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search amount, explanation, or action..."
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.875rem',
                  outline: 'none',
                  backgroundColor: '#FAFAF9'
                }}
              />
            </div>

            {/* Type Dropdown Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{
                padding: '9px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                fontSize: '0.875rem',
                backgroundColor: '#FAFAF9',
                color: 'var(--color-text-main)',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">All Types</option>
              <option value="PAYMENT">PAYMENT</option>
              <option value="TRANSFER">TRANSFER</option>
              <option value="CASH_OUT">CASH_OUT</option>
              <option value="CASH_IN">CASH_IN</option>
              <option value="DEBIT">DEBIT</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
          Showing <span className="tabular-nums" style={{ color: 'var(--color-text-main)', fontWeight: 700 }}>{filteredTransactions.length.toLocaleString()}</span> matching transactions
        </div>

        {/* Rows per page selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
          <span>Rows per page:</span>
          {[25, 50, 100].map((sz) => (
            <button
              key={sz}
              className={`btn ${pageSize === sz ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setPageSize(sz)}
              style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: 'var(--radius-sm)' }}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Risk Score</th>
              <th>Risk Tier</th>
              <th>Action</th>
              <th>Explanation Snippet</th>
              <th style={{ textAlign: 'right' }}>Inspect</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.length > 0 ? (
              currentRows.map((tx) => (
                <tr key={tx.id} onClick={() => setSelectedTransaction(tx)}>
                  <td className="tabular-nums" style={{ fontWeight: 600, color: 'var(--color-text-muted)' }}>
                    #TX-{tx.id}
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, fontSize: '0.8125rem', letterSpacing: '0.02em', color: 'var(--color-primary)' }}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="tabular-nums" style={{ fontWeight: 700 }}>
                    {formatCurrency(tx.amount)}
                  </td>
                  <td className="tabular-nums" style={{ fontWeight: 700, color: tx.predicted_probability > 0.5 ? 'var(--risk-high)' : 'var(--color-text-main)' }}>
                    {(tx.predicted_probability * 100).toFixed(1)}%
                  </td>
                  <td>
                    <RiskBadge level={tx.risk_level} />
                  </td>
                  <td>
                    <span className={`action-badge ${tx.recommended_action}`} style={{ fontSize: '0.75rem', padding: '3px 10px' }}>
                      {tx.recommended_action}
                    </span>
                  </td>
                  <td style={{ maxWidth: '340px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
                    {tx.explanation_text}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: '0.75rem' }}>
                      <Eye size={14} />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-text-muted)' }}>
                  <AlertCircle size={28} style={{ margin: '0 auto 8px auto', display: 'block', opacity: 0.5 }} />
                  No transactions match the selected filters or search query.
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
