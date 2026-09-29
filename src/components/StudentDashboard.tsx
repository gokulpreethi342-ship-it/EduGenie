import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Trophy,
  HelpCircle,
  TrendingUp,
  Clock,
  Sparkles,
  BookOpen,
  FileCheck2,
  Calendar,
  Layers,
  ArrowRight,
  Plus,
  Trash2,
} from 'lucide-react';
import { ModuleTab, QuizScoreRecord, RecentActivity } from '../types';

interface StudentDashboardProps {
  onNavigate: (tab: ModuleTab) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const [subjects, setSubjects] = useState<string[]>([
    'Physics',
    'Mathematics',
    'Chemistry',
    'Computer Science',
    'Biology',
  ]);
  const [newSubject, setNewSubject] = useState('');
  const [quizHistory, setQuizHistory] = useState<QuizScoreRecord[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedScores = localStorage.getItem('edugenie_quiz_scores');
      if (savedScores) {
        setQuizHistory(JSON.parse(savedScores));
      } else {
        // Initial sample records
        const initialScores: QuizScoreRecord[] = [
          {
            id: '1',
            topic: 'Pythagoras theorem',
            score: 3,
            total: 3,
            percentage: 100,
            date: 'Today',
          },
          {
            id: '2',
            topic: 'Photosynthesis & Cells',
            score: 2,
            total: 3,
            percentage: 67,
            date: 'Yesterday',
          },
        ];
        setQuizHistory(initialScores);
        localStorage.setItem('edugenie_quiz_scores', JSON.stringify(initialScores));
      }

      const savedSubjects = localStorage.getItem('edugenie_subjects');
      if (savedSubjects) {
        setSubjects(JSON.parse(savedSubjects));
      }

      const savedActivities = localStorage.getItem('edugenie_activities');
      if (savedActivities) {
        setRecentActivities(JSON.parse(savedActivities));
      } else {
        const initialActivities: RecentActivity[] = [
          {
            id: '1',
            type: 'question',
            title: 'Which is the largest ocean?',
            preview: 'The Pacific Ocean is the largest ocean on Earth, covering over 63 million sq miles.',
            timestamp: '10 mins ago',
          },
          {
            id: '2',
            type: 'topic',
            title: 'Photosynthesis',
            preview: 'Nature’s way of turning sunshine into dinner using water and CO2.',
            timestamp: '1 hour ago',
          },
          {
            id: '3',
            type: 'quiz',
            title: 'Pythagoras theorem Quiz',
            preview: 'Scored 3/3 (100%) on Right-angled triangles & hypotenuse formulation.',
            timestamp: '2 hours ago',
          },
        ];
        setRecentActivities(initialActivities);
        localStorage.setItem('edugenie_activities', JSON.stringify(initialActivities));
      }
    } catch (e) {
      console.error('Error loading dashboard state:', e);
    }
  }, []);

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) return;
    const updated = [...subjects, newSubject.trim()];
    setSubjects(updated);
    localStorage.setItem('edugenie_subjects', JSON.stringify(updated));
    setNewSubject('');
  };

  const handleRemoveSubject = (subjectToRemove: string) => {
    const updated = subjects.filter((s) => s !== subjectToRemove);
    setSubjects(updated);
    localStorage.setItem('edugenie_subjects', JSON.stringify(updated));
  };

  // Calculations
  const totalQuizzes = quizHistory.length;
  const avgScore =
    totalQuizzes > 0
      ? Math.round(
          quizHistory.reduce((acc, curr) => acc + curr.percentage, 0) / totalQuizzes
        )
      : 0;

  const quickTools = [
    {
      tab: 'chat' as ModuleTab,
      title: 'AI Learning Chat',
      desc: 'Ask questions naturally and get simple, clear tutoring with Gemini.',
      icon: '💬',
      badge: 'Interactive',
      color: 'hover:border-blue-500 bg-blue-50/50',
    },
    {
      tab: 'explain' as ModuleTab,
      title: 'Topic Explainer',
      desc: 'Get structured Definition, Explanation, Real-world Examples, and Key Points.',
      icon: '💡',
      badge: 'Structured',
      color: 'hover:border-amber-500 bg-amber-50/50',
    },
    {
      tab: 'exam' as ModuleTab,
      title: 'Exam Answer Generator',
      desc: 'Generate answers tailored for 2-mark, 5-mark, and 10-mark questions.',
      icon: '📝',
      badge: 'High-Scoring',
      color: 'hover:border-emerald-500 bg-emerald-50/50',
    },
    {
      tab: 'quiz' as ModuleTab,
      title: 'AI Quiz Generator',
      desc: 'Test your knowledge with MCQs and instant score reporting.',
      icon: '🎯',
      badge: 'With Score',
      color: 'hover:border-rose-500 bg-rose-50/50',
    },
    {
      tab: 'doubt' as ModuleTab,
      title: 'Doubt Solver',
      desc: 'Submit tricky numericals or theory problems for step-by-step working.',
      icon: '🔍',
      badge: 'Step-by-Step',
      color: 'hover:border-violet-500 bg-violet-50/50',
    },
    {
      tab: 'study-plan' as ModuleTab,
      title: 'Study Plan Generator',
      desc: 'Personalized timetable based on subjects and available study hours.',
      icon: '📅',
      badge: 'Adaptive',
      color: 'hover:border-indigo-500 bg-indigo-50/50',
    },
    {
      tab: 'summary' as ModuleTab,
      title: 'Smart Summary',
      desc: 'Compress long textbook chapters into rapid revision notes.',
      icon: '⚡',
      badge: 'Revision',
      color: 'hover:border-purple-500 bg-purple-50/50',
    },
    {
      tab: 'learn' as ModuleTab,
      title: 'Learning Roadmap',
      desc: 'Beginner-to-Advanced stepwise learning guide with curated resources.',
      icon: '🧭',
      badge: 'Roadmap',
      color: 'hover:border-teal-500 bg-teal-50/50',
    },
  ];

  return (
    <div className="space-y-7">
      {/* Student Welcome & Key Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">My Subjects</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{subjects.length}</div>
          <span className="text-[11px] text-slate-400">Active study tracks</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Quizzes Taken</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalQuizzes}</div>
          <span className="text-[11px] text-emerald-600 font-medium">Verified evaluations</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Average Score</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{avgScore}%</div>
          <span className="text-[11px] text-indigo-600 font-medium">Overall proficiency</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Study Streak</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">5 Days 🔥</div>
          <span className="text-[11px] text-amber-600 font-medium">Keep it going!</span>
        </div>
      </div>

      {/* Quick Launchpad to Tools */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            Student Learning Modules
          </h2>
          <span className="text-xs text-slate-400">8 Powered Tools</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickTools.map((tool) => (
            <div
              key={tool.title}
              onClick={() => onNavigate(tool.tab)}
              className={`p-4 rounded-xl border border-slate-200 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${tool.color} group flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{tool.icon}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200">
                    {tool.badge}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {tool.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {tool.desc}
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs font-medium text-blue-600 group-hover:translate-x-1 transition-transform">
                <span>Open Tool</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Subjects Manager + Recent Activity & Quiz Scores */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Subjects & Exam Targets */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              Enrolled Subjects
            </h3>
            <span className="text-xs text-slate-400">{subjects.length} subjects</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {subjects.map((sub) => (
              <span
                key={sub}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700"
              >
                <span>{sub}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSubject(sub)}
                  className="text-slate-400 hover:text-rose-500"
                  title="Remove subject"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <form onSubmit={handleAddSubject} className="flex gap-2 pt-2">
            <input
              type="text"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="Add subject (e.g. History)..."
              className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </form>

          {/* Quick Study Tip Card */}
          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 space-y-1">
            <strong className="flex items-center gap-1 text-blue-800">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              EduGenie Study Strategy
            </strong>
            <p className="text-slate-600 leading-relaxed">
              Target 1 high-focus topic per day with the <strong>Topic Explainer</strong>, then verify retention with an instant 3-question <strong>Quiz</strong>.
            </p>
          </div>
        </div>

        {/* Right 2 Columns: Quiz Scores History & Recent Activities */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quiz Scores Log */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-emerald-600" />
                Recent Quiz Performance &amp; Scores
              </h3>
              <button
                onClick={() => onNavigate('quiz')}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Take New Quiz →
              </button>
            </div>

            {quizHistory.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                No quizzes taken yet. Test your knowledge using the AI Quiz Generator!
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-100 pb-2">
                      <th className="pb-2 font-medium">Topic</th>
                      <th className="pb-2 font-medium">Score</th>
                      <th className="pb-2 font-medium">Percentage</th>
                      <th className="pb-2 font-medium">Date</th>
                      <th className="pb-2 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {quizHistory.map((q) => (
                      <tr key={q.id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 font-semibold text-slate-800">
                          {q.topic}
                        </td>
                        <td className="py-2.5 text-slate-600">
                          {q.score} / {q.total}
                        </td>
                        <td className="py-2.5">
                          <span
                            className={`font-bold ${
                              q.percentage >= 80
                                ? 'text-emerald-600'
                                : q.percentage >= 60
                                ? 'text-amber-600'
                                : 'text-rose-600'
                            }`}
                          >
                            {q.percentage}%
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-400">{q.date}</td>
                        <td className="py-2.5 text-right">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${
                              q.percentage === 100
                                ? 'bg-emerald-100 text-emerald-800'
                                : q.percentage >= 60
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {q.percentage === 100 ? 'Mastered' : q.percentage >= 60 ? 'Passed' : 'Needs Review'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Questions / Activities */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                Recent Questions &amp; Queries
              </h3>
              <span className="text-xs text-slate-400">Session Activity</span>
            </div>

            <div className="space-y-3">
              {recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">
                      {act.title}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {act.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {act.preview}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
