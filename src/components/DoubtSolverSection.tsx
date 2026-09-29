import React, { useState } from 'react';
import { Search, Send, Copy, Check, Volume2, VolumeX, Sparkles, Loader2, HelpCircle, CheckCircle } from 'lucide-react';
import { solveDoubt } from '../services/api';
import { speakText, stopSpeaking } from '../utils/speech';

export const DoubtSolverSection: React.FC = () => {
  const [problem, setProblem] = useState('');
  const [subject, setSubject] = useState('Physics / Math');
  const [solution, setSolution] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const sampleDoubts = [
    {
      sub: 'Physics',
      q: 'A stone is dropped from a cliff 80m high. Calculate the time taken to hit the ground and its final velocity. (Take g = 9.8 m/s²)',
    },
    {
      sub: 'Math',
      q: 'Find the derivative of f(x) = (3x² + 2x) * sin(x) using the product rule.',
    },
    {
      sub: 'Chemistry',
      q: 'Calculate the pH of a 0.05 M sulfuric acid (H2SO4) solution, assuming complete dissociation.',
    },
    {
      sub: 'Computer Science',
      q: 'Why does merge sort guarantee O(n log n) worst-case time while quicksort can degrade to O(n²)?',
    },
  ];

  const handleSubmit = async (e?: React.FormEvent, customP?: string, customS?: string) => {
    if (e) e.preventDefault();
    const targetP = customP || problem;
    const targetS = customS || subject;
    if (!targetP.trim()) return;

    setLoading(true);
    setError(null);
    stopSpeaking();
    setIsSpeaking(false);

    try {
      const result = await solveDoubt(targetP, targetS);
      setSolution(result);

      // Save activity
      try {
        const saved = localStorage.getItem('edugenie_activities');
        const list = saved ? JSON.parse(saved) : [];
        list.unshift({
          id: String(Date.now()),
          type: 'doubt',
          title: `Doubt: ${targetP.slice(0, 35)}...`,
          preview: `Step-by-step resolution with formula working and common traps.`,
          timestamp: 'Just now',
        });
        localStorage.setItem('edugenie_activities', JSON.stringify(list.slice(0, 10)));
      } catch (err) {}
    } catch (err: any) {
      setError(err.message || 'Failed to solve doubt.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (sample: typeof sampleDoubts[0]) => {
    setProblem(sample.q);
    setSubject(sample.sub);
    handleSubmit(undefined, sample.q, sample.sub);
  };

  const handleCopy = () => {
    if (!solution) return;
    navigator.clipboard.writeText(solution);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else if (solution) {
      setIsSpeaking(true);
      speakText(solution, () => setIsSpeaking(false));
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center font-semibold text-lg">
            🔍
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Doubt Solver
            </h2>
            <p className="text-xs text-slate-500">
              Submit tricky homework problems or doubts for step-by-step working and error-avoidance tips
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
          POST /api/doubt-solve
        </span>
      </div>

      {/* Preset Chips */}
      <div className="mb-4">
        <p className="text-xs text-slate-400 mb-1.5 flex items-center gap-1 font-medium">
          <Sparkles className="w-3 h-3 text-violet-500" />
          Try common homework numericals &amp; doubts:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {sampleDoubts.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSample(s)}
              className="text-xs px-2.5 py-1 rounded-md bg-slate-50 hover:bg-violet-50 hover:text-violet-800 text-slate-600 border border-slate-200/70 transition-colors text-left"
            >
              <span className="font-semibold text-violet-700 mr-1">[{s.sub}]</span>
              {s.q.slice(0, 48)}...
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e)} className="space-y-3">
        <textarea
          rows={3}
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder="Paste or type your difficult problem / equation / concept doubt here..."
          required
          className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-all placeholder-slate-400"
        />

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" />
            Provides Step 1 to 5 breakdown + exam traps
          </span>
          <button
            type="submit"
            disabled={loading || !problem.trim()}
            className="inline-flex items-center justify-center gap-2 px-6 py-2 text-sm font-semibold rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Solving Step-by-Step...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Solve Doubt</span>
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

      {/* Solution Container */}
      {solution && (
        <div className="mt-6 p-6 rounded-2xl bg-violet-50/30 border border-violet-200/80 text-slate-800 text-sm leading-relaxed transition-all">
          <div className="flex items-center justify-between border-b border-violet-200/70 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-violet-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-violet-600" />
                Step-by-Step Doubt Resolution
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleSpeak}
                className="p-1.5 text-slate-500 hover:text-violet-800 rounded-md hover:bg-violet-100/60 transition-colors"
                title={isSpeaking ? 'Stop audio' : 'Read aloud'}
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
                className="p-1.5 text-slate-500 hover:text-violet-800 rounded-md hover:bg-violet-100/60 transition-colors"
                title="Copy solution"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="prose prose-sm max-w-none text-slate-800 whitespace-pre-wrap leading-relaxed">
            {solution}
          </div>
        </div>
      )}
    </div>
  );
};
