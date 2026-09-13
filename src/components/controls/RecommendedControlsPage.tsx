import React from 'react';
import { Lock, Gauge, RefreshCw, Users, FileText, Shield, ArrowUpRight } from 'lucide-react';

export const RecommendedControlsPage: React.FC = () => {
  const controls = [
    {
      icon: Lock,
      title: 'Dual Authorization for HIGH-Risk Transactions',
      subtitle: 'Pre-Settlement Interception',
      description: 'Mandate explicit multi-signature sign-off from two authorized risk officers before clearing any transaction flagged with a risk score exceeding 0.70 (HIGH tier). Prevents unauthorized high-value cash-outs.',
      tag: 'Critical Guardrail'
    },
    {
      icon: Gauge,
      title: 'Independent Account Velocity Limits',
      subtitle: 'Deterministic Circuit Breakers',
      description: 'Enforce strict hard volume and frequency caps per account within rolling 1-hour and 24-hour windows. Operates independently of ML predictions as a deterministic safety net.',
      tag: 'Rule Engine'
    },
    {
      icon: RefreshCw,
      title: 'Monitored Monthly Model Retraining',
      subtitle: 'Performance Decay Prevention',
      description: 'Schedule automated monthly retraining pipelines using freshly labeled settlement feedback. Monitor precision, recall, and PR-AUC drift on real-time dashboards to trigger retraining when decay thresholds are breached.',
      tag: 'MLOps Lifecycle'
    },
    {
      icon: Users,
      title: 'Human-in-the-Loop Review Queue',
      subtitle: 'MEDIUM-Risk Escalation',
      description: 'Direct all transactions scoring between 0.30 and 0.70 to dedicated audit queues with contextual SHAP/tree explanations, ensuring human judgment resolves ambiguous edge cases.',
      tag: 'Operational Audit'
    },
    {
      icon: FileText,
      title: 'Full Audit Trail & Explanation Logging',
      subtitle: 'Regulatory Compliance & Lineage',
      description: 'Persist an immutable, time-stamped log of every transaction evaluation, including feature inputs, raw model confidence scores, assigned risk tiers, and natural language explanations for compliance reporting.',
      tag: 'Governance & Regulatory'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Page Header */}
      <div className="card" style={{ padding: '28px 32px', backgroundColor: '#FAFAF9', border: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="icon-box lg">
            <Shield size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '4px' }}>
              Recommended Governance Controls
            </h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)', maxWidth: '720px' }}>
              Institutional risk mitigation framework for EFOS Global Finance Hackathon 2026. Combining machine learning predictions with deterministic operational controls.
            </p>
          </div>
        </div>
      </div>

      {/* 5 Governance Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {controls.map((item, index) => {
          const IconComp = item.icon;

          return (
            <div
              key={index}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '28px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div className="icon-box lg">
                    <IconComp size={24} />
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--color-primary)',
                      backgroundColor: 'var(--color-primary-light)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      letterSpacing: '0.02em'
                    }}
                  >
                    {item.tag}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '4px' }}>
                  {item.title}
                </h3>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-emerald)', marginBottom: '12px' }}>
                  {item.subtitle}
                </div>

                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                  {item.description}
                </p>
              </div>

              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                <span>Control #0{index + 1} Protocol</span>
                <ArrowUpRight size={16} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
