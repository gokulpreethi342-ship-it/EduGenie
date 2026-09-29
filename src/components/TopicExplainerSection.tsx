import React, { useState } from 'react';
import { Lightbulb, Send, Copy, Check, Volume2, VolumeX, Sparkles, Loader2, BookOpen } from 'lucide-react';
import { explainTopicStructured } from '../services/api';
import { speakText, stopSpeaking } from '../utils/speech';

export const TopicExplainerSection: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('Physics');
  const [result, setResult] = useState<string | null>(null);
  const [displayedTopic, setDisplayedTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const sampleTopics = [
    { topic: 'Coulomb\'s Law', subject: 'Physics' },
    { topic: 'Mitosis vs Meiosis', subject: 'Biology' },
    { topic: 'Chemical Equilibrium & Le Chatelier\'s Principle', subject: 'Chemistry' },
    { topic: 'Binary Search Algorithm', subject: 'Computer Science' },
    { topic: 'Law of Diminishing Returns', subject: 'Economics' },
  ];

  const subjectsList = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Computer Science', 'Economics', 'History'];

  const handleSubmit = async (e?: React.FormEvent, customTopic?: string, customSub?: string) => {
    if (e) e.preventDefault();
    const qTopic = customTopic || topic;
    const qSub = customSub || subject;
    if (!qTopic.trim()) return;

    setLoading(true);
    setError(null);
    stopSpeaking();
    setIsSpeaking(false);

    try {
      const data = await explainTopicStructured(qTopic, qSub);
      setResult(data);
      setDisplayedTopic(qTopic);

      // Record activity to dashboard
      try {
        const saved = localStorage.getItem('edugenie_activities');
        const list = saved ? JSON.parse(saved) : [];
        list.unshift({
          id: String(Date.now()),
          type: 'topic',
          title: `Explainer: ${qTopic}`,
          preview: `Structured breakdown: Definition, Explanation, Real-world examples, and Key points.`,
          timestamp: 'Just now',
        });
        localStorage.setItem('edugenie_activities', JSON.stringify(list.slice(0, 10)));
      } catch (err) {}
    } catch (err: any) {
      setError(err.message || 'Failed to explain topic.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (sample: { topic: string; subject: string }) => {
    setTopic(sample.topic);
    setSubject(sample.subject);
    handleSubmit(undefined, sample.topic, sample.subject);
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else if (result) {
      setIsSpeaking(true);
      speakText(result, () => setIsSpeaking(false));
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
              Topic Explainer
            </h2>
            <p className="text-xs text-slate-500">
              Enter any academic topic to generate Definition, Explanation, Real-World Examples, and Key Points
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
          POST /api/explain-topic
        </span>
      </div>

      {/* Preset Chips */}
      <div className="mb-4">
        <p className="text-xs text-slate-400 mb-1.5 flex items-center gap-1 font-medium">
          <Sparkles className="w-3 h-3 text-amber-500" />
          Popular study topics:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {sampleTopics.map((s) => (
            <button
              key={s.topic}
              type="button"
              onClick={() => handleSelectSample(s)}
              className="text-xs px-2.5 py-1 rounded-md bg-slate-50 hover:bg-amber-50 hover:text-amber-800 text-slate-600 border border-slate-200/70 transition-colors text-left"
            >
              <span className="text-[10px] text-amber-600 mr-1 font-semibold">[{s.subject}]</span>
              {s.topic}
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
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Photoelectric Effect, Mitosis, Newton's 2nd Law..."
              required
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all placeholder-slate-400"
            />
          </div>

          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="px-3 py-2.5 text-sm rounded-xl border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 shrink-0"
          >
            {subjectsList.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

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
                <span>Explain Topic</span>
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

      {/* Result Container */}
      {result && (
        <div className="mt-6 p-6 rounded-2xl bg-amber-50/30 border border-amber-200/80 text-slate-800 text-sm leading-relaxed transition-all">
          <div className="flex items-center justify-between border-b border-amber-200/70 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Structured Topic Breakdown: '{displayedTopic}'
              </span>
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
                title="Copy breakdown"
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
            {result}
          </div>
        </div>
      )}
    </div>
  );
};
