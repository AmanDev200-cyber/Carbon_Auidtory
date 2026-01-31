
import React from 'react';
import { EQUIVALENT_FACTORS } from '../constants';
import { TreeDeciduous, Car, Zap, Waves, Flame, Tablet, ThermometerSun } from 'lucide-react';

interface EquivalentsSectionProps {
  annualCO2: number;
}

const EquivalentsSection: React.FC<EquivalentsSectionProps> = ({ annualCO2 }) => {
  const treeCount = Math.ceil(annualCO2 / EQUIVALENT_FACTORS.TREE_YEAR);
  const smartphoneCharges = Math.floor(annualCO2 / EQUIVALENT_FACTORS.SMARTPHONE_CHARGE);
  const drivingKm = Math.floor(annualCO2 / EQUIVALENT_FACTORS.CAR_KM);
  const lpgCylinders = (annualCO2 / EQUIVALENT_FACTORS.LPG_CYLINDER).toFixed(1);
  const oceanAbsorption = (annualCO2 * EQUIVALENT_FACTORS.OCEAN_ABSORPTION_RATE).toFixed(1);
  const saturationIndex = (annualCO2 * EQUIVALENT_FACTORS.BIOSPHERE_SATURATION_COEFFICIENT * 1000000).toFixed(4);

  const stats = [
    {
      label: "Sequestration Demand",
      value: treeCount,
      unit: "Mature Trees",
      sub: "Net-zero parity threshold.",
      icon: TreeDeciduous,
      color: "text-emerald-700 bg-emerald-50 border-emerald-100 shadow-emerald-100/50"
    },
    {
      label: "Systemic Load",
      value: saturationIndex,
      unit: "Saturation Index",
      sub: "Net concentration flux per M-kg.",
      icon: ThermometerSun,
      color: "text-rose-700 bg-rose-50 border-rose-100 shadow-rose-100/50"
    },
    {
      label: "Energy Conversion",
      value: smartphoneCharges.toLocaleString(),
      unit: "Full Charges",
      sub: "Massive scale device flux.",
      icon: Tablet,
      color: "text-indigo-700 bg-indigo-50 border-indigo-100 shadow-indigo-100/50"
    },
    {
      label: "Ocean Accretion",
      value: oceanAbsorption,
      unit: "kg Dissolved",
      sub: "Carbon sink absorption mass.",
      icon: Waves,
      color: "text-cyan-700 bg-cyan-50 border-cyan-100 shadow-cyan-100/50"
    },
    {
      label: "Mobility Delta",
      value: drivingKm.toLocaleString(),
      unit: "KM Equivalent",
      sub: "Standard petrol sedan distance.",
      icon: Car,
      color: "text-blue-700 bg-blue-50 border-blue-100 shadow-blue-100/50"
    },
    {
      label: "Thermal Fuel",
      value: lpgCylinders,
      unit: "LPG Cycles",
      sub: "Equivalent cooking gas load.",
      icon: Flame,
      color: "text-orange-700 bg-orange-50 border-orange-100 shadow-orange-100/50"
    }
  ];

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between border-b border-slate-200/60 pb-6">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Systemic Equivalents Ledger</h3>
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.25em]">Cross-Domain Physical Translation</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className={`p-8 rounded-[32px] border flex flex-col justify-between group hover:shadow-xl hover:-translate-y-2 transition-all duration-500 ${stat.color} shadow-sm bg-white`}>
             <div className="flex justify-between items-start mb-8">
                <div className="p-3 bg-white/80 rounded-2xl shadow-sm border border-black/5">
                  <stat.icon className="w-5 h-5 opacity-80" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30 group-hover:opacity-60 transition-opacity">Forensic Metric</span>
             </div>
             <div>
                <div className="text-4xl font-black tracking-tighter mb-1 tabular-nums leading-none">{stat.value}</div>
                <div className="text-[11px] font-black uppercase tracking-widest mb-3 opacity-80">{stat.unit}</div>
                <div className="h-[1px] w-12 bg-black/10 mb-4 group-hover:w-full transition-all duration-700"></div>
                <p className="text-[11px] opacity-60 leading-relaxed font-bold uppercase tracking-widest">{stat.sub}</p>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EquivalentsSection;
