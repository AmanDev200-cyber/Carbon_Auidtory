export enum TransportMode {
  PetrolCar = 'Petrol Car',
  DieselCar = 'Diesel Car',
  ElectricCar = 'Electric Car',
  PublicTransit = 'Public Transit',
  Bicycle = 'Bicycle',
  Walking = 'Walking'
}

export enum DietType {
  HighMeat = 'High Meat',
  MediumMeat = 'Medium Meat',
  LowMeat = 'Low Meat',
  Vegetarian = 'Vegetarian',
  Vegan = 'Vegan'
}

export enum PolicyScenario {
  Baseline = 'Baseline (Current)',
  CarbonTax = 'Carbon Tax (+25%)',
  GreenIncentive = 'Green Incentives (-15%)',
  AggressiveTransition = 'Aggressive Transition (-30%)'
}

export interface UserInputs {
  enabledCategories: {
    transport: boolean;
    energy: boolean;
    food: boolean;
    lifestyle: boolean;
  };
  transportDist: number;
  transportMode: TransportMode;
  electricityKwh: number;
  acHours: number;
  dietType: DietType;
  foodWasteKg: number;
  waterLiters: number;
  wasteKg: number;
  digitalHours: number;
}

export interface CategoryComponent {
  user: number;
  baseline: number;
}

export interface CategoryBreakdown {
  transport: CategoryComponent;
  energy: CategoryComponent;
  food: CategoryComponent;
  lifestyle: CategoryComponent;
  totalUser: number;
  totalBaseline: number;
  total: number;
  confidenceRange: [number, number]; // [min, max]
}

export interface EmissionDataPoint {
  day: number;
  label: string;
  current: number;
  currentBaseline: number;
  currentUser: number;
  simulated?: number;
  minRange: number;
  maxRange: number;
  [key: string]: any;
}

export interface TrajectoryData {
  momentum: 'Accelerating' | 'Decelerating' | 'Stable';
  annualProjected: number;
  breachDate?: string;
}

export interface Archetype {
  id: string;
  name: string;
  annualCO2: number;
  description: string;
}