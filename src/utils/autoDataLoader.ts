import { Transaction, ModelDetails } from '../types';
import { parseCSVFile } from './csvParser';
import { parseXGBoostModelJSON } from './modelParser';
import { enrichTransactionsWithAccounts } from './graphBuilder';

export async function autoLoadProjectData(
  onProgress: (percent: number, loadedCount: number) => void
): Promise<{ transactions: Transaction[]; modelDetails: ModelDetails | null }> {
  // 1. Fetch model_xgboost.json if available
  let modelDetails: ModelDetails | null = null;
  try {
    const jsonRes = await fetch('/data/model_xgboost.json');
    if (jsonRes.ok) {
      const jsonText = await jsonRes.text();
      modelDetails = parseXGBoostModelJSON(jsonText);
    }
  } catch (err) {
    console.warn('Auto-load JSON model omitted:', err);
  }

  // 2. Fetch scored_transactions.csv
  const csvRes = await fetch('/data/scored_transactions.csv');
  if (!csvRes.ok) {
    throw new Error('Could not auto-load /data/scored_transactions.csv from project.');
  }

  const blob = await csvRes.blob();
  const csvFile = new File([blob], 'scored_transactions.csv', { type: 'text/csv' });

  return new Promise((resolve, reject) => {
    parseCSVFile(
      csvFile,
      (pct, count) => {
        onProgress(pct, count);
      },
      (rawTransactions) => {
        const enriched = enrichTransactionsWithAccounts(rawTransactions);
        resolve({
          transactions: enriched,
          modelDetails
        });
      },
      (errorMsg) => {
        reject(new Error(errorMsg));
      }
    );
  });
}
