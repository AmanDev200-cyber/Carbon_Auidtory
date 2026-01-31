
import React, { useState, useEffect } from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';

interface NumericInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  unit: string;
  placeholder?: string;
}

const NumericInput: React.FC<NumericInputProps> = ({ 
  label, value, onChange, min = 0, max = 99999, unit, placeholder = "0" 
}) => {
  const [inputValue, setInputValue] = useState<string>(value === 0 ? "" : value.toString());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only update internal string if the external value truly changed 
    // to avoid cursor jumping during typing
    const currentNum = parseFloat(inputValue);
    if (value !== currentNum || (value === 0 && inputValue !== "" && inputValue !== "0")) {
      setInputValue(value === 0 && inputValue === "" ? "" : value.toString());
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    if (val.trim() === "") {
      setError(null);
      onChange(0);
      return;
    }

    const numeric = parseFloat(val);
    if (isNaN(numeric)) {
      setError("Non-numeric input detected. Value must be a number.");
    } else if (numeric < min) {
      setError(`Constraint violation: Value below biological minimum of ${min} ${unit}.`);
    } else if (numeric > max) {
      setError(`Constraint violation: Value exceeds system threshold of ${max} ${unit}.`);
    } else {
      setError(null);
      // Explicit one-to-one mapping: only propagate to system state if value is within constraints
      onChange(numeric);
    }
  };

  /**
   * Manual auto-clamping on blur is removed to satisfy the requirement of 
   * "explicitly indicate the reason rather than silently adjusting".
   * The error state persists to force the user to provide a valid, applicable input.
   */
  const handleBlur = () => {
    const numeric = parseFloat(inputValue);
    if (isNaN(numeric)) {
      setError("Calculation paused: Invalid numeric data type.");
    } else if (numeric < min || numeric > max) {
      setError(`Input rejected: ${numeric} ${unit} is outside the allowed planetary range (${min}-${max}).`);
    }
  };

  return (
    <div className="space-y-1.5 group">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block transition-colors group-focus-within:text-slate-900">
          {label}
        </label>
        {error && (
          <div className="flex items-center gap-1.5 text-rose-600 animate-in fade-in slide-in-from-right-2">
            <ShieldAlert className="w-3 h-3" />
            <span className="text-[7px] font-black uppercase tracking-tighter leading-none">{error}</span>
          </div>
        )}
      </div>
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          value={inputValue}
          placeholder={placeholder}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full px-4 py-3 bg-white border rounded-xl text-xs font-black focus:ring-2 focus:outline-none transition-all placeholder:text-slate-200 ${
            error ? 'border-rose-400 ring-rose-100 ring-2' : 'border-slate-200 focus:ring-slate-950 focus:border-slate-950 shadow-sm'
          }`}
        />
        <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black pointer-events-none uppercase tracking-tighter transition-colors ${error ? 'text-rose-300' : 'text-slate-300'}`}>
          {unit}
        </span>
      </div>
      {error && (
        <p className="text-[7px] text-rose-400 font-bold uppercase tracking-widest pl-1">
          Values must map 1:1 to physical constraints.
        </p>
      )}
    </div>
  );
};

export default NumericInput;
