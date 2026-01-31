import React, { useState, useMemo } from 'react';
import { UserInputs, TransportMode, DietType, CategoryBreakdown, EmissionDataPoint, PolicyScenario, CategoryComponent } from './types';
import { EMISSION_FACTORS, GLOBAL_TARGETS, POLICY_MODIFIERS, ARCHETYPES, METABOLIC_BASELINES } from './constants';
import InputSection from './components/InputSection';
import AccumulationChart from './components/AccumulationChart';
import EquivalentsSection from './components/EquivalentsSection';
import ActionCenter from './components/ActionCenter';
import EarthVisualizer from './components/EarthVisualizer';
import ChatAssistant from './components/ChatAssistant';
import ForensicBreakdown from './components/ForensicBreakdown';
import ModelAudit from './components/ModelAudit';
import TemporalImpactTracker from './components/TemporalImpactTracker';
import {
  History, TrendingDown, LayoutGrid, Target,
  BarChart, Globe, CheckCircle2, FlaskConical, Info, ShieldAlert
} from 'lucide-react';

const INITIAL_INPUTS: UserInputs = {
  enabledCategories: { transport: false, energy: false, food: false, lifestyle: false },
  transportDist: 0,
  transportMode: TransportMode.Walking,
  electricityKwh: 0,
  acHours: 0,
  dietType: DietType.Vegan,
  foodWasteKg: 0,
  waterLiters: 0,
  wasteKg: 0,
  digitalHours: 0
};

const calculateBreakdown = (inputs: UserInputs, policy: PolicyScenario): CategoryBreakdown => {
  const { enabledCategories } = inputs;
  const modifier = POLICY_MODIFIERS[policy];

  const getComp = (enabled: boolean, userVal: number, baselineVal: number): CategoryComponent => ({
    user: enabled ? Number((userVal * modifier).toFixed(6)) : 0,
    baseline: Number((baselineVal * modifier).toFixed(6))
  });

  const transport = getComp(
    enabledCategories.transport,
    inputs.transportDist * EMISSION_FACTORS.TRANSPORT[inputs.transportMode],
    METABOLIC_BASELINES.TRANSPORT
  );

  const energy = getComp(
    enabledCategories.energy,
    (inputs.electricityKwh * EMISSION_FACTORS.ELECTRICITY_KWH) + (inputs.acHours * EMISSION_FACTORS.AC_HOUR),
    METABOLIC_BASELINES.ENERGY
  );

  const food = getComp(
    enabledCategories.food,
    EMISSION_FACTORS.DIET[inputs.dietType] + (inputs.foodWasteKg * EMISSION_FACTORS.FOOD_WASTE_KG),
    METABOLIC_BASELINES.FOOD
  );

  const lifestyle = getComp(
    enabledCategories.lifestyle,
    (inputs.waterLiters * EMISSION_FACTORS.WATER_LITER) + (inputs.wasteKg * EMISSION_FACTORS.WASTE_KG) + (inputs.digitalHours * EMISSION_FACTORS.DIGITAL_HOUR),
    METABOLIC_BASELINES.LIFESTYLE
  );

  const totalUser = transport.user + energy.user + food.user + lifestyle.user;
  const totalBaseline = transport.baseline + energy.baseline + food.baseline + lifestyle.baseline;
  const total = totalUser + totalBaseline;

  const confidenceRange: [number, number] = [total * 0.85, total * 1.15];

  return {
    transport, energy, food, lifestyle,
    totalUser: Number(totalUser.toFixed(6)),
    totalBaseline: Number(totalBaseline.toFixed(6)),
    total: Number(total.toFixed(6)),
    confidenceRange
  };
};

const App: React.FC = () => {
  const [currentInputs, setCurrentInputs] = useState<UserInputs>(INITIAL_INPUTS);
  const [simulatedInputs, setSimulatedInputs] = useState<UserInputs>(INITIAL_INPUTS);
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [policy, setPolicy] = useState<PolicyScenario>(PolicyScenario.Baseline);
  const [viewScale, setViewScale] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'decade'>('yearly');
  const [reportGenerated, setReportGenerated] = useState(false);
  const [scrubbedDay, setScrubbedDay] = useState<number | null>(null);
  const [auditMode, setAuditMode] = useState(false);

  const currentBreakdown = useMemo(() => calculateBreakdown(currentInputs, policy), [currentInputs, policy]);
  const simulatedBreakdown = useMemo(() => calculateBreakdown(simulatedInputs, policy), [simulatedInputs, policy]);

  const chartData = useMemo((): EmissionDataPoint[] => {
    let steps: { day: number; label: string }[] = [];
    if (viewScale === 'daily') steps = Array.from({ length: 7 }, (_, i) => ({ day: i + 1, label: `Day ${i + 1}` }));
    else if (viewScale === 'weekly') steps = Array.from({ length: 5 }, (_, i) => ({ day: (i + 1) * 7, label: `Week ${i + 1}` }));
    else if (viewScale === 'monthly') steps = Array.from({ length: 12 }, (_, i) => ({ day: (i + 1) * 30, label: `Month ${i + 1}` }));
    else if (viewScale === 'yearly') steps = [{ day: 1, label: 'Day 1' }, { day: 30, label: '1 Month' }, { day: 180, label: '6 Months' }, { day: 365, label: '1 Year' }];
    else steps = [{ day: 365, label: 'Year 1' }, { day: 365 * 3, label: 'Year 3' }, { day: 365 * 5, label: 'Year 5' }, { day: 365 * 10, label: 'Year 10' }];

    return steps.map(tf => {
      const days = tf.day;
      // Numerical integration: Σ(Daily Rate) = Rate * Days (for static snapshot habits)
      return {
        day: days,
        label: tf.label,
        current: Number((currentBreakdown.total * days).toFixed(2)),
        currentBaseline: Number((currentBreakdown.totalBaseline * days).toFixed(2)),
        currentUser: Number((currentBreakdown.totalUser * days).toFixed(2)),
        simulated: isSimulationMode ? Number((simulatedBreakdown.total * days).toFixed(2)) : undefined,
        minRange: Number((currentBreakdown.confidenceRange[0] * days).toFixed(2)),
        maxRange: Number((currentBreakdown.confidenceRange[1] * days).toFixed(2)),
        // Plotted layers: Systemic Base + Anthropogenic User Deltas
        systemicBase: Number((currentBreakdown.totalBaseline * days).toFixed(4)),
        transportUser: Number((currentBreakdown.transport.user * days).toFixed(4)),
        energyUser: Number((currentBreakdown.energy.user * days).toFixed(4)),
        foodUser: Number((currentBreakdown.food.user * days).toFixed(4)),
        lifestyleUser: Number((currentBreakdown.lifestyle.user * days).toFixed(4)),
      };
    });
  }, [currentBreakdown, simulatedBreakdown, viewScale, isSimulationMode]);

  const annualTotal = currentBreakdown.total * 365;
  const annualUserTotal = currentBreakdown.totalUser * 365;
  const annualBaselineTotal = currentBreakdown.totalBaseline * 365;

  const displayTotal = scrubbedDay ? currentBreakdown.total * scrubbedDay : annualTotal;
  const displayUser = scrubbedDay ? currentBreakdown.totalUser * scrubbedDay : annualUserTotal;
  const displayBaseline = scrubbedDay ? currentBreakdown.totalBaseline * scrubbedDay : annualBaselineTotal;

  const handleInputChange = <K extends keyof UserInputs>(key: K, val: UserInputs[K]) => {
    if (isSimulationMode) setSimulatedInputs(p => ({ ...p, [key]: val }));
    else setCurrentInputs(p => ({ ...p, [key]: val }));
  };

  const handleToggleCategory = (category: keyof UserInputs['enabledCategories']) => {
    if (isSimulationMode) setSimulatedInputs(p => ({ ...p, enabledCategories: { ...p.enabledCategories, [category]: !p.enabledCategories[category] } }));
    else setCurrentInputs(p => ({ ...p, enabledCategories: { ...p.enabledCategories, [category]: !p.enabledCategories[category] } }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 antialiased">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-950 flex items-center justify-center rounded-xl shadow-lg shrink-0">
              <FlaskConical className="text-white w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-[14px] font-black uppercase tracking-[0.2em] text-slate-950 leading-none mb-1">Carbon Auditor</h1>
              <p className="text-[10px] text-slate-500 font-medium tracking-tight max-w-2xl leading-relaxed">
                Direct, numerical integration of user activity over global infrastructure baselines.
              </p>
            </div>
          </div>
          <div className="flex gap-3 items-center self-end md:self-auto">
            <button onClick={() => setAuditMode(!auditMode)} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
              <Info className="w-3 h-3" />
              {auditMode ? 'Audit Exit' : 'Scientific Audit'}
            </button>
            <div className="px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">
              Real-time Feedback
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden sticky top-28">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-3.5 h-3.5 text-slate-400" />
                <h2 className="font-black uppercase text-[10px] tracking-widest text-slate-600">Audit Variables</h2>
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setIsSimulationMode(false)}
                  className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${!isSimulationMode ? 'bg-slate-950 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                >Your Data</button>
                <button
                  onClick={() => setIsSimulationMode(true)}
                  className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${isSimulationMode ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                >Test Scenario</button>
              </div>
            </div>
            <div className="p-6 space-y-8">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest block">System Policy</label>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tight">Adjust government transition modifiers.</p>
                </div>
                <select
                  value={policy}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPolicy(e.target.value as PolicyScenario)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer focus:ring-2 focus:ring-slate-950 appearance-none shadow-sm transition-all"
                >
                  {Object.values(PolicyScenario).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <InputSection
                inputs={isSimulationMode ? simulatedInputs : currentInputs}
                onChange={handleInputChange}
                onToggle={handleToggleCategory}
                title={isSimulationMode ? "Behavioral Simulation" : "Daily Activity Log"}
              />

              <button
                onClick={() => setReportGenerated(true)}
                className="w-full py-5 bg-slate-950 text-white rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl"
              >
                {reportGenerated ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <BarChart className="w-3.5 h-3.5" />}
                Analyze Impact
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-10">
          {auditMode && <ModelAudit />}

          {!reportGenerated ? (
            <div className="h-full min-h-[500px] bg-white rounded-[40px] border border-slate-200 p-12 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-[24px] flex items-center justify-center mb-8 border border-slate-100 animate-bounce">
                <Globe className="w-8 h-8 text-slate-200" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight mb-4 text-slate-900">Atmospheric Data Pending</h3>
              <p className="text-slate-400 max-w-xs font-medium leading-relaxed text-[11px] uppercase tracking-widest">
                Input your daily habits to generate a forensic analysis of your planetary integration.
              </p>
            </div>
          ) : (
            <div className="animate-in fade-in zoom-in-95 duration-700 space-y-12 pb-24">
              {annualUserTotal === 0 && (
                <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[32px] flex items-start gap-5 shadow-sm">
                  <ShieldAlert className="w-6 h-6 text-indigo-500 shrink-0 mt-1" />
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-widest text-indigo-950">Systemic Baseline Identified</h4>
                    <p className="text-[11px] text-indigo-700 leading-relaxed font-medium uppercase tracking-tight">
                      Your reported behavioral emissions are zero. The remaining <span className="font-black">{annualBaselineTotal.toLocaleString()} kg</span> load is attributed to the <span className="font-black">Inescapable Metabolic Overhead</span> of existing within current global infrastructure (shared grid, public logistics, and food systems).
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: "Stability Goal", val: "2,500", icon: Target, sub: "Sustainability Max" },
                  { label: "Infrastructure Base", val: displayBaseline.toLocaleString(), icon: History, sub: "Inescapable kg Load" },
                  { label: "Your Addition", val: displayUser.toLocaleString(), icon: TrendingDown, highlight: true, sub: "Personal kg CO₂e Flux" }
                ].map((stat, i) => (
                  <div key={i} className={`bg-white p-8 rounded-[32px] border border-slate-200 transition-all ${stat.highlight ? 'ring-2 ring-indigo-500 shadow-xl shadow-indigo-100' : 'shadow-sm hover:border-slate-300'}`}>
                    <div className="flex items-center gap-2 text-slate-400 mb-5 text-[9px] font-black uppercase tracking-widest">
                      <stat.icon className="w-3.5 h-3.5" /> {stat.label}
                    </div>
                    <div className="text-4xl font-black tracking-tighter text-slate-900 tabular-nums leading-none mb-2">{stat.val}</div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.sub}</div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 p-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black uppercase tracking-tight text-slate-950">Integration Trajectory</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Forensic accumulation: Activity vs Infrastructure</p>
                  </div>
                  <div className="flex bg-slate-50 p-1.5 rounded-xl border border-slate-100 shadow-inner">
                    {(['daily', 'weekly', 'monthly', 'yearly', 'decade'] as const).map(scale => (
                      <button
                        key={scale}
                        onClick={() => setViewScale(scale)}
                        className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${viewScale === scale ? 'bg-white text-slate-950 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        {scale}
                      </button>
                    ))}
                  </div>
                </div>
                <AccumulationChart data={chartData} viewScale={viewScale} onHoverDay={setScrubbedDay} isSimulation={isSimulationMode} />
              </div>

              <TemporalImpactTracker breakdown={isSimulationMode ? simulatedBreakdown : currentBreakdown} viewScale={viewScale} />

              <EarthVisualizer annualCO2={currentBreakdown.total * 365} showCausality={true} />

              <ForensicBreakdown breakdown={currentBreakdown} inputs={currentInputs} />
              <EquivalentsSection annualCO2={displayTotal} />
              <ActionCenter breakdown={currentBreakdown} inputs={currentInputs} />
            </div>
          )}
        </div>
      </main>
      <ChatAssistant />
    </div>
  );
};

export default App;