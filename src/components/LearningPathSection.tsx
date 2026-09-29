import React, { useState } from 'react';
import { Compass, Send, Copy, Check, Sparkles, Loader2, BookOpen, Download } from 'lucide-react';
import { getLearningRecommendations } from '../services/api';

export const LearningPathSection: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [displayedTopic, setDisplayedTopic] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const sampleTopics = [
    'SQL',
    'Linear Regression',
    'Python Programming',
    'Data Structures & Algorithms',
    'Quantum Physics for Beginners',
  ];

  const handleSubmit = async (e?: React.FormEvent, customTopic?: string) => {
    if (e) e.preventDefault();
    const query = customTopic || topic;
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getLearningRecommendations(query);
      setRecommendation(result);
      setDisplayedTopic(query);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch learning recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (sample: string) => {
    setTopic(sample);
    handleSubmit(undefined, sample);
  };

  const handleCopy = () => {
    if (!recommendation) return;
    navigator.clipboard.writeText(recommendation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!recommendation) return;
    const element = document.createElement('a');
    const file = new Blob([recommendation], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${displayedTopic.toLowerCase().replace(/[^a-z0-9]/g, '_')}_learning_path.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-semibold text-lg">
            🧭
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Get Learning Recommendations
            </h2>
            <p className="text-xs text-slate-500">
              Learning Path Module • Personalized roadmap with beginner-to-advanced tiers &amp; curated resources
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
          GET /learn/recommendations
        </span>
      </div>

      {/* Quick Chips */}
      <div className="mb-4">
        <p className="text-xs text-slate-400 mb-1.5 flex items-center gap-1 font-medium">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          Recommended learning subjects:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {sampleTopics.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleSelectSample(t)}
              className="text-xs px-2.5 py-1 rounded-md bg-slate-50 hover:bg-indigo-50 hover:text-indigo-800 text-slate-600 border border-slate-200/70 transition-colors text-left"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={(e) => handleSubmit(e)} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              id="recTopic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Linear Regression or SQL"
              required
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-white placeholder-slate-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Building Path...</span>
              </>
            ) : (
              <>
                <Compass className="w-4 h-4" />
                <span>Get Recommendations</span>
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

      {/* Output Container */}
      {recommendation && (
        <div className="mt-5 p-6 rounded-xl bg-indigo-50/30 border border-indigo-200/70 text-slate-800 text-sm leading-relaxed transition-all">
          <div className="flex items-center justify-between border-b border-indigo-200/60 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Curated Learning Path for '{displayedTopic}'
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleDownload}
                className="p-1.5 text-slate-500 hover:text-indigo-800 rounded-md hover:bg-indigo-100/60 transition-colors"
                title="Download as Markdown"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 text-slate-500 hover:text-indigo-800 rounded-md hover:bg-indigo-100/60 transition-colors"
                title="Copy learning path"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="prose prose-sm max-w-none text-slate-800 whitespace-pre-wrap leading-relaxed font-sans">
            {recommendation}
          </div>
        </div>
      )}
    </div>
  );
};
