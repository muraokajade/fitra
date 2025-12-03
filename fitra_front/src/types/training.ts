export type TrainingRowRaw = {
  name: string;
  weight: string;
  reps: string;
  sets: string;
};

//なぜここで string numberが現れたのか
export type TrainingRow = {
  name: string;
  weight: number;
  reps: number;
  sets: number;
  volume: number;
};

//困惑ポイントなぜこの型だと分かっている？というか決めてる？
export type TrainingRecord = {
  id: string;
  date: string;
  rows: TrainingRow[];
  totalVolume: number;
  totalSets: number;
  totalReps: number;
};

export type TrainingFeedbackRequest = {
  totalVolume: number;
  totalSets: number;
  totalReps: number;
  rows: TrainingRow[];
};

export type TrainingFeedbackResponse = {
  feedback: string;
};
// 👇 追加（1日分のトレまとめ）
export type TrainingSummary = {
  totalVolume: number;
  totalSets: number;
  totalReps: number;
  rows: TrainingRow[];
};
