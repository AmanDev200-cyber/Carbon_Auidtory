# Carbon Accumulator

**Carbon Auditor** is a sophisticated React-based application designed to perform forensic analysis of your personal carbon footprint. It bridges the gap between individual activity and global infrastructure baselines, providing a direct, numerical integration of user habits over time.

## 🚀 Features

*   **Detailed Activity Logging**: Input daily habits across categories:
    *   **Transport**: Distance and mode (Walking to Private Jet).
    *   **Energy**: Electricity usage and AC hours.
    *   **Food**: Diet type and waste tracking.
    *   **Lifestyle**: Water, waste, and digital consumption.
*   **Scientific Audit Mode**: Toggles technical details and forensic breakdowns.
*   **Simulation Scenarios**: Compare "Your Data" vs "Test Scenarios" to see potential impact shifts.
*   **Policy Modifiers**: Adjust for different government transition scenarios (Baseline, Net Zero 2050, Accelerated).
*   **Visualizations**:
    *   **Accumulation Chart**: View impact over Daily, Weekly, Monthly, Yearly, and Decadal scales.
    *   **Earth Visualizer**: 3D representation of atmospheric impact.
    *   **Temporal Impact Tracker**: Analysis of long-term reduction targets.
*   **AI Assistant**: Integrated Chat Assistant (powered by Google GenAI) for real-time insights.

## 🛠️ Technology Stack

*   **Frontend**: React (v19), TypeScript, Vite
*   **Styling**: Tailwind CSS
*   **Visualization**: Recharts, Three.js
*   **Icons**: Lucide-React
*   **AI**: Google GenAI SDK

## 📦 Getting Started

### Prerequisites
*   Node.js (v18+ recommended)
*   npm or yarn

### Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the App

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## 📂 Project Structure

*   `src/components/` - UI components (Charts, Input forms, Visualizers).
*   `src/App.tsx` - Main application logic and state management.
*   `src/constants.ts` - Emission factors and baseline data.
*   `src/types.ts` - TypeScript definitions.

---
*Generated for the Carbon Accumulator project.*
