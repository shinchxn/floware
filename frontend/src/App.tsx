import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, ModelDetails, ActiveTab } from './types';
import { autoLoadProjectData } from './utils/autoDataLoader';
import { calculatePerformanceMetrics } from './utils/metrics';
import { Header } from './components/common/Header';
import { FinancialFlowCanvas } from './components/flow/FinancialFlowCanvas';
import { CompactStreamFeed } from './components/monitor/CompactStreamFeed';
import { ShapInspectorPanel } from './components/inspector/ShapInspectorPanel';
import { AuditorQueuePage } from './components/auditor/AuditorQueuePage';
import { RecommendedControlsPage } from './components/controls/RecommendedControlsPage';
import { OverviewPage } from './components/overview/OverviewPage';
import { Cpu } from 'lucide-react';

export const App: React.FC = () => {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [modelDetails, setModelDetails] = useState<ModelDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadCount, setLoadCount] = useState(0);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Stream Feed Pointer (Starts with initial window of 35 transactions, ticks every 350ms for rapid demo)
  const [streamIndex, setStreamIndex] = useState(35);

  // Selection & Investigation Focus State
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  // Auto-load project dataset on initial startup
  useEffect(() => {
    let isMounted = true;
    autoLoadProjectData((pct, count) => {
      if (isMounted) {
        setLoadProgress(pct);
        setLoadCount(count);
      }
    })
      .then(({ transactions: data, modelDetails: model }) => {
        if (isMounted) {
          setAllTransactions(data);
          setModelDetails(model);
          setIsLoading(false);
          if (data.length > 0) {
            const firstFlagged = data.find((t) => t.risk_level === 'HIGH');
            if (firstFlagged) {
              setSelectedTransaction(firstFlagged);
              setSelectedAccountId(firstFlagged.fromAccount);
            } else {
              setSelectedTransaction(data[0]);
              setSelectedAccountId(data[0].fromAccount);
            }
          }
        }
      })
      .catch((err) => {
        console.error('Failed to auto-load project data:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Continuous Autonomous Stream Ticker (Advances live transactions every 1,000ms)
  useEffect(() => {
    if (isLoading || allTransactions.length === 0) return;

    const interval = setInterval(() => {
      setStreamIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        const actualIdx = nextIndex % allTransactions.length;
        const incomingTx = allTransactions[actualIdx];

        // If incoming transaction is flagged as HIGH risk, auto-focus ML Interception!
        if (incomingTx && incomingTx.risk_level === 'HIGH') {
          setSelectedTransaction(incomingTx);
          setSelectedAccountId(incomingTx.fromAccount);
        }

        return nextIndex;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoading, allTransactions]);

  // Derived current visible stream slice (grows continuously and loops seamlessly)
  const visibleTransactions = useMemo(() => {
    if (allTransactions.length === 0) return [];
    if (streamIndex <= allTransactions.length) {
      return allTransactions.slice(0, streamIndex);
    }
    const remainder = streamIndex % allTransactions.length;
    return [...allTransactions, ...allTransactions.slice(0, remainder)];
  }, [allTransactions, streamIndex]);

  const metrics = useMemo(() => {
    return calculatePerformanceMetrics(visibleTransactions);
  }, [visibleTransactions]);

  const handleSelectTransaction = (tx: Transaction) => {
    setSelectedTransaction(tx);
    setSelectedAccountId(tx.fromAccount);
  };

  const handleSelectAccount = (accountId: string) => {
    setSelectedAccountId(accountId);
    if (accountId) {
      const match = visibleTransactions.find((t) => t.fromAccount === accountId || t.toAccount === accountId);
      if (match) setSelectedTransaction(match);
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)', padding: '24px' }}>
        <div className="card" style={{ maxWidth: '520px', width: '100%', textAlign: 'center', padding: '40px 32px' }}>
          <div className="icon-box lg emerald" style={{ margin: '0 auto 20px auto' }}>
            <Cpu size={32} className="animate-spin" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '8px' }}>
            FLOWARE Initializing
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
            Loading live financial flow ecosystem & pre-trained XGBoost SHAP logic...
          </p>

          <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 700 }}>
            <span>{loadProgress}% Loaded</span>
            <span className="tabular-nums">{loadCount.toLocaleString()} rows</span>
          </div>
          <div style={{ height: '8px', backgroundColor: 'var(--color-border-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                backgroundColor: 'var(--color-emerald)',
                width: `${loadProgress}%`,
                transition: 'width 0.15s ease'
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        transactionCount={visibleTransactions.length}
      />

      <main className="main-container">
        {activeTab === 'overview' && (
          /* Autonomous Live Financial Flow Master Layout */
          <div style={{ display: 'grid', gridTemplateColumns: '22% 52% 26%', gap: '20px', alignItems: 'start' }}>
            {/* Left 22%: Compact Transaction Stream Side Feed */}
            <div>
              <CompactStreamFeed
                transactions={visibleTransactions}
                selectedTransactionId={selectedTransaction?.id || null}
                onSelectTransaction={handleSelectTransaction}
              />
            </div>

            {/* Center 52%: Live Financial Flow Canvas */}
            <div>
              <FinancialFlowCanvas
                transactions={visibleTransactions}
                focusedAccountId={selectedAccountId}
                focusedTxId={selectedTransaction?.id || null}
                onSelectAccount={handleSelectAccount}
                onSelectTransaction={handleSelectTransaction}
              />
            </div>

            {/* Right 26%: Model Risk & SHAP Inspector Panel */}
            <div>
              <ShapInspectorPanel
                selectedTransaction={selectedTransaction}
                selectedAccountId={selectedAccountId}
                allTransactions={visibleTransactions}
                onSelectTransaction={handleSelectTransaction}
              />
            </div>
          </div>
        )}

        {activeTab === 'explorer' && (
          <OverviewPage
            transactions={visibleTransactions}
            metrics={metrics}
            modelDetails={modelDetails}
          />
        )}

        {activeTab === 'auditor' && (
          <AuditorQueuePage transactions={visibleTransactions} />
        )}

        {activeTab === 'controls' && (
          <RecommendedControlsPage />
        )}
      </main>

      <footer style={{ borderTop: '1px solid var(--color-border-subtle)', padding: '16px 32px', backgroundColor: '#FAFAF9', fontSize: '0.8125rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <strong>FLOWARE Live Financial Flow Engine</strong> — EFOS Global Finance Hackathon 2026 (Track 02: Audit & Risk)
        </div>
        <div>
          Continuous Live Stream (1.0s Ticker) • XGBoost Model Interception & SHAP Explanations
        </div>
      </footer>
    </div>
  );
};

export default App;
