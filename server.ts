import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Helper to get GoogleGenAI client
function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set. Please set GEMINI_API_KEY.');
  }
  return new GoogleGenAI({});
}

// Helper to clean Markdown json blocks
function cleanJsonBlock(text: string): string {
  return text.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, '$1').trim();
}

const CANDIDATE_MODELS = ['gemini-flash-latest', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'];

async function generateWithFallback(options: {
  contents: string;
  config?: any;
}): Promise<string> {
  const ai = getGenAIClient();
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: options.contents,
        config: options.config,
      });
      if (response && response.text) {
        return response.text.trim();
      }
    } catch (err: any) {
      console.warn(`Model ${model} failed, trying next candidate:`, err.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error('All candidate models failed to respond.');
}

// ---------------------------------------------------------------------------
// 1. Q&A Module (GET /qa, POST /qa, /api/qa)
// ---------------------------------------------------------------------------
async function handleQnA(question: string) {
  const prompt = `You are EduGenie QnA Assistant powered by Gemini. Answer the following general knowledge or academic question with precision, clarity, and pedagogical depth. Make sure the explanation is accurate, clear, and easy for students to understand.

Question: ${question}`;

  return await generateWithFallback({
    contents: prompt,
    config: {
      temperature: 0.7,
    },
  });
}

app.get(['/qa', '/api/qa'], async (req: Request, res: Response) => {
  try {
    const question = (req.query.question as string) || '';
    if (!question.trim()) {
      return res.status(400).json({ error: 'Please provide a question query parameter.' });
    }
    const answer = await handleQnA(question);
    return res.json({ question, answer, result: answer, status: 'success' });
  } catch (err: any) {
    console.error('QnA Error:', err);
    return res.status(500).json({ error: err.message || 'Error processing QnA request' });
  }
});

app.post(['/qa', '/api/qna', '/api/qa'], async (req: Request, res: Response) => {
  try {
    const question = req.body?.question || req.query?.question;
    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ error: 'Please provide a question.' });
    }
    const answer = await handleQnA(question);
    return res.json({ question, answer, result: answer, status: 'success' });
  } catch (err: any) {
    console.error('QnA Error:', err);
    return res.status(500).json({ error: err.message || 'Error processing QnA request' });
  }
});

// ---------------------------------------------------------------------------
// 2. Explanation Module (POST /explain, POST /explain/, /api/explain)
// ---------------------------------------------------------------------------
async function handleExplain(topic: string) {
  const prompt = `You are EduGenie's explanation engine, fine-tuned in the spirit of the LaMini-Flan-T5 model for high readability, simplicity, and brevity.
Explain the concept of "${topic}" in a simple, clear, and engaging way for a school student or beginner.

Guidelines:
- Break down complex terms into everyday analogies.
- Use concise, accessible language without technical jargon.
- Format with a friendly opening, clear bullet points or short paragraphs, and a memorable takeaway summary.
- Keep it under 250 words so learners never feel overwhelmed.`;

  return await generateWithFallback({
    contents: prompt,
    config: {
      temperature: 0.6,
    },
  });
}

app.post(['/explain', '/explain/', '/api/explain'], async (req: Request, res: Response) => {
  try {
    const topic = req.body?.topic;
    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({ error: 'Please provide a topic.' });
    }
    const explanation = await handleExplain(topic);
    return res.json({ topic, explanation, result: explanation, status: 'success' });
  } catch (err: any) {
    console.error('Explanation Error:', err);
    return res.status(500).json({ error: err.message || 'Error generating explanation' });
  }
});

// ---------------------------------------------------------------------------
// 3. Quiz Module (POST /quiz, /api/quiz)
// ---------------------------------------------------------------------------
interface QuizItem {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

async function handleQuiz(text: string): Promise<QuizItem[]> {
  const prompt = `You are an educational quiz generator.
From the following topic or passage, create exactly 3 multiple-choice questions (MCQs).
Each question MUST have:
1. "question": A clear, unambiguous question.
2. "options": An array of exactly 4 plausible answer options as strings.
3. "answer": The exact string of the correct option that matches one of the entries in "options".
4. "explanation": A brief 1-sentence explanation of why this answer is correct.

Format your output strictly as a valid JSON array of 3 objects, with NO surrounding Markdown text or conversational filler:
[
  {
    "question": "What is ...?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Option B",
    "explanation": "Because..."
  }
]

Topic / Passage:
${text}`;

  const rawText = await generateWithFallback({
    contents: prompt,
    config: {
      temperature: 0.4,
      responseMimeType: 'application/json',
    },
  });

  const cleaned = cleanJsonBlock(rawText || '[]');
  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    // Attempt fallback extraction with regex
    const match = cleaned.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (match) {
      parsed = JSON.parse(match[0]);
    } else {
      throw new Error('Failed to parse quiz response into valid JSON.');
    }
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('Quiz generator did not return an array of questions.');
  }

  // Sanitize items
  return parsed.map((item: any) => ({
    question: String(item.question || ''),
    options: Array.isArray(item.options) ? item.options.map(String) : [],
    answer: String(item.answer || ''),
    explanation: item.explanation ? String(item.explanation) : undefined,
  }));
}

app.post(['/quiz', '/api/quiz'], async (req: Request, res: Response) => {
  try {
    const text = req.body?.text || req.body?.topic;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Please provide text for quiz.' });
    }
    const quiz = await handleQuiz(text);
    return res.json({ quiz, result: quiz, status: 'success' });
  } catch (err: any) {
    console.error('Quiz Error:', err);
    return res.status(500).json({ error: err.message || 'Error generating quiz' });
  }
});

// ---------------------------------------------------------------------------
// 4. Summary Module (POST /summarize, POST /summarize/, /api/summarize)
// ---------------------------------------------------------------------------
async function handleSummarize(text: string) {
  const prompt = `You are EduGenie's smart summarizer.
Summarize the following passage in simple, concise language ideal for rapid revision.

Guidelines:
- Retain all essential core concepts while cutting redundant phrasing.
- Provide a clear 2-3 sentence executive summary.
- Follow up with 3-5 bulleted "Key Takeaways".
- Keep the language student-friendly and intuitive.

Passage to summarize:
${text}`;

  return await generateWithFallback({
    contents: prompt,
    config: {
      temperature: 0.5,
    },
  });
}

app.post(['/summarize', '/summarize/', '/api/summarize'], async (req: Request, res: Response) => {
  try {
    const text = req.body?.text;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Please provide text to summarize.' });
    }
    const summary = await handleSummarize(text);
    return res.json({ summary, result: summary, status: 'success' });
  } catch (err: any) {
    console.error('Summary Error:', err);
    return res.status(500).json({ error: err.message || 'Error generating summary' });
  }
});

// ---------------------------------------------------------------------------
// 5. Learning Path Module (GET /learn/recommendations, POST /api/learning-path)
// ---------------------------------------------------------------------------
async function handleLearningPath(topic: string) {
  const prompt = `You are an AI tutor and academic advisor.
The student wants to learn about: "${topic}".
Suggest a structured, stepwise, and adaptive learning path from beginner to advanced level, including curated resources and learning guidance.

Follow this exact comprehensive structure:

## Learning Recommendations for "${topic}"

### I. Beginner Level: Building a Foundation
**(Estimated Time: 1–2 weeks)**
- **Key Concepts & Topics**: (List 5-7 fundamental items)
- **Step-by-Step Guidance**: (How to start, what to focus on)
- **Curated Resources**:
  - Interactive Tutorials: (e.g. specific interactive websites, sandbox environments)
  - Video Tutorials: (e.g. recommended YouTube series or free channels)
  - Beginner Articles/Guides

### II. Intermediate Level: Working with Core Mechanics & Applications
**(Estimated Time: 2–3 weeks)**
- **Key Concepts & Topics**: (List 5-7 intermediate topics, joins, data structures, or real-world problem sets)
- **Hands-on Practice**: (Project ideas and exercises)
- **Curated Resources**:
  - Recommended Books: (Specific book titles and authors)
  - Official Documentation / References
  - Practice Platforms: (e.g. LeetCode, HackerRank, freeCodeCamp, or relevant labs)

### III. Advanced Level: Mastery & Production Architecture
**(Estimated Time: 3–4 weeks and beyond)**
- **Key Concepts & Topics**: (Advanced internals, performance tuning, architecture, security, or enterprise patterns)
- **Specialized Resources**:
  - Advanced Books & Whitepapers
  - Real-world capstone project ideas

### IV. Adaptive Learning Tips
- Daily study habit suggestions
- Common pitfalls to avoid
- How to test and validate your understanding`;

  return await generateWithFallback({
    contents: prompt,
    config: {
      temperature: 0.6,
    },
  });
}

app.get(['/learn/recommendations', '/api/learn/recommendations'], async (req: Request, res: Response) => {
  try {
    const topic = (req.query.topic as string) || '';
    if (!topic.trim()) {
      return res.status(400).json({ error: 'Please provide a topic query parameter.' });
    }
    const recommendation = await handleLearningPath(topic);
    return res.json({ topic, recommendation, result: recommendation, status: 'success' });
  } catch (err: any) {
    console.error('Learning Path Error:', err);
    return res.status(500).json({ error: err.message || 'Error generating learning recommendations' });
  }
});

app.post(['/learn/recommendations', '/api/learn/recommendations', '/api/learning-path'], async (req: Request, res: Response) => {
  try {
    const topic = req.body?.topic || req.query?.topic;
    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({ error: 'Please provide a topic.' });
    }
    const recommendation = await handleLearningPath(topic);
    return res.json({ topic, recommendation, result: recommendation, status: 'success' });
  } catch (err: any) {
    console.error('Learning Path Error:', err);
    return res.status(500).json({ error: err.message || 'Error generating learning recommendations' });
  }
});

// ---------------------------------------------------------------------------
// 6. AI Learning Chat (POST /api/chat)
// ---------------------------------------------------------------------------
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Please provide a message.' });
    }

    let conversationContext = '';
    if (Array.isArray(history) && history.length > 0) {
      conversationContext = 'Previous Conversation:\n' + history
        .slice(-6)
        .map((h: any) => `${h.role === 'user' ? 'Student' : 'EduGenie'}: ${h.text}`)
        .join('\n') + '\n\n';
    }

    const prompt = `You are EduGenie AI Learning Chat Tutor.
Your goal is to talk with students naturally, warmly, and helpfully.
Explain concepts simply and clearly, adapt to their age/grade level, and encourage curiosity.
Keep explanations intuitive, provide easy real-world examples, and ask a gentle checking question at the end when appropriate to verify understanding.

${conversationContext}Student: ${message}
EduGenie:`;

    const reply = await generateWithFallback({
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });

    return res.json({ reply, status: 'success' });
  } catch (err: any) {
    console.error('Chat Error:', err);
    return res.status(500).json({ error: err.message || 'Error processing chat message' });
  }
});

// ---------------------------------------------------------------------------
// 7. Structured Topic Explainer (POST /api/explain-topic)
// ---------------------------------------------------------------------------
app.post('/api/explain-topic', async (req: Request, res: Response) => {
  try {
    const { topic, subject } = req.body;
    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({ error: 'Please provide a topic.' });
    }

    const prompt = `You are EduGenie Topic Explainer.
Explain the academic topic: "${topic}" ${subject ? `(Subject: ${subject})` : ''}.
Produce a structured explanation with these exact 4 sections in clean Markdown:

### 📖 1. Formal Definition
Provide a precise, student-friendly 1-2 sentence definition that gives the core meaning.

### 💡 2. Detailed Explanation
Break down how and why it works into 2-3 clear paragraphs. Use simple analogies and zero unnecessary jargon.

### 🌍 3. Real-World Examples
Give 2 concrete, relatable real-world or laboratory examples showing where this concept is observed or applied in daily life.

### 🎯 4. Key Points & Formulas
Provide 4-5 bulleted essential takeaways, including any key mathematical formulas, units, or exam mnemonics.`;

    const explanation = await generateWithFallback({
      contents: prompt,
      config: {
        temperature: 0.6,
      },
    });

    return res.json({ topic, explanation, status: 'success' });
  } catch (err: any) {
    console.error('Topic Explainer Error:', err);
    return res.status(500).json({ error: err.message || 'Error explaining topic' });
  }
});

// ---------------------------------------------------------------------------
// 8. Exam Answer Generator (POST /api/exam-answer)
// ---------------------------------------------------------------------------
app.post('/api/exam-answer', async (req: Request, res: Response) => {
  try {
    const { question, markWeight, subject } = req.body;
    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ error: 'Please provide an exam question.' });
    }

    const marks = String(markWeight || '5');
    let rubricPrompt = '';

    if (marks === '2') {
      rubricPrompt = `Format this answer strictly for a **2-Mark Exam Question**:
- Word limit: 40–60 words.
- Give a crisp 1-sentence definition.
- Give 2 concise bullet points with the core formula, SI unit, or critical condition.
- No unnecessary introduction or fluff. Maximum efficiency for full marks.`;
    } else if (marks === '10') {
      rubricPrompt = `Format this answer strictly for a **10-Mark (Long Essay) Exam Question**:
- Word limit: 300–450 words.
- Structured with:
  1. Introduction & Context
  2. Theoretical Foundation / Working Principle
  3. Detailed Core Components / Steps (with sub-headings)
  4. Mathematical Formulation / Derivation / Diagram description
  5. Practical Applications & Limitations
  6. Concluding Summary
- Formatted with bold highlights so examiners can easily award points.`;
    } else {
      // Default 5 marks
      rubricPrompt = `Format this answer strictly for a **5-Mark Exam Question**:
- Word limit: 120–180 words.
- Structure:
  1. Clear Definition / Concept statement (1 mark)
  2. 4–5 numbered explanatory points or key characteristics with clear bold headings (3 marks)
  3. Brief example, diagram hint, or formula (1 mark)`;
    }

    const prompt = `You are a Senior Academic Examiner and Model Answer Generator.
Generate an optimal, high-scoring model answer for an exam.

Question: "${question}"
Target Marks: ${marks} Marks ${subject ? `(Subject: ${subject})` : ''}

Marking Scheme Instructions:
${rubricPrompt}`;

    const modelAnswer = await generateWithFallback({
      contents: prompt,
      config: {
        temperature: 0.5,
      },
    });

    return res.json({ question, markWeight: marks, modelAnswer, status: 'success' });
  } catch (err: any) {
    console.error('Exam Answer Error:', err);
    return res.status(500).json({ error: err.message || 'Error generating exam answer' });
  }
});

// ---------------------------------------------------------------------------
// 9. Doubt Solver (POST /api/doubt-solve)
// ---------------------------------------------------------------------------
app.post('/api/doubt-solve', async (req: Request, res: Response) => {
  try {
    const { problem, subject } = req.body;
    if (!problem || typeof problem !== 'string' || !problem.trim()) {
      return res.status(400).json({ error: 'Please enter your doubt or question.' });
    }

    const prompt = `You are EduGenie Doubt Solver. A student has submitted a difficult problem or academic doubt.
Solve it step-by-step with extreme clarity.

Student's Doubt: "${problem}" ${subject ? `(Subject: ${subject})` : ''}

Follow this exact stepwise format:

### 🔍 Step 1: Identify Given Data & Underlying Concept
List what is given, what needs to be found, and the core scientific/mathematical principle involved.

### 📐 Step 2: Formulas & Rules Required
State the specific equation(s), theorem, or definition needed to solve the problem.

### ✏️ Step 3: Step-by-Step Solution & Working
Break down each calculation or logical step clearly with intermediate values and explanations of each operation.

### 🎯 Step 4: Final Answer
State the final answer clearly with appropriate units and significant figures.

### ⚠️ Step 5: Common Traps & Exam Pro-Tip
Highlight what mistakes students frequently make on this type of question and how to avoid losing marks.`;

    const solution = await generateWithFallback({
      contents: prompt,
      config: {
        temperature: 0.4,
      },
    });

    return res.json({ problem, solution, status: 'success' });
  } catch (err: any) {
    console.error('Doubt Solver Error:', err);
    return res.status(500).json({ error: err.message || 'Error solving doubt' });
  }
});

// ---------------------------------------------------------------------------
// 10. Study Plan Generator (POST /api/study-plan)
// ---------------------------------------------------------------------------
app.post('/api/study-plan', async (req: Request, res: Response) => {
  try {
    const { subjects, hoursPerDay, durationWeeks, examGoal } = req.body;
    if (!subjects || (Array.isArray(subjects) && subjects.length === 0)) {
      return res.status(400).json({ error: 'Please provide at least one subject.' });
    }

    const subjectList = Array.isArray(subjects) ? subjects.join(', ') : String(subjects);
    const hours = hoursPerDay || 2;
    const weeks = durationWeeks || 2;

    const prompt = `You are an AI Academic Advisor and Study Planner.
Create an achievable, high-efficiency study schedule for a student.

Input Details:
- Subjects: ${subjectList}
- Available Study Time: ${hours} hours per day
- Schedule Duration: ${weeks} week(s)
${examGoal ? `- Exam Goal / Target: ${examGoal}` : ''}

Structure the output as follows:
## 📅 Personalized Study Plan (${weeks} Weeks • ${hours} hrs/day)

### ⏱️ Recommended Daily Routine (Pomodoro Strategy)
Break down how to divide the ${hours} hours (e.g. 45 min focus + 10 min break + active recall).

### 🗓️ Weekly Milestones
Give a concrete breakdown for Week 1 through Week ${weeks} with daily subject rotations and focus chapters.

### 🔄 Active Recall & Revision Checkpoints
Specify when and how to test with past papers or flashcards.

### 💡 Golden Rules for Consistency
3 practical tips for beating procrastination and maintaining high retention.`;

    const plan = await generateWithFallback({
      contents: prompt,
      config: {
        temperature: 0.6,
      },
    });

    return res.json({ plan, status: 'success' });
  } catch (err: any) {
    console.error('Study Plan Error:', err);
    return res.status(500).json({ error: err.message || 'Error generating study plan' });
  }
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    project: 'EduGenie',
    status: 'online',
    milestones: ['Milestone 2 - Core Functionalities', 'Milestone 3 - Frontend Development', 'Milestone 4 - Deployment & Testing'],
    endpoints: [
      'GET/POST /qa',
      'POST /explain',
      'POST /quiz',
      'POST /summarize',
      'GET/POST /learn/recommendations',
      'POST /api/chat',
      'POST /api/explain-topic',
      'POST /api/exam-answer',
      'POST /api/doubt-solve',
      'POST /api/study-plan',
    ],
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduGenie server listening on port ${PORT} (http://localhost:${PORT})`);
  });
}

startServer();
