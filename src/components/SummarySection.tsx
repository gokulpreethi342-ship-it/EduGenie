import React, { useState } from 'react';
import { FileText, Send, Copy, Check, Volume2, VolumeX, Sparkles, Loader2, Minimize2 } from 'lucide-react';
import { summarizeText } from '../services/api';
import { speakText, stopSpeaking } from '../utils/speech';

export const SummarySection: React.FC = () => {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const samplePassages = [
    {
      title: 'Machine Learning Basics',
      content:
        'Machine learning is a subset of artificial intelligence focused on building applications that learn from data and improve their accuracy over time without being explicitly programmed to do so. In data science, an algorithm is a sequence of statistical processing steps. In machine learning, algorithms are trained to find patterns and features in massive amounts of data in order to make decisions and predictions based on new data. The better the algorithm, the more accurate the decisions and predictions will become as it processes more data. Today, machine learning is all around us, from recommendation engines on streaming services to fraud detection in banking.',
    },
    {
      title: 'Photosynthesis Process',
      content:
        'Photosynthesis is the biological process used by plants, algae, and certain bacteria to transform light energy, usually from the Sun, into chemical energy. This energy is stored in carbohydrate molecules, such as sugars and starches, synthesized from carbon dioxide and water. Photosynthesis is largely responsible for producing and maintaining the oxygen content of the Earth\'s atmosphere, and supplies most of the biological energy necessary for complex life on Earth. The process always begins when energy from light is absorbed by proteins called reaction centres that contain green chlorophyll pigments.',
    },
    {
      title: 'Newton\'s Laws',
      content:
        'Sir Isaac Newton formulated three physical laws that established the foundation for classical mechanics. The first law, known as the law of inertia, states that an object at rest remains at rest, and an object in motion remains in motion at constant velocity unless acted upon by a net external force. The second law states that the acceleration of an object is directly proportional to the net force acting upon it and inversely proportional to its mass (F = ma). The third law states that for every action, there is an equal and opposite reaction.',
    },
  ];

  const handleSubmit = async (e?: React.FormEvent, customContent?: string) => {
    if (e) e.preventDefault();
    const query = customContent || text;
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    stopSpeaking();
    setIsSpeaking(false);

    try {
      const result = await summarizeText(query);
      setSummary(result);
    } catch (err: any) {
      setError(err.message || 'Failed to summarize text.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (content: string) => {
    setText(content);
    handleSubmit(undefined, content);
  };

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else if (summary) {
      setIsSpeaking(true);
      speakText(summary, () => setIsSpeaking(false));
    }
  };

  const originalWordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const summaryWordCount = summary?.trim() ? summary.trim().split(/\s+/).length : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-semibold text-lg">
            📝
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Summarize a Paragraph
            </h2>
            <p className="text-xs text-slate-500">
              Summary Module • Distills long educational passages into concise, revision-ready notes
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
          POST /summarize/
        </span>
      </div>

      {/* Preset Chips */}
      <div className="mb-4">
        <p className="text-xs text-slate-400 mb-1.5 flex items-center gap-1 font-medium">
          <Sparkles className="w-3 h-3 text-purple-500" />
          Load sample passages:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {samplePassages.map((p) => (
            <button
              key={p.title}
              type="button"
              onClick={() => handleSelectSample(p.content)}
              className="text-xs px-2.5 py-1 rounded-md bg-slate-50 hover:bg-purple-50 hover:text-purple-800 text-slate-600 border border-slate-200/70 transition-colors text-left"
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e)} className="space-y-3">
        <div className="flex flex-col gap-2.5">
          <textarea
            id="summaryText"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste long content to summarize..."
            required
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all bg-white placeholder-slate-400 resize-y"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {originalWordCount} words input
            </span>
            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Summarizing...</span>
                </>
              ) : (
                <>
                  <Minimize2 className="w-4 h-4" />
                  <span>Summarize</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Error notification */}
      {error && (
        <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* Output Container */}
      {summary && (
        <div className="mt-5 p-5 rounded-xl bg-purple-50/40 border border-purple-200/70 text-slate-800 text-sm leading-relaxed transition-all">
          <div className="flex items-center justify-between border-b border-purple-200/60 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-purple-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Summary Result
              </span>
              {summaryWordCount > 0 && (
                <span className="text-[11px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-medium">
                  {summaryWordCount} words (compressed {Math.max(0, Math.round((1 - summaryWordCount / (originalWordCount || 1)) * 100))}% )
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleSpeak}
                className="p-1.5 text-slate-500 hover:text-purple-800 rounded-md hover:bg-purple-100/60 transition-colors"
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
                className="p-1.5 text-slate-500 hover:text-purple-800 rounded-md hover:bg-purple-100/60 transition-colors"
                title="Copy summary"
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
            {summary}
          </div>
        </div>
      )}
    </div>
  );
};
