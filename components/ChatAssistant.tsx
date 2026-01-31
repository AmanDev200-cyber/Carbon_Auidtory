
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { MessageSquare, Send, X, Bot, User, Loader2, Sparkles, HelpCircle, Zap, Globe } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const SUGGESTIONS = [
  { label: "What is 'Marginal Addition'?", icon: Zap },
  { label: "Explain 'Integrated State'", icon: Globe },
  { label: "How can I reduce my flux?", icon: Sparkles },
  { label: "Is my impact stable?", icon: HelpCircle },
];

const ChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Auditor Online. I can translate your forensic carbon data into simple insights. What would you like to understand about your impact?' }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async (overrideText?: string) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage = textToSend.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      // Corrected: Always use process.env.API_KEY directly when initializing GoogleGenAI.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const chat = ai.chats.create({
        model: 'gemini-3-pro-preview',
        config: {
          systemInstruction: `You are the Science Translator for the Carbon Accumulator app. 
          Your goal is to explain complex ecological data to non-experts. 
          
          CORE DEFINITIONS TO USE:
          1. 'Marginal Addition' is the extra carbon someone adds TODAY (the delta). Analogy: Adding one more bucket of water to a pool.
          2. 'Integrated State' is the long-term result of continuous behavior. Analogy: The total water level in the pool over a year.
          
          STRICT TONE RULES:
          - Use forensic precision first, but ALWAYS follow with a "Simple Takeaway" or analogy.
          - Never say "zero impact" if a timeframe is empty; explain it as a "reference starting point".
          - Be encouraging but factually honest about climate thresholds.`,
        },
      });

      const response = await chat.sendMessage({ message: userMessage });
      const text = response.text || "Communication interrupted. Please retry.";

      setMessages(prev => [...prev, { role: 'model', text }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Error accessing the planetary database. Please check your connection." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-slate-950 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-[100] ring-4 ring-white/10 group"
      >
        {isOpen ? <X className="w-6 h-6 group-hover:rotate-90 transition-transform" /> : <MessageSquare className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
        {!isOpen && messages.length === 1 && (
          <span className="absolute -top-2 -right-2 w-5 h-5 bg-indigo-500 rounded-full animate-ping opacity-75"></span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 md:inset-auto md:bottom-28 md:right-8 md:w-[480px] md:h-[700px] bg-slate-950/98 backdrop-blur-3xl md:rounded-[48px] shadow-3xl z-[101] flex flex-col border border-white/10 animate-in fade-in slide-in-from-bottom-8 duration-300">
          {/* Header */}
          <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/5 md:rounded-t-[48px]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
                <Bot className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Ecological AI</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Translator Mode Active</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2.5 hover:bg-white/10 rounded-xl transition-colors">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Messages Container */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                <div className={`max-w-[88%] p-5 rounded-3xl text-[13px] leading-relaxed ${msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none font-medium'
                    : 'bg-white/5 text-slate-300 border border-white/10 rounded-tl-none font-medium'
                  }`}>
                  {msg.text.split('\n').map((line, j) => (
                    <p key={j} className={j > 0 ? 'mt-3' : ''}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 p-5 rounded-3xl rounded-tl-none flex items-center gap-3">
                  <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Synthesizing Insight...</span>
                </div>
              </div>
            )}
          </div>

          {/* Suggestions Layer */}
          {!loading && messages.length < 5 && (
            <div className="px-8 pb-4 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(s.label)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[9px] font-black text-white/40 uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all"
                >
                  <s.icon className="w-3 h-3" />
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {/* Input Layer */}
          <div className="p-8 pt-4 bg-white/5 border-t border-white/10 md:rounded-b-[48px]">
            <div className="relative group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask for an explanation..."
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-5 pl-7 pr-16 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 placeholder:text-white/10 transition-all shadow-inner"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-indigo-500 text-white rounded-xl flex items-center justify-center hover:bg-indigo-400 transition-all disabled:opacity-20 disabled:grayscale"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-6 px-1">
              <div className="flex items-center gap-2 opacity-20">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span className="text-[8px] font-black text-white uppercase tracking-[0.2em]">Scientific Audit Core</span>
              </div>
              <span className="text-[8px] font-black text-white/10 uppercase tracking-widest">Gemini 3 Pro</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatAssistant;
