import React, { useState } from 'react';
import { Award, Send, Copy, Check, Volume2, VolumeX, Sparkles, Loader2, Bookmark, CheckCircle2 } from 'lucide-react';
import { generateExamAnswer } from '../services/api';
import { speakText, stopSpeaking } from '../utils/speech';

export const ExamAnswerSection: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [markWeight, setMarkWeight] = useState<'2' | '5' | '10'>('5');
  const [subject, setSubject] = useState('Physics');
  const [modelAnswer, setModelAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const sampleQuestions = [
    {
      q: 'State and explain Ohm\'s Law. Write its mathematical formula and SI unit.',
      marks: '2' as const,
      sub: 'Physics',
    },
    {
      q: 'Explain the working principle and construction of an Electric Motor with a labeled diagram description.',
      marks: '5' as const,
      sub: 'Physics',
    },
    {
      q: 'Describe the complete process of DNA replication with all involved enzymes (Helicase, Polymerase, Ligase).',
      marks: '10' as const,
      sub: 'Biology',
    },
    {
      q: 'Explain the working of Le Chatelier\'s Principle with effects of temperature, pressure, and concentration.',
      marks: '5' as const,
      sub: 'Chemistry',
    },
  ];

  const handleSubmit = async (e?: React.FormEvent, customQ?: string, customM?: '2' | '5' | '10') => {
    if (e) e.preventDefault();
    const targetQ = customQ || question;
    const targetM = customM || markWeight;
    if (!targetQ.trim()) return;

    setLoading(true);
    setError(null);
    stopSpeaking();
    setIsSpeaking(false);

    try {
      const answer = await generateExamAnswer(targetQ, targetM, subject);
      setModelAnswer(answer);

      // Record activity to dashboard
      try {
        const saved = localStorage.getItem('edugenie_activities');
        const list = saved ? JSON.parse(saved) : [];
        list.unshift({
          id: String(Date.now()),
          type: 'exam',
          title: `${targetM}-Mark Answer: ${targetQ.slice(0, 35)}...`,
          preview: `Generated exam model answer tailored for ${targetM} marks.`,
          timestamp: 'Just now',
        });
        localStorage.setItem('edugenie_activities', JSON.stringify(list.slice(0, 10)));
      } catch (err) {}
    } catch (err: any) {
      setError(err.message || 'Failed to generate exam answer.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (sample: typeof sampleQuestions[0]) => {
    setQuestion(sample.q);
    setMarkWeight(sample.marks);
    setSubject(sample.sub);
    handleSubmit(undefined, sample.q, sample.marks);
  };

  const handleCopy = () => {
    if (!modelAnswer) return;
    navigator.clipboard.writeText(modelAnswer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else if (modelAnswer) {
      setIsSpeaking(true);
      speakText(modelAnswer, () => setIsSpeaking(false));
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-semibold text-lg">
            📝
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Exam Answer Generator
            </h2>
            <p className="text-xs text-slate-500">
              Tailored specifically for school &amp; board exams • 2-mark, 5-mark, and 10-mark model solutions
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
          POST /api/exam-answer
        </span>
      </div>

      {/* Preset Exam Questions */}
      <div className="mb-4">
        <p className="text-xs text-slate-400 mb-1.5 flex items-center gap-1 font-medium">
          <Sparkles className="w-3 h-3 text-emerald-500" />
          Sample Board / College Exam Questions:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {sampleQuestions.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSample(s)}
              className="text-xs px-2.5 py-1 rounded-md bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 border border-slate-200/70 transition-colors text-left"
            >
              <span className="font-semibold text-emerald-700 mr-1">[{s.marks} Marks]</span>
              {s.q.slice(0, 45)}...
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
        {/* Marks Selector Buttons */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Select Question Mark Scheme:
          </label>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setMarkWeight('2')}
              className={`p-3 rounded-xl border text-left transition-all ${
                markWeight === '2'
                  ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600/30'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900">2 Marks</span>
                {markWeight === '2' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              </div>
              <p className="text-[11px] text-slate-500">Short Answer (40–60 words, definition &amp; formula)</p>
            </button>

            <button
              type="button"
              onClick={() => setMarkWeight('5')}
              className={`p-3 rounded-xl border text-left transition-all ${
                markWeight === '5'
                  ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600/30'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900">5 Marks</span>
                {markWeight === '5' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              </div>
              <p className="text-[11px] text-slate-500">Medium Answer (120–180 words, 4–5 structured points)</p>
            </button>

            <button
              type="button"
              onClick={() => setMarkWeight('10')}
              className={`p-3 rounded-xl border text-left transition-all ${
                markWeight === '10'
                  ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600/30'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900">10 Marks</span>
                {markWeight === '10' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              </div>
              <p className="text-[11px] text-slate-500">Long Essay (300–450 words, derivation, diagram &amp; essay)</p>
            </button>
          </div>
        </div>

        {/* Question Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Exam Question:
          </label>
          <textarea
            rows={2}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your exam question here (e.g. State Newton's second law and derive F=ma)..."
            required
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all placeholder-slate-400"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Crafting Model Answer...</span>
              </>
            ) : (
              <>
                <Award className="w-4 h-4" />
                <span>Generate {markWeight}-Mark Model Answer</span>
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

      {/* Model Answer Output */}
      {modelAnswer && (
        <div className="mt-6 p-6 rounded-2xl bg-emerald-50/30 border border-emerald-200/80 text-slate-800 text-sm leading-relaxed transition-all">
          <div className="flex items-center justify-between border-b border-emerald-200/70 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5" />
                Model Exam Answer ({markWeight} Marks)
              </span>
              <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium">
                Examiner-Approved Format
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleSpeak}
                className="p-1.5 text-slate-500 hover:text-emerald-800 rounded-md hover:bg-emerald-100/60 transition-colors"
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
                className="p-1.5 text-slate-500 hover:text-emerald-800 rounded-md hover:bg-emerald-100/60 transition-colors"
                title="Copy answer"
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
            {modelAnswer}
          </div>
        </div>
      )}
    </div>
  );
};
