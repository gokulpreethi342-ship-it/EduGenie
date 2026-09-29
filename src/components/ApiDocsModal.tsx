import React, { useState } from 'react';
import { X, Code2, Play, CheckCircle, ExternalLink, Copy, Check } from 'lucide-react';

interface ApiDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiDocsModal: React.FC<ApiDocsModalProps> = ({ isOpen, onClose }) => {
  const [activeEndpoint, setActiveEndpoint] = useState<'qa' | 'explain' | 'quiz' | 'summarize' | 'learn'>('qa');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const endpoints = [
    {
      id: 'qa' as const,
      method: 'GET',
      path: '/qa?question=...',
      desc: 'QnA Module with Gemini 1.5 Pro',
      sampleQuery: 'Why is the sky blue?',
      curl: 'curl -X GET "http://localhost:3000/qa?question=Why%20is%20the%20sky%20blue%3F"',
    },
    {
      id: 'explain' as const,
      method: 'POST',
      path: '/explain/',
      desc: 'Explanation Module (LaMini-Flan-T5 tuned)',
      sampleBody: JSON.stringify({ topic: 'Photosynthesis' }, null, 2),
      curl: 'curl -X POST "http://localhost:3000/explain" -H "Content-Type: application/json" -d \'{"topic":"Photosynthesis"}\'',
    },
    {
      id: 'quiz' as const,
      method: 'POST',
      path: '/quiz',
      desc: 'Quiz Module (Generates 3 MCQs in JSON format)',
      sampleBody: JSON.stringify({ text: 'Pythagoras theorem' }, null, 2),
      curl: 'curl -X POST "http://localhost:3000/quiz" -H "Content-Type: application/json" -d \'{"text":"Pythagoras theorem"}\'',
    },
    {
      id: 'summarize' as const,
      method: 'POST',
      path: '/summarize/',
      desc: 'Summary Module (Paragraph simplification)',
      sampleBody: JSON.stringify({ text: 'Photosynthesis is the biological process used by plants...' }, null, 2),
      curl: 'curl -X POST "http://localhost:3000/summarize" -H "Content-Type: application/json" -d \'{"text":"Passage..."}\'',
    },
    {
      id: 'learn' as const,
      method: 'GET',
      path: '/learn/recommendations?topic=...',
      desc: 'Adaptive Learning Path & Curated Resources',
      sampleQuery: 'SQL',
      curl: 'curl -X GET "http://localhost:3000/learn/recommendations?topic=SQL"',
    },
  ];

  const current = endpoints.find((e) => e.id === activeEndpoint)!;

  const runTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      let res: Response;
      if (current.id === 'qa') {
        res = await fetch(`/qa?question=${encodeURIComponent(current.sampleQuery!)}`);
      } else if (current.id === 'explain') {
        res = await fetch('/explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: current.sampleBody,
        });
      } else if (current.id === 'quiz') {
        res = await fetch('/quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: current.sampleBody,
        });
      } else if (current.id === 'summarize') {
        res = await fetch('/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: current.sampleBody,
        });
      } else {
        res = await fetch(`/learn/recommendations?topic=${encodeURIComponent(current.sampleQuery!)}`);
      }

      const json = await res.json();
      setTestResult(JSON.stringify(json, null, 2));
    } catch (err: any) {
      setTestResult(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setTesting(false);
    }
  };

  const copyCurl = () => {
    navigator.clipboard.writeText(current.curl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">
              EduGenie REST API Reference (FastAPI / Express)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Endpoint Selector Tabs */}
        <div className="px-6 pt-3 pb-2 border-b border-slate-100 flex gap-1.5 overflow-x-auto bg-white scrollbar-none">
          {endpoints.map((ep) => (
            <button
              key={ep.id}
              onClick={() => {
                setActiveEndpoint(ep.id);
                setTestResult(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 shrink-0 transition-all ${
                activeEndpoint === ep.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span
                className={`text-[10px] font-mono px-1 py-0.2 rounded font-bold ${
                  ep.method === 'GET'
                    ? 'bg-blue-500 text-white'
                    : 'bg-emerald-500 text-white'
                }`}
              >
                {ep.method}
              </span>
              <span>{ep.path.split('?')[0]}</span>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <h4 className="font-semibold text-slate-800 text-sm mb-1">{current.desc}</h4>
            <div className="flex items-center gap-2 font-mono text-xs bg-slate-100 p-2 rounded-lg border border-slate-200">
              <span className="font-bold text-indigo-600">{current.method}</span>
              <span className="text-slate-700">{current.path}</span>
            </div>
          </div>

          {/* cURL section */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-slate-600">cURL Example:</span>
              <button
                type="button"
                onClick={copyCurl}
                className="flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy cURL'}
              </button>
            </div>
            <pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg overflow-x-auto font-mono text-[11px]">
              {current.curl}
            </pre>
          </div>

          {/* Request Payload / Query */}
          {current.sampleBody && (
            <div>
              <span className="font-medium text-slate-600 mb-1 block">Request Body (JSON):</span>
              <pre className="p-3 bg-slate-100 text-slate-800 rounded-lg overflow-x-auto font-mono text-[11px] border border-slate-200">
                {current.sampleBody}
              </pre>
            </div>
          )}

          {/* Live Runner Button */}
          <div className="pt-2">
            <button
              onClick={runTest}
              disabled={testing}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-xs disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              {testing ? 'Testing Endpoint...' : 'Send Live Request'}
            </button>
          </div>

          {/* Live Response Box */}
          {testResult && (
            <div className="mt-4">
              <div className="flex items-center gap-1.5 text-slate-700 font-semibold mb-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                Live Response:
              </div>
              <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto font-mono text-[11px] max-h-60">
                {testResult}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
