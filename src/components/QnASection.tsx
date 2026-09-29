import React, { useState } from 'react';
import { HelpCircle, Send, Copy, Check, Volume2, VolumeX, Sparkles, Loader2 } from 'lucide-react';
import { askQuestion } from '../services/api';
import { speakText, stopSpeaking } from '../utils/speech';

export const QnASection: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const sampleQuestions = [
    'Why is the sky blue?',
    'Which is the largest ocean?',
    'What causes earthquakes?',
    'How does gravity work across the universe?',
  ];

  const handleSubmit = async (e?: React.FormEvent, customQ?: string) => {
    if (e) e.preventDefault();
    const query = customQ || question;
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    stopSpeaking();
    setIsSpeaking(false);

    try {
      const result = await askQuestion(query);
      setAnswer(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch answer.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (sample: string) => {
    setQuestion(sample);
    handleSubmit(undefined, sample);
  };

  const handleCopy = () => {
    if (!answer) return;
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else if (answer) {
      setIsSpeaking(true);
      speakText(answer, () => setIsSpeaking(false));
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-semibold text-lg">
            💬
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Ask EduGenie a Question
            </h2>
            <p className="text-xs text-slate-500">
              QnA Module • Powered by Gemini 1.5 Pro with deep academic context
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
          GET /qa
        </span>
      </div>

      {/* Sample Quick Chips */}
      <div className="mb-4">
        <p className="text-xs text-slate-400 mb-1.5 flex items-center gap-1 font-medium">
          <Sparkles className="w-3 h-3 text-amber-500" />
          Try instant sample questions:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {sampleQuestions.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => handleSelectSample(q)}
              className="text-xs px-2.5 py-1 rounded-md bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-600 border border-slate-200/70 transition-colors text-left"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e)} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Why is the sky blue?"
              required
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all bg-white placeholder-slate-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Thinking...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Get Answer</span>
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

      {/* Real-time Answer Output Box */}
      {answer && (
        <div className="mt-5 p-5 rounded-xl bg-slate-50/80 border border-slate-200 text-slate-800 text-sm leading-relaxed transition-all">
          <div className="flex items-center justify-between border-b border-slate-200/70 pb-2.5 mb-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5" />
              Answer
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleSpeak}
                className="p-1.5 text-slate-500 hover:text-blue-600 rounded-md hover:bg-slate-200/70 transition-colors"
                title={isSpeaking ? 'Stop audio' : 'Read answer aloud'}
              >
                {isSpeaking ? (
                  <VolumeX className="w-4 h-4 text-rose-500" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 text-slate-500 hover:text-blue-600 rounded-md hover:bg-slate-200/70 transition-colors"
                title="Copy answer to clipboard"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed">
            {answer}
          </div>
        </div>
      )}
    </div>
  );
};
