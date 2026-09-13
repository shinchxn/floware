import React from 'react';
import { ActiveTab } from '../../types';
import { ShieldAlert, Activity, BarChart2, UserCheck, ShieldCheck, Database } from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  transactionCount: number;
  onResetData?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  transactionCount
}) => {
  return (
    <header className="header">
      <div className="header-brand">
        <div className="header-logo">
          <ShieldAlert size={22} />
        </div>
        <div>
          <div className="header-title">FLOWARE</div>
          <div className="header-subtitle">Real-Time Financial Transaction Monitoring & SHAP Explanation Engine</div>
        </div>
      </div>

      <nav className="nav-tabs">
        <button
          className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Activity size={16} />
          <span>Live Monitor</span>
        </button>
        <button
          className={`nav-tab ${activeTab === 'explorer' ? 'active' : ''}`}
          onClick={() => setActiveTab('explorer')}
        >
          <BarChart2 size={16} />
          <span>Model Performance</span>
        </button>
        <button
          className={`nav-tab ${activeTab === 'auditor' ? 'active' : ''}`}
          onClick={() => setActiveTab('auditor')}
        >
          <UserCheck size={16} />
          <span>Auditor Queue</span>
        </button>
        <button
          className={`nav-tab ${activeTab === 'controls' ? 'active' : ''}`}
          onClick={() => setActiveTab('controls')}
        >
          <ShieldCheck size={16} />
          <span>Governance Controls</span>
        </button>
      </nav>

      <div className="header-actions">
        {transactionCount > 0 && (
          <div className="status-tag">
            <span className="status-dot"></span>
            <Database size={12} />
            <span className="tabular-nums">{transactionCount.toLocaleString()} Live Stream Records</span>
          </div>
        )}
      </div>
    </header>
  );
};
