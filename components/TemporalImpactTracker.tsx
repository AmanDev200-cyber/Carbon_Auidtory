import React from 'react';
import { CategoryBreakdown } from '../types';
import { CAUSALITY_PHYSICS, GLOBAL_TARGETS } from '../constants';
import { Clock, Layers, Thermometer, Box, ShieldCheck, Plus, Globe } from 'lucide-react';

interface TemporalImpactTrackerProps {
  breakdown: CategoryBreakdown;
  viewScale: string;
}

const TemporalImpactTracker: React.FC<TemporalImpactTrackerProps> = ({ breakdown, viewScale }) => {
  const dailyMass = breakdown.total;
  const userMass = breakdown.totalUser;
  const baselineMass = breakdown.totalBaseline;

  // Daily incremental marginal consequences
  const dailyPpmShift = (dailyMass / 1e12) * CAUSALITY_PHYSICS.PPM_PER_GT_CO2;
  const dailyHeatForce = CAUSALITY_PHYSICS.RADIATIVE_FORCING_COEFFICIENT * Math.log((420 + dailyPpmShift) / 420);
  const dailyStabilityImpact = (dailyMass / (GLOBAL_TARGETS.PARIS_AGREEMENT_ANNUAL_MAX / 365)) * 100;

  const metrics = [
    {
      label: "Marginal Flux",
      value: userMass.toFixed(2),
      unit: "kg CO₂e / Day",
      desc: "Mass added directly via behavioral activity logs.",
      icon: Box,
      color: "text-indigo-950 bg-indigo-50/50 border-indigo-200 shadow-indigo-100"
    },
    {
      label: "Systemic Base",
      value: baselineMass.toFixed(2),
      unit: "kg CO₂e / Day",
      desc: "Inescapable load of living within modern infrastructure.",
      icon: Globe,
      color: "text-slate-700 bg-slate-50 border-slate-200 shadow-slate-100"
    },
    {
      label: "Thermal Load",
      value: (dailyHeatForce * 1000).toFixed(4),
      unit: "mW Energy / Day",
      desc: "Total marginal heat-trapping energy (User + Base).",
      icon: Thermometer,
      color: "text-rose-700 bg-rose-50 border-rose-100 shadow-rose-100"
    }
  ];

  return (
    <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden group/tracker transition-all hover:border-slate-300">
      <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-950 rounded-2xl shadow-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-[10px] font-black text-slate-950 uppercase tracking-[0.2em] leading-none mb-1">Impact Disaggregation</h3>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic">Personal flux vs Inescapable baseline</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-200 rounded-xl shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Stability Quota: {dailyStabilityImpact.toFixed(1)}%</span>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {metrics.map((m, i) => (
            <div key={i} className={`p-6 rounded-[28px] border transition-all hover:shadow-md group/metric ${m.color}`}>
              <div className="flex justify-between items-start mb-6">
                <m.icon className="w-5 h-5 opacity-30 group-hover/metric:opacity-100 transition-opacity" />
                <Plus className="w-3 h-3 opacity-20" />
              </div>
              <div className="space-y-2">
                <div className="text-[9px] font-black uppercase tracking-widest opacity-40">{m.label}</div>
                <div className="text-4xl font-black tracking-tighter tabular-nums leading-none">
                  {m.value}
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest opacity-60">{m.unit}</div>
                <p className="pt-4 text-[9px] font-medium leading-relaxed opacity-50 border-t border-black/5 mt-4">
                  {m.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-8 bg-slate-950 rounded-[32px] text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 blur-[80px] rounded-full -mr-20 -mt-20"></div>
          <div className="flex flex-col lg:flex-row justify-between gap-8 relative z-10">
            <div className="space-y-4 max-w-lg">
              <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-400">Total Integrated System Forecast</h4>
              <p className="text-sm font-medium leading-relaxed text-slate-300">
                Current behavior integrates <span className="text-indigo-400 font-black">{(userMass * 365).toLocaleString()}kg</span> added flux on top of an
                unavoidable <span className="text-slate-400 font-black">{(baselineMass * 365).toLocaleString()}kg</span> infrastructure baseline.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-24 lg:border-l lg:border-white/10 lg:pl-16">
              <div className="space-y-1">
                <div className="text-[8px] font-black uppercase tracking-widest text-white/30">Total 1Y</div>
                <div className="text-2xl font-black tabular-nums">{(dailyMass * 365).toLocaleString()} <span className="text-[9px] opacity-30">kg</span></div>
              </div>
              <div className="space-y-1">
                <div className="text-[8px] font-black uppercase tracking-widest text-white/30">Total 10Y</div>
                <div className="text-2xl font-black tabular-nums">{(dailyMass * 3650 / 1000).toLocaleString()} <span className="text-[9px] opacity-30">T</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemporalImpactTracker;