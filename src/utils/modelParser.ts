import { ModelDetails } from '../types';

export function parseXGBoostModelJSON(jsonString: string): ModelDetails | null {
  try {
    const data = JSON.parse(jsonString);
    const learner = data.learner || data;

    if (!learner) return null;

    const featureNames = learner.feature_names || [];
    const numTreesRaw = learner?.gradient_booster?.model?.gbtree_model_param?.num_trees;
    const numTrees = numTreesRaw ? parseInt(String(numTreesRaw), 10) : 0;
    const objectiveName = learner?.objective?.name || 'binary:logistic';
    const scalePosWeight = learner?.objective?.reg_loss_param?.scale_pos_weight || 'N/A';

    return {
      featureNames,
      numTrees,
      objectiveName,
      scalePosWeight
    };
  } catch (err) {
    console.error('Error parsing XGBoost model JSON:', err);
    return null;
  }
}
