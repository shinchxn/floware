import React from 'react';
import { Transaction, ModelDetails, PerformanceMetrics } from '../../types';
import { ShieldCheck, AlertOctagon, TrendingUp, Layers, HelpCircle, Activity, Cpu, CheckCircle } from 'lucide-react';

interface OverviewPageProps {
  transactions: Transaction[];
  metrics: PerformanceMetrics;
  modelDetails: ModelDetails | null;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  transactions,
  metrics,
  modelDetails
}) => {
  // Compute total volume
  const totalVolume = transactions.reduce((acc, t) => acc + (t.amount || 0), 0);

  // Format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  const lowPct = metrics.totalCount > 0 ? (metrics.riskCounts.LOW / metrics.totalCount) * 100 : 0;
  const medPct = metrics.totalCount > 0 ? (metrics.riskCounts.MEDIUM / metrics.totalCount) * 100 : 0;
  const highPct = metrics.totalCount > 0 ? (metrics.riskCounts.HIGH / metrics.totalCount) * 100 : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Positive Framing Banner */}
      <div
        className="card"
        style={{
          backgroundColor: 'var(--color-primary)',
          color: '#FFFFFF',
          padding: '28px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ backgroundColor: 'rgba(31, 171, 137, 0.25)', color: '#53F6CE', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em' }}>
              PROTECTIVE GUARDIAN ACTIVE
            </span>
            <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
              PaySim Scored Validation Output
            </span>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#FFFFFF', marginBottom: '6px' }}>
            {metrics.totalCount.toLocaleString()} Transactions Protected
          </h2>
          <p style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.85)', maxWidth: '780px', lineHeight: 1.5 }}>
            {(100 - metrics.fraudPercentage).toFixed(2)}% of transaction traffic cleared seamlessly, with {(metrics.recall * 100).toFixed(1)}% of potential fraud intercepted prior to settlement.
          </p>
        </div>

        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div className="tabular-nums" style={{ fontSize: '2rem', fontWeight: 800, color: '#53F6CE' }}>
            {formatCurrency(totalVolume)}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            Total Monitored Volume
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        {/* KPI 1: Total Volume & Count */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Scored Rows
            </span>
            <div className="icon-box sm">
              <Layers size={18} />
            </div>
          </div>
          <div className="tabular-nums" style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '4px' }}>
            {metrics.totalCount.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-emerald)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle size={14} />
            <span>100% Parsed & Analyzed</span>
          </div>
        </div>

        {/* KPI 2: Identified Fraud */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Flagged Fraud Count
            </span>
            <div className="icon-box sm" style={{ backgroundColor: 'var(--risk-high-bg)', color: 'var(--risk-high)' }}>
              <AlertOctagon size={18} />
            </div>
          </div>
          <div className="tabular-nums" style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--risk-high)', marginBottom: '4px' }}>
            {metrics.fraudCount.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            {metrics.fraudPercentage.toFixed(2)}% overall prevalence
          </div>
        </div>

        {/* KPI 3: High Risk Tier */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              High Risk Tier
            </span>
            <div className="icon-box sm" style={{ backgroundColor: 'var(--risk-high-bg)', color: 'var(--risk-high)' }}>
              <Activity size={18} />
            </div>
          </div>
          <div className="tabular-nums" style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--risk-high)', marginBottom: '4px' }}>
            {metrics.riskCounts.HIGH.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            {highPct.toFixed(1)}% requiring dual auth
          </div>
        </div>

        {/* KPI 4: Cleared Low Risk */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Cleared Low Risk
            </span>
            <div className="icon-box sm emerald">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="tabular-nums" style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--risk-low)', marginBottom: '4px' }}>
            {metrics.riskCounts.LOW.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-emerald)', fontWeight: 600 }}>
            {lowPct.toFixed(1)}% instant auto-approval
          </div>
        </div>
      </div>

      {/* Middle Grid: Risk Distribution Chart & Model Performance Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Risk Tier Distribution */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              Risk Tier Distribution
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              Live Count & Proportion
            </span>
          </div>

          {/* Distribution Visual Stacked Bar */}
          <div style={{ height: '16px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-border-subtle)', overflow: 'hidden', display: 'flex', marginBottom: '28px' }}>
            <div style={{ width: `${lowPct}%`, backgroundColor: 'var(--risk-low)', height: '100%', transition: 'width 0.3s' }} title={`LOW: ${metrics.riskCounts.LOW}`} />
            <div style={{ width: `${medPct}%`, backgroundColor: 'var(--risk-medium)', height: '100%', transition: 'width 0.3s' }} title={`MEDIUM: ${metrics.riskCounts.MEDIUM}`} />
            <div style={{ width: `${highPct}%`, backgroundColor: 'var(--risk-high)', height: '100%', transition: 'width 0.3s' }} title={`HIGH: ${metrics.riskCounts.HIGH}`} />
          </div>

          {/* Breakdown Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* LOW */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 'var(--radius-md)', backgroundColor: '#FAFAF9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--risk-low)' }}></span>
                <div>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text-main)' }}>LOW Risk Tier</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Auto-Approve (&lt;0.3 prob)</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="tabular-nums" style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-text-main)' }}>{metrics.riskCounts.LOW.toLocaleString()}</span>
                <span className="tabular-nums" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>{lowPct.toFixed(1)}%</span>
              </div>
            </div>

            {/* MEDIUM */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 'var(--radius-md)', backgroundColor: '#FAFAF9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--risk-medium)' }}></span>
                <div>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text-main)' }}>MEDIUM Risk Tier</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Auditor Review Queue (0.3 - 0.7)</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="tabular-nums" style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-text-main)' }}>{metrics.riskCounts.MEDIUM.toLocaleString()}</span>
                <span className="tabular-nums" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>{medPct.toFixed(1)}%</span>
              </div>
            </div>

            {/* HIGH */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 'var(--radius-md)', backgroundColor: '#FAFAF9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--risk-high)' }}></span>
                <div>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text-main)' }}>HIGH Risk Tier</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Dual Auth / Hold (&gt;0.7 prob)</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="tabular-nums" style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-text-main)' }}>{metrics.riskCounts.HIGH.toLocaleString()}</span>
                <span className="tabular-nums" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>{highPct.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Model Performance Metrics Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                Model Performance
              </h3>
              <div className="tooltip-trigger">
                <HelpCircle size={15} style={{ color: 'var(--color-text-muted)' }} />
                <div className="tooltip-box">
                  Calculated live on uploaded ground truth labels (`actual_isFraud`) vs model confidence at 0.5 decision threshold.
                </div>
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-emerald)', fontWeight: 700, backgroundColor: 'var(--color-emerald-light)', padding: '3px 8px', borderRadius: 'var(--radius-sm)' }}>
              LIVE CALCULATED
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Precision */}
            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: '#FAFAF9', border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                Precision
              </div>
              <div className="tabular-nums" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                {metrics.precision.toFixed(2)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                TP / (TP + FP) = {metrics.tp.toLocaleString()} / {(metrics.tp + metrics.fp).toLocaleString()}
              </div>
            </div>

            {/* Recall */}
            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: '#FAFAF9', border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                Recall
              </div>
              <div className="tabular-nums" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                {metrics.recall.toFixed(2)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                TP / (TP + FN) = {metrics.tp.toLocaleString()} / {(metrics.tp + metrics.fn).toLocaleString()}
              </div>
            </div>

            {/* F1 Score */}
            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: '#FAFAF9', border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                F1 Score
              </div>
              <div className="tabular-nums" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                {metrics.f1Score.toFixed(2)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Harmonic Mean Precision & Recall
              </div>
            </div>

            {/* PR-AUC */}
            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: '#FAFAF9', border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                PR-AUC
              </div>
              <div className="tabular-nums" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                {metrics.prAuc.toFixed(2)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Area Under Precision-Recall Curve
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Model Details Card (Shown ONLY if XGBoost JSON model was uploaded) */}
      {modelDetails && (
        <div className="card" style={{ border: '1px solid rgba(11, 79, 74, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div className="icon-box emerald">
              <Cpu size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                Trained Model Details (`model_B.json`)
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                Extracted directly from native XGBoost JSON structure
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' }}>
            {/* Num Trees */}
            <div style={{ padding: '14px 18px', backgroundColor: '#FAFAF9', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                Ensemble Trees
              </div>
              <div className="tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
                {modelDetails.numTrees} trees
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                learner.gradient_booster.model.gbtree_model_param.num_trees
              </div>
            </div>

            {/* Objective */}
            <div style={{ padding: '14px 18px', backgroundColor: '#FAFAF9', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                Objective Function
              </div>
              <div className="tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
                {modelDetails.objectiveName}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                learner.objective.name
              </div>
            </div>

            {/* Scale Pos Weight */}
            <div style={{ padding: '14px 18px', backgroundColor: '#FAFAF9', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                Class Imbalance Weight
              </div>
              <div className="tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
                {modelDetails.scalePosWeight}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                learner.objective.reg_loss_param.scale_pos_weight
              </div>
            </div>
          </div>

          {/* Feature Names List */}
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '8px' }}>
              Feature Names Used in Ensemble (`learner.feature_names`):
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {modelDetails.featureNames.map((feat, idx) => (
                <span
                  key={idx}
                  style={{
                    backgroundColor: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    fontFamily: 'monospace'
                  }}
                >
                  {feat}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
