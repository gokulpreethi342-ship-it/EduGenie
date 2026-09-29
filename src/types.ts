export type ModuleTab =
  | 'dashboard'
  | 'chat'
  | 'explain'
  | 'exam'
  | 'quiz'
  | 'summary'
  | 'study-plan'
  | 'doubt'
  | 'learn'
  | 'all';

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

export interface QuizEvaluationState {
  [questionIndex: number]: {
    selectedOption: string | null;
    isSubmitted: boolean;
    isCorrect: boolean;
  };
}

export interface QuizScoreRecord {
  id: string;
  topic: string;
  score: number;
  total: number;
  percentage: number;
  date: string;
}

export interface RecentActivity {
  id: string;
  type: 'question' | 'quiz' | 'exam' | 'doubt' | 'topic';
  title: string;
  preview: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface ApiResponse<T = any> {
  status?: string;
  result?: T;
  error?: string;
  answer?: string;
  topic?: string;
  explanation?: string;
  quiz?: QuizQuestion[];
  summary?: string;
  recommendation?: string;
  reply?: string;
  modelAnswer?: string;
  solution?: string;
  plan?: string;
}

