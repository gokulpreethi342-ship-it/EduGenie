import { QuizQuestion } from '../types';

export async function askQuestion(question: string): Promise<string> {
  const res = await fetch(`/qa?question=${encodeURIComponent(question)}`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${res.status}: Failed to get answer.`);
  }

  const data = await res.json();
  return data.answer || data.result || 'No answer received.';
}

export async function explainTopic(topic: string): Promise<string> {
  const res = await fetch('/explain', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ topic }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${res.status}: Failed to get explanation.`);
  }

  const data = await res.json();
  return data.explanation || data.result || 'No explanation received.';
}

export async function generateQuiz(text: string): Promise<QuizQuestion[]> {
  const res = await fetch('/quiz', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${res.status}: Failed to generate quiz.`);
  }

  const data = await res.json();
  const quiz = data.quiz || data.result;

  if (Array.isArray(quiz)) {
    return quiz;
  }
  throw new Error('Invalid quiz response received from server.');
}

export async function summarizeText(text: string): Promise<string> {
  const res = await fetch('/summarize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${res.status}: Failed to summarize text.`);
  }

  const data = await res.json();
  return data.summary || data.result || 'No summary received.';
}

export async function getLearningRecommendations(topic: string): Promise<string> {
  const res = await fetch(`/learn/recommendations?topic=${encodeURIComponent(topic)}`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${res.status}: Failed to fetch learning path.`);
  }

  const data = await res.json();
  return data.recommendation || data.result || 'No learning path received.';
}

export async function sendChatMessage(
  message: string,
  history: { role: 'user' | 'model'; text: string }[] = []
): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ message, history }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${res.status}: Failed to send chat message.`);
  }

  const data = await res.json();
  return data.reply || data.result || 'No reply received.';
}

export async function explainTopicStructured(
  topic: string,
  subject?: string
): Promise<string> {
  const res = await fetch('/api/explain-topic', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ topic, subject }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${res.status}: Failed to explain topic.`);
  }

  const data = await res.json();
  return data.explanation || data.result || 'No explanation received.';
}

export async function generateExamAnswer(
  question: string,
  markWeight: '2' | '5' | '10',
  subject?: string
): Promise<string> {
  const res = await fetch('/api/exam-answer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ question, markWeight, subject }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${res.status}: Failed to generate exam answer.`);
  }

  const data = await res.json();
  return data.modelAnswer || data.result || 'No model answer received.';
}

export async function solveDoubt(
  problem: string,
  subject?: string
): Promise<string> {
  const res = await fetch('/api/doubt-solve', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ problem, subject }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${res.status}: Failed to solve doubt.`);
  }

  const data = await res.json();
  return data.solution || data.result || 'No solution received.';
}

export async function generateStudyPlan(
  subjects: string[],
  hoursPerDay: number,
  durationWeeks: number,
  examGoal?: string
): Promise<string> {
  const res = await fetch('/api/study-plan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ subjects, hoursPerDay, durationWeeks, examGoal }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${res.status}: Failed to generate study plan.`);
  }

  const data = await res.json();
  return data.plan || data.result || 'No study plan received.';
}
