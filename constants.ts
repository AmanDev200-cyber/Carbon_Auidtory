import { TransportMode, DietType, Archetype } from './types';

export const EMISSION_FACTORS = {
  TRANSPORT: {
    [TransportMode.PetrolCar]: 0.17,
    [TransportMode.DieselCar]: 0.171,
    [TransportMode.ElectricCar]: 0.047,
    [TransportMode.PublicTransit]: 0.082,
    [TransportMode.Bicycle]: 0,
    [TransportMode.Walking]: 0
  },
  ELECTRICITY_KWH: 0.475,
  AC_HOUR: 1.2,
  DIET: {
    [DietType.HighMeat]: 7.2,
    [DietType.MediumMeat]: 5.6,
    [DietType.LowMeat]: 4.6,
    [DietType.Vegetarian]: 3.8,
    [DietType.Vegan]: 2.9
  },
  FOOD_WASTE_KG: 1.9,
  WATER_LITER: 0.0003,
  WASTE_KG: 0.5,
  DIGITAL_HOUR: 0.04
};

// Systemic baselines used when user-specific data is unavailable (inescapable metabolic load)
export const METABOLIC_BASELINES = {
  TRANSPORT: 1.2, // Generic infrastructure/commute baseline
  ENERGY: 3.5,    // Standby/Background grid load
  FOOD: 4.2,      // Average baseline diet caloric impact
  LIFESTYLE: 0.8  // Ambient waste/digital footprint
};

export const EQUIVALENT_FACTORS = {
  TREE_YEAR: 21,
  CAR_KM: 0.17,
  SMARTPHONE_CHARGE: 0.008,
  LPG_CYLINDER: 43.5,
  OCEAN_ABSORPTION_RATE: 0.25,
  BIOSPHERE_SATURATION_COEFFICIENT: 0.000000014,
};

export const GLOBAL_TARGETS = {
  PARIS_AGREEMENT_ANNUAL_MAX: 2500,
  WORLD_AVERAGE_ANNUAL: 4700,
  HIGH_INTENSITY_THRESHOLD: 15000
};

export const ARCHETYPES: Archetype[] = [
  { id: 'climate-aligned', name: 'Aligned Persona', annualCO2: 2100, description: 'Meets 2030 sustainability benchmarks.' },
  { id: 'urban-professional', name: 'Urban Professional', annualCO2: 8500, description: 'High travel and digital energy profile.' },
  { id: 'global-average', name: 'Global Average', annualCO2: 4700, description: 'Baseline human metabolic impact.' },
];

export const POLICY_MODIFIERS = {
  'Baseline (Current)': 1.0,
  'Carbon Tax (+25%)': 1.25,
  'Green Incentives (-15%)': 0.85,
  'Aggressive Transition (-30%)': 0.70
};

export const CAUSALITY_PHYSICS = {
  PPM_PER_GT_CO2: 0.128,
  RADIATIVE_FORCING_COEFFICIENT: 5.35,
  THERMAL_INERTIA_DELAY_YEARS: 15,
};