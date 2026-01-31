
import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import { CategoryBreakdown, UserInputs, CategoryComponent } from '../types';
import { Lightbulb, Sparkles, Loader2, CheckCircle2, TrendingDown, Target } from 'lucide-react';

interface ActionCenterProps {
  breakdown: CategoryBreakdown;
  inputs: UserInputs;
}

interface Tip {
  action: string;
  reduction: string;
}

const ActionCenter: React.FC<ActionCenterProps> = ({ breakdown, inputs }) => {
  const [loading, setLoading] = useState(false);
  const [tips, setTips] = useState<Tip[]>([]);

  const getPersonalizedAdvice = async () => {
    setLoading(true);
    try {
      // Corrected: Always use process.env.API_KEY directly when initializing GoogleGenAI.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // FIX: Access .user and .baseline properties of CategoryComponent objects before calling toFixed.
      const prompt = `Act as an Elite Planetary Auditor. Analyze this forensic anthropogenic footprint:
        - Transport: ${(breakdown.transport.user + breakdown.transport.baseline).toFixed(2)} kg/day (${inputs.transportMode})
        - Energy: ${(breakdown.energy.user + breakdown.energy.baseline).toFixed(2)} kg/day
        - Food: ${(breakdown.food.user + breakdown.food.baseline).toFixed(2)} kg/day
        - Lifestyle: ${(breakdown.lifestyle.user + breakdown.lifestyle.baseline).toFixed(2)} kg/day
        
        Systemic Annual Load: ${(breakdown.total * 365).toFixed(0)} kg

        Provide exactly 3 context-aware, scientifically rigorous reduction strategies. 
        Focus on the highest forcers first. Each must have a calculated annual biospheric saving.
        Maintain a direct, evidence-based tone.
        
        Format as JSON: [{"action": "strategy", "reduction": "X kg saved annually"}]`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      
      const parsedTips = JSON.parse(response.text.trim());
      setTips(parsedTips);
    } catch (e) {
      setTips([
        { action: "Optimize transport metabolism (Shift 10km daily)", reduction: "approx. 620 kg saved annually" },
        { action: "Caloric source adjustment (Plant-based 3d/wk)", reduction: "approx. 400 kg saved annually" },
        { action: "Energy flux reduction (Decrease AC by 2h)", reduction: "approx. 876 kg saved annually" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPersonalizedAdvice();
  }, [breakdown.total]);

  // FIX: Fixed highestCategory logic to correctly sum components for each category and only check valid category keys.
  const highestCategory = useMemo(() => {
    const categories: (keyof CategoryBreakdown)[] = ['transport', 'energy', 'food', 'lifestyle'];
    return categories.reduce((a, b) => {
      const aComp = breakdown[a] as CategoryComponent;
      const bComp = breakdown[b] as CategoryComponent;
      const aTotal = aComp.user + aComp.baseline;
      const bTotal = bComp.user + bComp.baseline;
      return aTotal > bTotal ? a : b;
    });
  }, [breakdown]);

  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 p-8 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-100 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-xl">
            <Lightbulb className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">Reduction Audit</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Root Cause: {highestCategory}</p>
          </div>
        </div>
        <button onClick={getPersonalizedAdvice} disabled={loading} className="p-2 hover:bg-slate-50 rounded-full transition-colors disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : <Sparkles className="w-4 h-4 text-indigo-500" />}
        </button>
      </div>

      <div className="space-y-4">
        {tips.length > 0 ? (
          tips.map((tip, idx) => (
            <div key={idx} className="group p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-emerald-200 hover:bg-emerald-50 transition-all duration-300">
              <div className="flex gap-4">
                <div className="mt-1">
                  <div className="w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:bg-emerald-500 group-hover:border-emerald-500 transition-colors">
                    <CheckCircle2 className="w-3 h-3 text-slate-300 group-hover:text-white" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800 leading-snug">{tip.action}</p>
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-600">
                    <TrendingDown className="w-3 h-3" />
                    {tip.reduction}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center space-y-4">
            <Loader2 className="w-5 h-5 animate-spin text-slate-300 mx-auto" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Synthesizing reduction vectors...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionCenter;
