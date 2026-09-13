import Papa from 'papaparse';
import { Transaction } from '../types';

export function parseCSVFile(
  file: File,
  onProgress: (percent: number, loadedCount: number) => void,
  onComplete: (transactions: Partial<Transaction>[]) => void,
  onError: (error: string) => void
): void {
  const transactions: Partial<Transaction>[] = [];
  const fileSize = file.size;
  let rowIndex = 0;

  Papa.parse<Record<string, string>>(file, {
    header: true,
    skipEmptyLines: true,
    chunkSize: 1024 * 1024 * 2, // 2MB chunks
    chunk: (results) => {
      for (let i = 0; i < results.data.length; i++) {
        const row = results.data[i];
        if (!row.amount && !row.predicted_probability) continue;

        rowIndex++;
        const prob = parseFloat(row.predicted_probability) || 0;
        const actualFraud = parseFloat(row.actual_isFraud) || 0;

        transactions.push({
          id: rowIndex,
          hour_of_day: parseInt(row.hour_of_day, 10) || 0,
          amount_log: parseFloat(row.amount_log) || 0,
          errorBalanceOrig: parseFloat(row.errorBalanceOrig) || 0,
          errorBalanceDest: parseFloat(row.errorBalanceDest) || 0,
          type_TRANSFER: parseInt(row.type_TRANSFER, 10) || 0,
          type_CASH_OUT: parseInt(row.type_CASH_OUT, 10) || 0,
          amount: parseFloat(row.amount) || 0,
          actual_isFraud: actualFraud,
          predicted_probability: prob,
          type: (row.type || 'PAYMENT').trim().toUpperCase(),
          risk_level: (row.risk_level || (prob > 0.7 ? 'HIGH' : prob > 0.3 ? 'MEDIUM' : 'LOW')).trim().toUpperCase() as any,
          recommended_action: (row.recommended_action || (prob > 0.7 ? 'BLOCK' : prob > 0.3 ? 'REVIEW' : 'APPROVE')).trim().toUpperCase(),
          explanation_text: row.explanation_text ? row.explanation_text.trim() : 'No explanation provided.'
        });
      }

      const progress = fileSize > 0 ? Math.min(100, Math.round((results.meta.cursor / fileSize) * 100)) : 0;
      onProgress(progress, transactions.length);
    },
    complete: () => {
      onProgress(100, transactions.length);
      onComplete(transactions);
    },
    error: (err) => {
      onError(err.message || 'Failed to parse CSV file');
    }
  });
}
