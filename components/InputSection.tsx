import React from 'react';
import { UserInputs, TransportMode, DietType } from '../types';
import { Car, Zap, Utensils, ShoppingBag, Plus, X } from 'lucide-react';
import NumericInput from './NumericInput';

interface InputSectionProps {
  inputs: UserInputs;
  onChange: <K extends keyof UserInputs>(key: K, value: UserInputs[K]) => void;
  onToggle: (category: keyof UserInputs['enabledCategories']) => void;
  title?: string;
}

const InputSection: React.FC<InputSectionProps> = ({ inputs, onChange, onToggle, title = "Daily Habits" }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-[10px] font-black text-slate-950 uppercase tracking-[0.25em] flex items-center gap-2">
        <span className="w-1 h-3 bg-slate-950 rounded-full"></span>
        {title}
      </h2>
      
      {/* Travel */}
      <div className={`p-5 rounded-[20px] border transition-all ${inputs.enabledCategories.transport ? 'bg-slate-50 border-slate-300 shadow-sm' : 'bg-white border-dashed border-slate-200 opacity-60'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-slate-800 font-black text-[9px] uppercase tracking-widest">
            <Car className={`w-3.5 h-3.5 ${inputs.enabledCategories.transport ? 'text-slate-950' : 'text-slate-300'}`} />
            Travel
          </div>
          <button 
            onClick={() => onToggle('transport')}
            className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${inputs.enabledCategories.transport ? 'bg-slate-950 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
          >
            {inputs.enabledCategories.transport ? 'Active' : 'Add'}
          </button>
        </div>
        {inputs.enabledCategories.transport && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200/60 mt-2 animate-in fade-in slide-in-from-top-1">
            <NumericInput 
              label="KM Today"
              value={inputs.transportDist}
              unit="KM"
              max={1500}
              onChange={(val) => onChange('transportDist', val)}
            />
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Type</label>
              <select
                value={inputs.transportMode}
                onChange={(e) => onChange('transportMode', e.target.value as TransportMode)}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer focus:ring-2 focus:ring-slate-950 appearance-none transition-all shadow-sm"
              >
                {Object.values(TransportMode).map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Energy */}
      <div className={`p-5 rounded-[20px] border transition-all ${inputs.enabledCategories.energy ? 'bg-slate-50 border-slate-300 shadow-sm' : 'bg-white border-dashed border-slate-200 opacity-60'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-slate-800 font-black text-[9px] uppercase tracking-widest">
            <Zap className={`w-3.5 h-3.5 ${inputs.enabledCategories.energy ? 'text-slate-950' : 'text-slate-300'}`} />
            Energy
          </div>
          <button 
            onClick={() => onToggle('energy')}
            className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${inputs.enabledCategories.energy ? 'bg-slate-950 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
          >
            {inputs.enabledCategories.energy ? 'Active' : 'Add'}
          </button>
        </div>
        {inputs.enabledCategories.energy && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200/60 mt-2 animate-in fade-in slide-in-from-top-1">
            <NumericInput 
              label="Power"
              value={inputs.electricityKwh}
              unit="KWH"
              max={400}
              onChange={(val) => onChange('electricityKwh', val)}
            />
            <NumericInput 
              label="A/C Hours"
              value={inputs.acHours}
              unit="H/D"
              max={24}
              onChange={(val) => onChange('acHours', val)}
            />
          </div>
        )}
      </div>

      {/* Food */}
      <div className={`p-5 rounded-[20px] border transition-all ${inputs.enabledCategories.food ? 'bg-slate-50 border-slate-300 shadow-sm' : 'bg-white border-dashed border-slate-200 opacity-60'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-slate-800 font-black text-[9px] uppercase tracking-widest">
            <Utensils className={`w-3.5 h-3.5 ${inputs.enabledCategories.food ? 'text-slate-950' : 'text-slate-300'}`} />
            Diet
          </div>
          <button 
            onClick={() => onToggle('food')}
            className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${inputs.enabledCategories.food ? 'bg-slate-950 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
          >
            {inputs.enabledCategories.food ? 'Active' : 'Add'}
          </button>
        </div>
        {inputs.enabledCategories.food && (
          <div className="space-y-4 pt-4 border-t border-slate-200/60 mt-2 animate-in fade-in slide-in-from-top-1">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Diet Choice</label>
              <select
                value={inputs.dietType}
                onChange={(e) => onChange('dietType', e.target.value as DietType)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-slate-950 appearance-none shadow-sm"
              >
                {Object.values(DietType).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <NumericInput 
              label="Food Waste"
              value={inputs.foodWasteKg}
              unit="KG"
              max={50}
              onChange={(val) => onChange('foodWasteKg', val)}
            />
          </div>
        )}
      </div>

      {/* Lifestyle */}
      <div className={`p-5 rounded-[20px] border transition-all ${inputs.enabledCategories.lifestyle ? 'bg-slate-50 border-slate-300 shadow-sm' : 'bg-white border-dashed border-slate-200 opacity-60'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-slate-800 font-black text-[9px] uppercase tracking-widest">
            <ShoppingBag className={`w-3.5 h-3.5 ${inputs.enabledCategories.lifestyle ? 'text-slate-950' : 'text-slate-300'}`} />
            Lifestyle
          </div>
          <button 
            onClick={() => onToggle('lifestyle')}
            className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${inputs.enabledCategories.lifestyle ? 'bg-slate-950 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
          >
            {inputs.enabledCategories.lifestyle ? 'Active' : 'Add'}
          </button>
        </div>
        {inputs.enabledCategories.lifestyle && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200/60 mt-2 animate-in fade-in slide-in-from-top-1">
            <NumericInput 
              label="Water Usage"
              value={inputs.waterLiters}
              unit="L"
              max={3000}
              onChange={(val) => onChange('waterLiters', val)}
            />
            <NumericInput 
              label="Waste"
              value={inputs.wasteKg}
              unit="KG"
              max={100}
              onChange={(val) => onChange('wasteKg', val)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default InputSection;