import React, { useState } from 'react';
import { Header } from './components/Header';
import { StudentDashboard } from './components/StudentDashboard';
import { ChatSection } from './components/ChatSection';
import { TopicExplainerSection } from './components/TopicExplainerSection';
import { ExamAnswerSection } from './components/ExamAnswerSection';
import { QuizSection } from './components/QuizSection';
import { SummarySection } from './components/SummarySection';
import { DoubtSolverSection } from './components/DoubtSolverSection';
import { StudyPlanSection } from './components/StudyPlanSection';
import { LearningPathSection } from './components/LearningPathSection';
import { ApiDocsModal } from './components/ApiDocsModal';
import { ModuleTab } from './types';
import { CheckCircle2, Sparkles, Terminal } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ModuleTab>('dashboard');
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenApiDocs={() => setIsApiModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        {/* Dynamic View rendering */}
        {activeTab === 'dashboard' && (
          <StudentDashboard onNavigate={(tab) => setActiveTab(tab)} />
        )}

        {activeTab === 'chat' && (
          <div className="max-w-4xl mx-auto">
            <ChatSection />
          </div>
        )}

        {activeTab === 'explain' && (
          <div className="max-w-4xl mx-auto">
            <TopicExplainerSection />
          </div>
        )}

        {activeTab === 'exam' && (
          <div className="max-w-4xl mx-auto">
            <ExamAnswerSection />
          </div>
        )}

        {activeTab === 'quiz' && (
          <div className="max-w-4xl mx-auto">
            <QuizSection />
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="max-w-4xl mx-auto">
            <SummarySection />
          </div>
        )}

        {activeTab === 'doubt' && (
          <div className="max-w-4xl mx-auto">
            <DoubtSolverSection />
          </div>
        )}

        {activeTab === 'study-plan' && (
          <div className="max-w-4xl mx-auto">
            <StudyPlanSection />
          </div>
        )}

        {activeTab === 'learn' && (
          <div className="max-w-4xl mx-auto">
            <LearningPathSection />
          </div>
        )}

        {activeTab === 'all' && (
          <div className="space-y-8">
            <StudentDashboard onNavigate={(tab) => setActiveTab(tab)} />
            <ChatSection />
            <TopicExplainerSection />
            <ExamAnswerSection />
            <QuizSection />
            <DoubtSolverSection />
            <SummarySection />
            <StudyPlanSection />
            <LearningPathSection />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            <strong>EduGenie</strong> — Comprehensive AI Student Suite powered by Gemini.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400">
            <span>/api/chat</span>
            <span>/api/explain-topic</span>
            <span>/api/exam-answer</span>
            <span>/quiz</span>
            <span>/api/doubt-solve</span>
            <span>/api/study-plan</span>
          </div>
        </div>
      </footer>

      {/* API Reference & Swagger-like test runner */}
      <ApiDocsModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
      />
    </div>
  );
}
