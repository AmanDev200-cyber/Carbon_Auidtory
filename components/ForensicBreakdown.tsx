
import React, { useMemo } from 'react';
import { CategoryBreakdown, UserInputs } from '../types';
import { ARCHETYPES, GLOBAL_TARGETS } from '../constants';
import { Fingerprint, PieChart, Activity, UserCircle } from 'lucide-react';

interface ForensicBreakdownProps {
  breakdown: CategoryBreakdown;
  inputs: UserInputs;
}

const ForensicBreakdown: React.FC<ForensicBreakdownProps> = ({ breakdown, inputs }) => {
  const annual = breakdown.total * 365;
  
  const dominantCategory = useMemo(() => {
    const entries = Object.entries(breakdown).filter(([k]) => k !== 'total' && k !== 'confidenceRange');
    return entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];
  }, [breakdown]);

  const nearestArchetype = ARCHETYPES.reduce((prev, curr) => 
    Math.abs(curr.annualCO2 - annual) < Math.abs(prev.annualCO2 - annual) ? curr : prev
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="bg-white rounded-[48px] shadow-sm border border-slate-200 p-10 lg:p-12 space-y-10">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-8">
          <div className="p-3 bg-slate-950 rounded-[20px] shadow-lg shadow-slate-200">
            <Fingerprint className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-950 uppercase tracking-[0.25em]">Behavioral Forensics</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Causal Attribution Analysis</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
               <PieChart className="w-4 h-4 text-slate-300" />
               <span className="text-[11px] font-black uppercase text-slate-500 tracking-[0.15em]">Primary Forcing Agent</span>
            </div>
            <span className="px-5 py-2 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 border border-slate-200 shadow-sm">{dominantCategory}</span>
          </div>

          <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 space-y-5 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[60px] rounded-full"></div>
             <div className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em]">Attribution Profile</div>
             <p className="text-sm text-slate-700 leading-relaxed font-medium">
               Net behavioral data identifies <span className="text-slate-950 font-black decoration-indigo-500/30 underline decoration-4 underline-offset-2">{dominantCategory}</span> as the critical forcing agent, contributing {((breakdown[dominantCategory as keyof CategoryBreakdown] as number / breakdown.total) * 100).toFixed(1)}% of total biospheric burden. 
               This loading is correlated with <span className="text-slate-950 font-black">{inputs.transportMode}</span> metabolic outputs and residential energy flux.
             </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[48px] shadow-sm border border-slate-200 p-10 lg:p-12 space-y-10">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-8">
          <div className="p-3 bg-indigo-600 rounded-[20px] shadow-lg shadow-indigo-100">
            <UserCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-950 uppercase tracking-[0.25em]">Systemic Persona</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Cross-Metabolic Benchmarking</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-end gap-5">
             <div className="text-7xl font-black tracking-tighter text-slate-950 tabular-nums leading-none">
               {Math.abs(annual - nearestArchetype.annualCO2).toLocaleString()}
             </div>
             <div className="text-[11px] font-black uppercase text-slate-400 leading-tight tracking-widest pb-1">
               kg Delta vs.<br/>{nearestArchetype.name}
             </div>
          </div>

          <div className="p-8 bg-indigo-50/40 rounded-[32px] border border-indigo-100/50 space-y-5">
             <div className="text-[11px] font-black uppercase text-indigo-400 tracking-[0.2em]">Archetype Analysis</div>
             <p className="text-[13px] text-indigo-950/80 leading-relaxed font-medium italic">
               "{nearestArchetype.description}"
             </p>
             <div className="pt-2">
                <div className="flex justify-between text-[9px] font-black uppercase text-indigo-300 tracking-[0.2em] mb-3">Persona Proximity</div>
                <div className="w-full bg-white/60 h-2 rounded-full overflow-hidden shadow-inner border border-indigo-100/50">
                   <div 
                     className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-1000" 
                     style={{ width: `${Math.min(100, (annual / nearestArchetype.annualCO2) * 100)}%` }} 
                   />
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForensicBreakdown;
