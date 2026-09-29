import React, { useState } from 'react';
import { Calendar, Send, Copy, Check, Sparkles, Loader2, Clock, Download, CheckCircle2 } from 'lucide-react';
import { generateStudyPlan } from '../services/api';

export const StudyPlanSection: React.FC = () => {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    'Physics',
    'Mathematics',
    'Chemistry',
  ]);
  const [customSubjectInput, setCustomSubjectInput] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState(3);
  const [durationWeeks, setDurationWeeks] = useState(2);
  const [examGoal, setExamGoal] = useState('Ace upcoming semester exams with 90%+');
  const [studyPlan, setStudyPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const availableSubjectPool = [
    'Physics',
    'Mathematics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'Economics',
    'English Literature',
    'History',
  ];

  const toggleSubject = (sub: string) => {
    if (selectedSubjects.includes(sub)) {
      if (selectedSubjects.length > 1) {
        setSelectedSubjects(selectedSubjects.filter((s) => s !== sub));
      }
    } else {
      setSelectedSubjects([...selectedSubjects, sub]);
    }
  };

  const handleAddCustomSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSubjectInput.trim()) return;
    const name = customSubjectInput.trim();
    if (!selectedSubjects.includes(name)) {
      setSelectedSubjects([...selectedSubjects, name]);
    }
    setCustomSubjectInput('');
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (selectedSubjects.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const plan = await generateStudyPlan(
        selectedSubjects,
        hoursPerDay,
        durationWeeks,
        examGoal
      );
      setStudyPlan(plan);

      // Record activity
      try {
        const saved = localStorage.getItem('edugenie_activities');
        const list = saved ? JSON.parse(saved) : [];
        list.unshift({
          id: String(Date.now()),
          type: 'exam',
          title: `Study Plan: ${durationWeeks} Weeks (${selectedSubjects.join(', ')})`,
          preview: `Personalized schedule with Pomodoro routines and weekly milestones.`,
          timestamp: 'Just now',
        });
        localStorage.setItem('edugenie_activities', JSON.stringify(list.slice(0, 10)));
      } catch (err) {}
    } catch (err: any) {
      setError(err.message || 'Failed to generate study plan.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!studyPlan) return;
    navigator.clipboard.writeText(studyPlan);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!studyPlan) return;
    const element = document.createElement('a');
    const file = new Blob([studyPlan], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `edugenie_study_plan_${durationWeeks}w.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-semibold text-lg">
            📅
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Personalized Study Plan Generator
            </h2>
            <p className="text-xs text-slate-500">
              Create a personalized study schedule based on your subjects, available time, and target goals
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
          POST /api/study-plan
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Subject Pills Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            1. Select Subjects to Study:
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {availableSubjectPool.map((sub) => {
              const isSelected = selectedSubjects.includes(sub);
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => toggleSubject(sub)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {isSelected && '✓ '}
                  {sub}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 max-w-sm mt-2">
            <input
              type="text"
              value={customSubjectInput}
              onChange={(e) => setCustomSubjectInput(e.target.value)}
              placeholder="Add other subject..."
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={handleAddCustomSubject}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-medium"
            >
              + Add
            </button>
          </div>
        </div>

        {/* Daily Hours Slider & Duration Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                Available Study Time:
              </label>
              <span className="text-sm font-bold text-indigo-700">
                {hoursPerDay} {hoursPerDay === 1 ? 'hour' : 'hours'} / day
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={8}
              step={1}
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(parseInt(e.target.value, 10))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>1 hr (Light)</span>
              <span>3-4 hrs (Optimal)</span>
              <span>8 hrs (Intensive)</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Plan Duration:
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 2, 4, 8].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setDurationWeeks(w)}
                  className={`py-2 text-xs font-medium rounded-lg border transition-all text-center ${
                    durationWeeks === w
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {w} {w === 1 ? 'Week' : 'Weeks'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Exam Goal */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Exam Target / Learning Goal:
          </label>
          <input
            type="text"
            value={examGoal}
            onChange={(e) => setExamGoal(e.target.value)}
            placeholder="e.g. Master Calculus & Mechanics for finals..."
            className="w-full px-4 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder-slate-400"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || selectedSubjects.length === 0}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Designing Timetable...</span>
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4" />
                <span>Generate Personalized Schedule</span>
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
      {studyPlan && (
        <div className="mt-6 p-6 rounded-2xl bg-indigo-50/30 border border-indigo-200/80 text-slate-800 text-sm leading-relaxed transition-all">
          <div className="flex items-center justify-between border-b border-indigo-200/70 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                Your Custom Study Timetable
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleDownload}
                className="p-1.5 text-slate-500 hover:text-indigo-800 rounded-md hover:bg-indigo-100/60 transition-colors"
                title="Download study schedule"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 text-slate-500 hover:text-indigo-800 rounded-md hover:bg-indigo-100/60 transition-colors"
                title="Copy schedule"
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
            {studyPlan}
          </div>
        </div>
      )}
    </div>
  );
};
