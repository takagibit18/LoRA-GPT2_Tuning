export enum AppView {
  DASHBOARD = 'DASHBOARD',
  DOCUMENTATION = 'DOCUMENTATION',
}

export interface TrainingConfig {
  rank: number;
  alpha: number;
  learningRate: number;
  epochs: number;
  batchSize: number;
}

export interface TrainingLog {
  step: number;
  loss: number;
  accuracy: number;
}

export interface SentimentResult {
  label: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  score: number;
}