import { Transaction, PerformanceMetrics } from '../types';

export function calculatePerformanceMetrics(transactions: Transaction[]): PerformanceMetrics {
  const totalCount = transactions.length;
  if (totalCount === 0) {
    return {
      totalCount: 0,
      fraudCount: 0,
      nonFraudCount: 0,
      fraudPercentage: 0,
      tp: 0,
      fp: 0,
      tn: 0,
      fn: 0,
      precision: 0,
      recall: 0,
      f1Score: 0,
      prAuc: 0,
      riskCounts: { LOW: 0, MEDIUM: 0, HIGH: 0 }
    };
  }

  let fraudCount = 0;
  let tp = 0;
  let fp = 0;
  let tn = 0;
  let fn = 0;

  const riskCounts = { LOW: 0, MEDIUM: 0, HIGH: 0 };

  for (let i = 0; i < totalCount; i++) {
    const tx = transactions[i];
    const actual = tx.actual_isFraud === 1 || String(tx.actual_isFraud) === '1.0' ? 1 : 0;
    const prob = tx.predicted_probability;

    if (actual === 1) fraudCount++;

    // Threshold 0.5 classification
    if (prob >= 0.5) {
      if (actual === 1) tp++;
      else fp++;
    } else {
      if (actual === 0) tn++;
      else fn++;
    }

    // Risk count
    const rLevel = (tx.risk_level || 'LOW').toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH';
    if (riskCounts[rLevel] !== undefined) {
      riskCounts[rLevel]++;
    } else {
      riskCounts.LOW++;
    }
  }

  const nonFraudCount = totalCount - fraudCount;
  const fraudPercentage = (fraudCount / totalCount) * 100;

  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
  const f1Score = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

  // Calculate PR-AUC via trapezoidal integration over sampled probability thresholds
  const prAuc = calculatePRCurveAUC(transactions);

  return {
    totalCount,
    fraudCount,
    nonFraudCount,
    fraudPercentage,
    tp,
    fp,
    tn,
    fn,
    precision,
    recall,
    f1Score,
    prAuc,
    riskCounts
  };
}

function calculatePRCurveAUC(transactions: Transaction[]): number {
  if (transactions.length === 0) return 0;

  // Sample or sort for PR curve computation
  // To optimize performance over 200k+ rows, sample 10,000 transactions if dataset is massive
  const sampleSize = 10000;
  let sampled: Transaction[] = transactions;
  if (transactions.length > sampleSize) {
    const step = Math.floor(transactions.length / sampleSize);
    sampled = [];
    for (let i = 0; i < transactions.length; i += step) {
      sampled.push(transactions[i]);
    }
  }

  // Sort by predicted_probability descending
  const sorted = [...sampled].sort((a, b) => b.predicted_probability - a.predicted_probability);
  const totalPositives = sorted.filter(t => t.actual_isFraud === 1 || String(t.actual_isFraud) === '1.0').length;
  if (totalPositives === 0) return 0;

  let tp = 0;
  let fp = 0;
  const points: { precision: number; recall: number }[] = [{ precision: 1, recall: 0 }];

  for (let i = 0; i < sorted.length; i++) {
    const isFraud = sorted[i].actual_isFraud === 1 || String(sorted[i].actual_isFraud) === '1.0';
    if (isFraud) tp++;
    else fp++;

    const prec = tp / (tp + fp);
    const rec = tp / totalPositives;
    points.push({ precision: prec, recall: rec });
  }

  // Trapezoidal area integration under PR curve
  let auc = 0;
  for (let i = 1; i < points.length; i++) {
    const deltaRecall = points[i].recall - points[i - 1].recall;
    const avgPrecision = (points[i].precision + points[i - 1].precision) / 2;
    auc += deltaRecall * avgPrecision;
  }

  return Math.min(1, Math.max(0, auc));
}
