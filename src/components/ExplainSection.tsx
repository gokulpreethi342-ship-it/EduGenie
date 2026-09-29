import React, { useState } from 'react';
import { Lightbulb, Send, Copy, Check, Volume2, VolumeX, Sparkles, Loader2, BookOpen } from 'lucide-react';
import { explainTopic } from '../services/api';
import { speakText, stopSpeaking } from '../utils/speech';

export const ExplainSection: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [explanation, setExplanation] = useState<string | null>(null);
  const [displayedTopic, setDisplayedTopic] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const sampleTopics = [
    'Photosynthesis',
    'Pythagoras theorem',
    'Newton\'s Laws of Motion',
    'How Electricity Works',
    'Mitochondria (Powerhouse of the Cell)',
  ];

  const handleSubmit = async (e?: React.FormEvent, customTopic?: string) => {
    if (e) e.preventDefault();
    const query = customTopic || topic;
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    stopSpeaking();
    setIsSpeaking(false);

    try {
      const result = await explainTopic(query);
      setExplanation(result);
      setDisplayedTopic(query);
    } catch (err: any) {
      setError(err.message || 'Failed to generate explanation.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (sample: string) => {
    setTopic(sample);
    handleSubmit(undefined, sample);
  };

  const handleCopy = () => {
    if (!explanation) return;
    navigator.clipboard.writeText(explanation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else if (explanation) {
      setIsSpeaking(true);
      speakText(explanation, () => setIsSpeaking(false));
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-semibold text-lg">
            💡
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Need an Explanation?
            </h2>
            <p className="text-xs text-slate-500">
              Explanation Module • Simplified &amp; student-friendly concept breakdowns (LaMini-Flan-T5 style)
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
          POST /explain/
        </span>
      </div>

      {/* Quick Chips */}
      <div className="mb-4">
        <p className="text-xs text-slate-400 mb-1.5 flex items-center gap-1 font-medium">
          <Sparkles className="w-3 h-3 text-amber-500" />
          Popular school &amp; academic concepts:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {sampleTopics.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleSelectSample(t)}
              className="text-xs px-2.5 py-1 rounded-md bg-slate-50 hover:bg-amber-50 hover:text-amber-800 text-slate-600 border border-slate-200/70 transition-colors text-left"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e)} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Photosynthesis"
              required
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all bg-white placeholder-slate-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Explaining...</span>
              </>
            ) : (
              <>
                <Lightbulb className="w-4 h-4" />
                <span>Explain</span>
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
      {explanation && (
        <div className="mt-5 p-5 rounded-xl bg-amber-50/40 border border-amber-200/70 text-slate-800 text-sm leading-relaxed transition-all">
          <div className="flex items-center justify-between border-b border-amber-200/60 pb-2.5 mb-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              Explanation for '{displayedTopic}'
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleSpeak}
                className="p-1.5 text-slate-500 hover:text-amber-800 rounded-md hover:bg-amber-100/60 transition-colors"
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
                className="p-1.5 text-slate-500 hover:text-amber-800 rounded-md hover:bg-amber-100/60 transition-colors"
                title="Copy explanation"
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
            {explanation}
          </div>
        </div>
      )}
    </div>
  );
};
