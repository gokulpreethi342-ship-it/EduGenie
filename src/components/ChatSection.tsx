import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Volume2, VolumeX, Copy, Check, Sparkles, RotateCcw, Loader2 } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendChatMessage } from '../services/api';
import { speakText, stopSpeaking } from '../utils/speech';

export const ChatSection: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I'm your EduGenie AI Learning Tutor 🧠. Ask me anything about your school subjects, exams, or homework doubts. I'll explain it simply and clearly!",
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    'Why does ice float on water?',
    'Explain the Doppler effect using an ambulance siren',
    'How do batteries store electrical energy?',
    'What is the difference between speed and velocity?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    // Save activity to student dashboard
    try {
      const saved = localStorage.getItem('edugenie_activities');
      const list = saved ? JSON.parse(saved) : [];
      list.unshift({
        id: String(Date.now()),
        type: 'question',
        title: userMsg.text.slice(0, 40) + (userMsg.text.length > 40 ? '...' : ''),
        preview: 'Question submitted in AI Learning Chat',
        timestamp: 'Just now',
      });
      localStorage.setItem('edugenie_activities', JSON.stringify(list.slice(0, 10)));
    } catch (e) {
      // ignore
    }

    try {
      const historyPayload = newMessages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const reply = await sendChatMessage(userMsg.text, historyPayload);

      const botMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'model',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'model',
        text: `⚠️ Sorry, I ran into an issue: ${err.message || 'Could not fetch response.'}. Please try again!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleSpeak = (id: string, text: string) => {
    if (speakingId === id) {
      stopSpeaking();
      setSpeakingId(null);
    } else {
      setSpeakingId(id);
      speakText(text, () => setSpeakingId(null));
    }
  };

  const handleResetChat = () => {
    stopSpeaking();
    setSpeakingId(null);
    setMessages([
      {
        id: 'welcome-reset',
        role: 'model',
        text: "Conversation reset! What concept would you like to explore next?",
        timestamp: 'Just now',
      },
    ]);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm flex flex-col h-[650px] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
            💬
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              AI Learning Chat
            </h2>
            <p className="text-xs text-slate-500">
              Ask questions naturally • Simple, clear explanations powered by Gemini
            </p>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
          title="Restart conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Suggested Starter Chips */}
      {messages.length <= 2 && (
        <div className="px-6 py-2.5 bg-blue-50/40 border-b border-blue-100/60 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="text-[11px] font-medium text-blue-800 shrink-0">Try asking:</span>
          {samplePrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleSend(prompt)}
              className="text-xs px-2.5 py-1 rounded-md bg-white hover:bg-blue-100/70 text-slate-700 border border-blue-200/60 transition-colors shrink-0 whitespace-nowrap"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Message Feed */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-emerald-600 text-white shadow-2xs'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[82%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-xs'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                }`}
              >
                <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                  {msg.text}
                </div>

                {!isUser && (
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                    <span>{msg.timestamp}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleSpeak(msg.id, msg.text)}
                        className="p-1 hover:text-blue-600 rounded"
                        title={speakingId === msg.id ? 'Stop reading' : 'Read aloud'}
                      >
                        {speakingId === msg.id ? (
                          <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="p-1 hover:text-blue-600 rounded"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-xs text-slate-500 flex items-center gap-2 shadow-2xs">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>EduGenie is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question naturally (e.g. 'Can you explain how photosynthesis works?')..."
            disabled={loading}
            className="flex-1 px-4 py-3 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all placeholder-slate-400"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-colors shrink-0"
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
