import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, FileCode, CheckCircle2, ShieldCheck, ArrowRight, Play, Cpu } from 'lucide-react';
import { Transaction, ModelDetails } from '../../types';
import { parseCSVFile } from '../../utils/csvParser';
import { parseXGBoostModelJSON } from '../../utils/modelParser';
import { enrichTransactionsWithAccounts } from '../../utils/graphBuilder';

interface UploadScreenProps {
  onDataLoaded: (transactions: Transaction[], modelDetails: ModelDetails | null) => void;
}

export const UploadScreen: React.FC<UploadScreenProps> = ({ onDataLoaded }) => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadedRowCount, setLoadedRowCount] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const csvInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  const handleCsvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleJsonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setJsonFile(e.target.files[0]);
    }
  };

  const startProcessing = async (cFile: File, jFile: File | null) => {
    setIsParsing(true);
    setError(null);
    setStatusMessage('Analyzing your transaction data...');

    let parsedModelDetails: ModelDetails | null = null;
    if (jFile) {
      try {
        const jsonText = await jFile.text();
        parsedModelDetails = parseXGBoostModelJSON(jsonText);
      } catch (err) {
        console.warn('Failed to parse optional JSON model file:', err);
      }
    }

    parseCSVFile(
      cFile,
      (pct, count) => {
        setProgress(pct);
        setLoadedRowCount(count);
      },
      (rawTransactions) => {
        const enriched = enrichTransactionsWithAccounts(rawTransactions);
        setIsParsing(false);
        setSuccessCount(enriched.length);
        setTimeout(() => {
          onDataLoaded(enriched, parsedModelDetails);
        }, 900);
      },
      (errMessage) => {
        setIsParsing(false);
        setError(errMessage);
      }
    );
  };

  const handleLoadSampleDataset = async () => {
    setIsParsing(true);
    setError(null);
    setStatusMessage('Loading local hackathon dataset...');

    try {
      // Fetch final_scored_transactions .csv
      const csvResponse = await fetch('/final_scored_transactions .csv');
      if (!csvResponse.ok) {
        throw new Error('Could not find local sample CSV file.');
      }
      const csvBlob = await csvResponse.blob();
      const sampleCsvFile = new File([csvBlob], 'final_scored_transactions .csv', { type: 'text/csv' });

      // Fetch model_B .json
      let sampleJsonFile: File | null = null;
      try {
        const jsonResponse = await fetch('/model_B .json');
        if (jsonResponse.ok) {
          const jsonBlob = await jsonResponse.blob();
          sampleJsonFile = new File([jsonBlob], 'model_B .json', { type: 'application/json' });
        }
      } catch (err) {
        console.warn('Sample JSON model file fetch omitted:', err);
      }

      await startProcessing(sampleCsvFile, sampleJsonFile);
    } catch (err: any) {
      setIsParsing(false);
      setError(err?.message || 'Error loading sample dataset. Please select files manually.');
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 24px' }}>
      {/* Banner */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div className="icon-box lg emerald" style={{ margin: '0 auto 16px auto' }}>
          <ShieldCheck size={28} />
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
          EFOS Sentinel Fraud Detection
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--color-text-muted)', maxWidth: '640px', margin: '0 auto' }}>
          Upload your scored XGBoost transaction dataset and model export to generate live, explainable fraud analytics for the EFOS Global Finance Hackathon 2026.
        </p>
      </div>

      {/* Main Upload Card */}
      <div className="card" style={{ padding: '36px' }}>
        {!isParsing && successCount === null ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
              {/* CSV Upload Dropzone */}
              <div
                onClick={() => csvInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--color-emerald)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '28px 20px',
                  textAlign: 'center',
                  backgroundColor: 'rgba(31, 171, 137, 0.03)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <input
                  type="file"
                  ref={csvInputRef}
                  onChange={handleCsvChange}
                  accept=".csv"
                  style={{ display: 'none' }}
                />
                <div className="icon-box emerald" style={{ margin: '0 auto 12px auto' }}>
                  <FileSpreadsheet size={22} />
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '4px', color: 'var(--color-primary)' }}>
                  1. Scored CSV Output (Required)
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                  {csvFile ? csvFile.name : 'Click or drop final_scored_transactions.csv'}
                </div>
                {csvFile && (
                  <div className="risk-badge LOW" style={{ margin: '12px auto 0 auto' }}>
                    <CheckCircle2 size={12} />
                    <span>{(csvFile.size / (1024 * 1024)).toFixed(1)} MB Selected</span>
                  </div>
                )}
              </div>

              {/* JSON Upload Dropzone */}
              <div
                onClick={() => jsonInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '28px 20px',
                  textAlign: 'center',
                  backgroundColor: '#FAFAF9',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <input
                  type="file"
                  ref={jsonInputRef}
                  onChange={handleJsonChange}
                  accept=".json"
                  style={{ display: 'none' }}
                />
                <div className="icon-box sm" style={{ margin: '0 auto 12px auto' }}>
                  <FileCode size={20} />
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '4px', color: 'var(--color-text-main)' }}>
                  2. XGBoost Model JSON (Optional)
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                  {jsonFile ? jsonFile.name : 'Click to add model_B.json'}
                </div>
                {jsonFile && (
                  <div className="risk-badge LOW" style={{ margin: '12px auto 0 auto' }}>
                    <CheckCircle2 size={12} />
                    <span>Selected</span>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--risk-high-bg)', color: 'var(--risk-high)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '20px' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '24px' }}>
              {/* Quick Sample Button */}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleLoadSampleDataset}
              >
                <Play size={16} style={{ color: 'var(--color-emerald)' }} />
                <span>Load Sample Dataset (`final_scored_transactions.csv`)</span>
              </button>

              {/* Start Parse Button */}
              <button
                type="button"
                className="btn btn-primary"
                disabled={!csvFile}
                onClick={() => csvFile && startProcessing(csvFile, jsonFile)}
                style={{ opacity: csvFile ? 1 : 0.6, cursor: csvFile ? 'pointer' : 'not-allowed' }}
              >
                <span>Analyze Dataset</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : isParsing ? (
          /* Parsing Progress State */
          <div style={{ textAlign: 'center', padding: '32px 16px' }}>
            <div className="icon-box lg emerald" style={{ margin: '0 auto 20px auto' }}>
              <Cpu size={28} className="animate-spin" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '8px' }}>
              {statusMessage}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
              Chunked client-side parsing in progress. DOM remains responsive.
            </p>

            {/* Progress Bar Container */}
            <div style={{ maxWidth: '480px', margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '8px' }}>
                <span>{progress}% Completed</span>
                <span className="tabular-nums">{loadedRowCount.toLocaleString()} rows parsed</span>
              </div>
              <div style={{ height: '10px', backgroundColor: 'var(--color-border-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    backgroundColor: 'var(--color-emerald)',
                    width: `${progress}%`,
                    transition: 'width 0.15s ease'
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Success Confirmation State */
          <div style={{ textAlign: 'center', padding: '32px 16px' }}>
            <div className="icon-box lg emerald" style={{ margin: '0 auto 20px auto' }}>
              <CheckCircle2 size={32} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '8px' }}>
              {successCount?.toLocaleString()} transactions loaded
            </h3>
            <p style={{ fontSize: '0.9375rem', color: 'var(--color-emerald)', fontWeight: 600 }}>
              Live metrics and risk scores calculated successfully! Launching dashboard...
            </p>
          </div>
        )}
      </div>

      {/* Feature Footnote Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '24px' }}>
        <div className="card" style={{ padding: '16px 20px', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
          <strong style={{ color: 'var(--color-text-main)', display: 'block', marginBottom: '4px' }}>100% Client-Side</strong>
          No server upload or API reliance. Data processed entirely in browser memory.
        </div>
        <div className="card" style={{ padding: '16px 20px', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
          <strong style={{ color: 'var(--color-text-main)', display: 'block', marginBottom: '4px' }}>Zero Hardcoded Data</strong>
          Every KPI, metric, and feature tree value derived live from your uploaded files.
        </div>
        <div className="card" style={{ padding: '16px 20px', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
          <strong style={{ color: 'var(--color-text-main)', display: 'block', marginBottom: '4px' }}>Explainable Detection</strong>
          Pairs XGBoost classification accuracy with natural language feature explanations.
        </div>
      </div>
    </div>
  );
};
