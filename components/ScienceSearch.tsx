
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Search, ExternalLink, Loader2, Globe, Database } from 'lucide-react';

const ScienceSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ text: string; sources: any[] } | null>(null);

  const performSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      // Corrected: Always use process.env.API_KEY directly when initializing GoogleGenAI.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Act as a scientific validator. Verify the following environmental claim, policy assumption, or emission factor using recent and authoritative data. Provide a technical, objective assessment: ${query}`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || "No data retrieved.";
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      
      setResult({ text, sources });
    } catch (e) {
      console.error(e);
      setResult({ text: "Failed to fetch live ecological data.", sources: [] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100">
            <Globe className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Live Verification Node</h3>
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1.5">Scientific Validation Layer</p>
          </div>
        </div>
      </div>
      
      <div className="p-8">
        <div className="relative mb-8">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && performSearch()}
            placeholder="Validate policy assumptions or emission factors..."
            className="w-full bg-slate-50 border border-slate-200 rounded-3xl py-4 pl-14 pr-6 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-100 focus:border-slate-400 transition-all placeholder:text-slate-400 shadow-inner"
          />
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <button 
            onClick={performSearch}
            disabled={loading || !query.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-20 shadow-lg"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Verify"}
          </button>
        </div>

        {result ? (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 mb-6 shadow-inner">
              <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{result.text}</p>
            </div>
            
            {result.sources.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Forensic Sources</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {result.sources.map((src: any, i: number) => {
                    const url = src.web?.uri || src.maps?.uri;
                    const title = src.web?.title || src.maps?.title || "Scientific Audit Node";
                    if (!url) return null;
                    return (
                      <a 
                        key={i} 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-600 transition-all shadow-sm"
                      >
                        {title.length > 30 ? title.substring(0, 30) + '...' : title}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-16 flex flex-col items-center justify-center text-center opacity-40">
            <div className="w-20 h-20 bg-slate-100 rounded-[32px] flex items-center justify-center mb-6 border border-slate-200/50">
               <Globe className="w-10 h-10 text-slate-300" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 max-w-sm leading-relaxed">
              Validate assumptions and policies using live scientific sources.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScienceSearch;
