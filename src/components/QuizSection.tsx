import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, Trophy, Sparkles, Loader2, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizQuestion, QuizEvaluationState } from '../types';
import { generateQuiz } from '../services/api';

export const QuizSection: React.FC = () => {
  const [topicOrText, setTopicOrText] = useState('');
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [evaluationState, setEvaluationState] = useState<QuizEvaluationState>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sampleTopics = [
    'Pythagoras theorem',
    'Solar System',
    'Photosynthesis and Plant Cells',
    'World War II Key Events',
    'Basic Principles of Economics',
  ];

  const handleGenerate = async (e?: React.FormEvent, customTopic?: string) => {
    if (e) e.preventDefault();
    const query = customTopic || topicOrText;
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setEvaluationState({});

    try {
      const questions = await generateQuiz(query);
      if (!questions || questions.length === 0) {
        throw new Error('No questions were returned. Please try another topic or passage.');
      }
      setQuizQuestions(questions);
    } catch (err: any) {
      setError(err.message || 'Error generating quiz.');
      setQuizQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (sample: string) => {
    setTopicOrText(sample);
    handleGenerate(undefined, sample);
  };

  const handleOptionSelect = (qIndex: number, option: string) => {
    setEvaluationState((prev) => ({
      ...prev,
      [qIndex]: {
        selectedOption: option,
        isSubmitted: prev[qIndex]?.isSubmitted ? false : false, // allow re-selecting before re-checking
        isCorrect: false,
      },
    }));
  };

  const handleCheckAnswer = (qIndex: number) => {
    const currentQ = quizQuestions[qIndex];
    const currentState = evaluationState[qIndex];

    if (!currentState?.selectedOption) {
      // Set notice that user must select
      return;
    }

    const selected = currentState.selectedOption.trim().toLowerCase();
    const correct = currentQ.answer.trim().toLowerCase();

    // Check exact match or normalized match
    const isCorrect = selected === correct || selected.includes(correct) || correct.includes(selected);

    const newState: QuizEvaluationState = {
      ...evaluationState,
      [qIndex]: {
        selectedOption: currentState.selectedOption,
        isSubmitted: true,
        isCorrect,
      },
    };

    setEvaluationState(newState);

    // Check if all answered and display score
    const totalAnswered = Object.values(newState).filter((s) => s.isSubmitted).length;
    const totalCorrect = Object.values(newState).filter((s) => s.isSubmitted && s.isCorrect).length;

    if (totalAnswered === quizQuestions.length) {
      if (totalCorrect === quizQuestions.length) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      // Record to student dashboard history
      try {
        const savedScores = localStorage.getItem('edugenie_quiz_scores');
        const list = savedScores ? JSON.parse(savedScores) : [];
        const percentage = Math.round((totalCorrect / quizQuestions.length) * 100);
        list.unshift({
          id: String(Date.now()),
          topic: topicOrText.slice(0, 30),
          score: totalCorrect,
          total: quizQuestions.length,
          percentage,
          date: 'Just now',
        });
        localStorage.setItem('edugenie_quiz_scores', JSON.stringify(list.slice(0, 15)));

        // Also add to activities
        const savedActs = localStorage.getItem('edugenie_activities');
        const actList = savedActs ? JSON.parse(savedActs) : [];
        actList.unshift({
          id: String(Date.now()),
          type: 'quiz',
          title: `Quiz: ${topicOrText.slice(0, 30)}`,
          preview: `Scored ${totalCorrect}/${quizQuestions.length} (${percentage}%) with instant answer evaluation.`,
          timestamp: 'Just now',
        });
        localStorage.setItem('edugenie_activities', JSON.stringify(actList.slice(0, 10)));
      } catch (e) {
        // ignore
      }
    }
  };

  const handleResetQuiz = () => {
    setEvaluationState({});
  };

  const answeredCount = Object.values(evaluationState).filter((s) => s.isSubmitted).length;
  const correctCount = Object.values(evaluationState).filter((s) => s.isSubmitted && s.isCorrect).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-semibold text-lg">
            🎯
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Generate a Quiz
            </h2>
            <p className="text-xs text-slate-500">
              Quiz Module • 3 multiple-choice questions with real-time feedback &amp; answer correction
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
          POST /quiz
        </span>
      </div>

      {/* Quick Chips */}
      <div className="mb-4">
        <p className="text-xs text-slate-400 mb-1.5 flex items-center gap-1 font-medium">
          <Sparkles className="w-3 h-3 text-amber-500" />
          Quick test topics:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {sampleTopics.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleSelectSample(t)}
              className="text-xs px-2.5 py-1 rounded-md bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 border border-slate-200/70 transition-colors text-left"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={(e) => handleGenerate(e)} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              id="quizText"
              value={topicOrText}
              onChange={(e) => setTopicOrText(e.target.value)}
              placeholder="e.g. Pythagoras theorem or paste study text"
              required
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all bg-white placeholder-slate-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !topicOrText.trim()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Quiz...</span>
              </>
            ) : (
              <>
                <Award className="w-4 h-4" />
                <span>Generate Quiz</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error notification */}
      {error && (
        <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* Interactive Quiz Result Container */}
      {quizQuestions.length > 0 && (
        <div id="quizResult" className="mt-6 p-6 rounded-2xl bg-slate-50/90 border border-slate-200/90 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-slate-200 gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Quiz:</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-medium">
                  3 Questions
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Select your answer for each question and click 'Check Answer' for instant correction.
              </p>
            </div>

            {/* Score Bar */}
            <div className="flex items-center gap-3">
              <div className="text-xs bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs font-medium text-slate-700 flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>Score: <strong className="text-emerald-700">{correctCount}</strong> / {quizQuestions.length}</span>
                <span className="text-slate-400">({answeredCount}/{quizQuestions.length} answered)</span>
              </div>
              <button
                type="button"
                onClick={handleResetQuiz}
                className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200/70 transition-colors"
                title="Reset answers"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Student Final Score Card Banner */}
          {answeredCount === quizQuestions.length && (
            <div className="mb-6 p-4 sm:p-5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-300">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-2xl font-bold shadow-inner shrink-0">
                  {correctCount === quizQuestions.length ? '🏆' : '📊'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold">
                      Quiz Completed: {correctCount} / {quizQuestions.length} Correct
                    </h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 font-semibold">
                      {Math.round((correctCount / quizQuestions.length) * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-emerald-100 mt-0.5">
                    {correctCount === quizQuestions.length
                      ? 'Perfect Score! All answers verified & saved to your Student Dashboard.'
                      : correctCount >= Math.ceil(quizQuestions.length / 2)
                      ? 'Well done! Review the explanations below and try another topic.'
                      : 'Good effort! Review the missed answers below to strengthen your understanding.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleResetQuiz}
                className="px-4 py-2 bg-white text-emerald-800 rounded-lg text-xs font-bold hover:bg-emerald-50 transition-colors shadow-xs shrink-0"
              >
                Retake Quiz
              </button>
            </div>
          )}

          {/* Question List */}
          <div className="space-y-6">
            {quizQuestions.map((q, index) => {
              const state = evaluationState[index];
              const isSubmitted = !!state?.isSubmitted;
              const isCorrect = !!state?.isCorrect;
              const selectedOption = state?.selectedOption;

              return (
                <div
                  key={index}
                  className="quiz-question-block bg-white rounded-xl p-5 border border-slate-200 shadow-2xs"
                >
                  <p className="font-semibold text-slate-900 text-sm mb-3">
                    <strong className="text-blue-700">Q{index + 1}:</strong> {q.question}
                  </p>

                  {/* 4 Options */}
                  <div className="flex flex-col gap-2 mb-4">
                    {q.options.map((opt, optIdx) => {
                      const isOptionSelected = selectedOption === opt;
                      let optionStyle = 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700';

                      if (isSubmitted) {
                        const optLower = opt.trim().toLowerCase();
                        const correctLower = q.answer.trim().toLowerCase();
                        const isThisTheCorrectAnswer = optLower === correctLower || optLower.includes(correctLower);

                        if (isThisTheCorrectAnswer) {
                          optionStyle = 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-medium ring-1 ring-emerald-500/30';
                        } else if (isOptionSelected && !isCorrect) {
                          optionStyle = 'border-rose-300 bg-rose-50/80 text-rose-950 line-through';
                        }
                      } else if (isOptionSelected) {
                        optionStyle = 'border-blue-500 bg-blue-50/60 text-blue-900 font-medium ring-1 ring-blue-500/20';
                      }

                      return (
                        <label
                          key={optIdx}
                          className={`flex items-center gap-3 p-3 rounded-lg border text-sm cursor-pointer transition-all ${optionStyle}`}
                        >
                          <input
                            type="radio"
                            name={`quiz-q-${index}`}
                            value={opt}
                            checked={isOptionSelected}
                            onChange={() => handleOptionSelect(index, opt)}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                          />
                          <span className="flex-1">{opt}</span>
                        </label>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => handleCheckAnswer(index)}
                      disabled={!selectedOption}
                      className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Check Answer
                    </button>

                    {/* Instant Feedback Badges */}
                    {isSubmitted && (
                      <div className="flex items-center gap-2">
                        {isCorrect ? (
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>✅ Correct!</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs">
                            <XCircle className="w-4 h-4 text-rose-600" />
                            <span>❌ Incorrect. Correct answer: {q.answer}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {!isSubmitted && !selectedOption && (
                      <span className="text-xs text-slate-400 italic">
                        Select an option to check
                      </span>
                    )}
                  </div>

                  {/* Optional explanation */}
                  {isSubmitted && q.explanation && (
                    <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
                      💡 <strong>Note:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
