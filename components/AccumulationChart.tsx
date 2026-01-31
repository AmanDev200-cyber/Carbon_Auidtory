import React, { useState } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
  ReferenceArea,
  Legend,
  Line,
} from 'recharts';
import { EmissionDataPoint } from '../types';
import { GLOBAL_TARGETS } from '../constants';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

interface AccumulationChartProps {
  data: EmissionDataPoint[];
  viewScale: string;
  onHoverDay?: (day: number | null) => void;
  isSimulation?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const total = data.current;
    const userTotal = data.currentUser;
    const baselineTotal = data.currentBaseline;

    return (
      <div className="bg-slate-950/95 border border-white/10 backdrop-blur-3xl p-8 rounded-[40px] shadow-2xl min-w-[340px] ring-1 ring-white/5">
        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">{label}</span>
          <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/10">
            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] italic">Integrated Audit</span>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
             <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.15em]">Cumulative Integrated Load</div>
             <div className="text-4xl font-black text-white tracking-tighter tabular-nums leading-none">
               {total.toLocaleString()}<span className="text-xs ml-2 text-white/20 font-bold uppercase tracking-widest">kg</span>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
            <div className="space-y-1">
               <div className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Anthropogenic Delta</div>
               <div className="text-lg font-black text-white tabular-nums">{userTotal.toLocaleString()} kg</div>
            </div>
            <div className="space-y-1">
               <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">Systemic Base</div>
               <div className="text-lg font-black text-slate-500 tabular-nums">{baselineTotal.toLocaleString()} kg</div>
            </div>
          </div>
          
          <p className="text-[8px] text-white/20 uppercase font-black tracking-widest italic pt-2 border-t border-white/5">
            Integrated State = Σ(User Activity Δ + Inescapable Base) over interval.
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const AccumulationChart: React.FC<AccumulationChartProps> = ({ data, viewScale, onHoverDay, isSimulation }) => {
  const lastPoint = data[data.length - 1];
  const firstPoint = data[0];
  const slope = (lastPoint.current - firstPoint.current) / data.length;
  const isAccelerating = slope > (GLOBAL_TARGETS.PARIS_AGREEMENT_ANNUAL_MAX / 365);

  return (
    <div className="h-[540px] w-full mt-10 group/chart">
      <div className="flex justify-end gap-6 mb-10">
         <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-50 border border-slate-100 rounded-full">
            {isAccelerating ? <TrendingUp className="w-4 h-4 text-rose-500" /> : <TrendingDown className="w-4 h-4 text-emerald-500" />}
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              Momentum: {isAccelerating ? 'Breach Path' : 'Aligned Path'}
            </span>
         </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 20, right: 10, left: 0, bottom: 20 }}
          onMouseMove={(e) => {
            if (e.activePayload && onHoverDay) onHoverDay(e.activePayload[0].payload.day);
          }}
          onMouseLeave={() => onHoverDay && onHoverDay(null)}
        >
          <defs>
            <linearGradient id="grad-range" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.06}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="grad-base" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.05}/>
            </linearGradient>
            {['transport', 'energy', 'food', 'lifestyle'].map(id => (
              <linearGradient key={id} id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="currentColor" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="currentColor" stopOpacity={0.1}/>
              </linearGradient>
            ))}
          </defs>
          
          <CartesianGrid strokeDasharray="1 10" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="label" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em' }} 
            dy={20} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900, letterSpacing: '0.05em' }} 
            tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}t` : `${v}kg`} 
          />

          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ stroke: '#6366f1', strokeWidth: 1.5, strokeDasharray: '4 4' }} 
            animationDuration={300} 
            offset={30} 
          />

          <Area dataKey="maxRange" stroke="none" fill="url(#grad-range)" animationDuration={0} />
          <Area dataKey="minRange" stroke="none" fill="#fff" fillOpacity={1} animationDuration={0} />

          {/* THE INTEGRAL STACK: Base followed by Anthropogenic Deltas */}
          <Area type="monotone" dataKey="systemicBase" stackId="1" stroke="#cbd5e1" strokeWidth={1} fill="url(#grad-base)" name="Systemic Base" animationDuration={1000} />
          <Area type="monotone" dataKey="transportUser" stackId="1" stroke="#0f172a" strokeWidth={0.5} fill="url(#grad-transport)" name="User Δ: Mobility" animationDuration={1000} className="text-slate-900" />
          <Area type="monotone" dataKey="energyUser" stackId="1" stroke="#334155" strokeWidth={0.5} fill="url(#grad-energy)" name="User Δ: Energy" animationDuration={1000} className="text-slate-700" />
          <Area type="monotone" dataKey="foodUser" stackId="1" stroke="#6366f1" strokeWidth={0.5} fill="url(#grad-food)" name="User Δ: Diet" animationDuration={1000} className="text-indigo-600" />
          <Area type="monotone" dataKey="lifestyleUser" stackId="1" stroke="#94a3b8" strokeWidth={0.5} fill="url(#grad-lifestyle)" name="User Δ: Lifestyle" animationDuration={1000} className="text-slate-400" />

          {isSimulation && (
            <Line type="monotone" dataKey="simulated" stroke="#6366f1" strokeWidth={3} strokeDasharray="6 6" dot={false} name="Simulated Scenario" animationDuration={1200} />
          )}

          <Legend 
            verticalAlign="top" 
            align="right" 
            iconType="circle"
            wrapperStyle={{ paddingBottom: '50px', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em' }}
          />

          {viewScale === 'yearly' && (
            <ReferenceArea y1={0} y2={GLOBAL_TARGETS.PARIS_AGREEMENT_ANNUAL_MAX} fill="#10b981" fillOpacity={0.04} label={{ value: 'STABILITY ENVELOPE', position: 'insideTopLeft', fill: '#10b981', fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', offset: 20 }} />
          )}

          <ReferenceLine y={GLOBAL_TARGETS.PARIS_AGREEMENT_ANNUAL_MAX} stroke="#10b981" strokeWidth={1} strokeDasharray="8 8" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AccumulationChart;