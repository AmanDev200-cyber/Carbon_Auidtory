
import React from 'react';
import { EMISSION_FACTORS, CAUSALITY_PHYSICS } from '../constants';
import { Code2, BookOpen, AlertTriangle } from 'lucide-react';

const ModelAudit: React.FC = () => {
  return (
    <div className="bg-slate-900 rounded-[40px] p-12 text-white border border-white/10 space-y-12 animate-in fade-in slide-in-from-top-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-2xl">
            <Code2 className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">Scientific Model Audit</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Methodology & Source Constants</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
           <div className="flex items-center gap-3">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-black uppercase tracking-widest">Metabolic Coefficients</h3>
           </div>
           <div className="grid grid-cols-1 gap-4">
              {Object.entries(EMISSION_FACTORS).map(([key, val]) => (
                <div key={key} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-slate-400">{key}</span>
                  <span className="text-sm font-mono text-indigo-300">
                    {typeof val === 'number' ? val : 'Multiple (Map)'}
                  </span>
                </div>
              ))}
           </div>
        </div>

        <div className="space-y-8">
           <div className="flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-black uppercase tracking-widest">Model Limitations</h3>
           </div>
           <div className="space-y-4">
              <div className="p-6 bg-amber-400/5 border border-amber-400/10 rounded-3xl">
                 <p className="text-xs text-amber-200/60 leading-relaxed">
                   Confidence intervals assume a 15% standard error in behavior reporting. Radiative forcing logic follows a logarithmic simplified model for CO2 concentration increments.
                 </p>
              </div>
              <div className="p-6 bg-slate-800 rounded-3xl space-y-4">
                 <div className="text-[10px] font-black uppercase text-slate-500">Physics Constants</div>
                 {Object.entries(CAUSALITY_PHYSICS).map(([key, val]) => (
                   <div key={key} className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-400">{key}</span>
                      <span className="text-white">{val}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ModelAudit;
