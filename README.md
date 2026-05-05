# HelioWind AI: Unified Solar & Wind Forecasting System

HelioWind AI is a next-generation forecasting and decision-support layer designed to predict solar and wind energy generation. Built for the KREDL/KSPDCL hackathon (Theme 10), this prototype goes beyond standard machine learning by integrating a **Digital Twin** layer to provide physically-grounded, highly explainable, and context-aware forecasts.

## 🚀 Key Features (The "Secret Weapons")

*   **Hybrid AI + Digital Twin Architecture:** Combines baseline ML pattern recognition with real-time physical corrections (e.g., thermal derating for solar panels, wake effects for wind turbines).
*   **"What-If" Scenario Simulator:** A built-in sandbox that allows grid operators to stress-test the forecast by injecting custom weather scenarios (e.g., Heavy Storm, Clear Sky) and observing instant generation drops.
*   **SHAP Explainability:** Mathematically breaks down the top factors affecting the current prediction (e.g., Cloud Cover: -40%, Base Irradiation: +60%, Asset Age: -2%), ensuring operators trust the AI.
*   **Smart Alerts & Drift Detection:** Real-time dashboard feeds that warn operators of impending generation drops and flag assets if the ML model begins to drift in accuracy over time.
*   **Probabilistic Forecasting:** Generates P10 (worst-case), P50 (expected), and P90 (best-case) confidence intervals based on weather volatility.

## 🛠️ Tech Stack

*   **Backend:** Python, FastAPI, Pandas, Numpy (Synthetic Data Engine + Digital Twin Simulation)
*   **Frontend:** React, Vite, Recharts, Lucide-React, Vanilla CSS (Premium Glassmorphism UI)

## ⚙️ How to Run Locally

### 1. Start the Backend (FastAPI)
The backend generates the synthetic weather/generation data and runs the Digital Twin simulations.

```bash
# From the root directory
python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn pydantic pandas numpy
python backend/main.py
```
*The API will run on `http://localhost:8000`*

### 2. Start the Frontend (React/Vite)
The frontend provides the interactive dashboard and What-If simulators.

```bash
# In a new terminal, from the root directory
cd frontend
npm install
npm run dev
```
*The dashboard will be available at `http://localhost:5173`*

## 🧠 Project Architecture

1.  **Data Ingestion (Mocked):** Ingests simulated historical telemetry and day-ahead weather forecasts.
2.  **Base ML Model:** Predicts raw generation capacity based strictly on weather patterns.
3.  **Digital Twin Layer:** Applies explicit degradation models (asset age, dust accumulation) and physical constraints (temperature coefficients) to refine the forecast and generate uncertainty bands.
4.  **Presentation Layer:** Surfaces the aggregated State-level data down to the individual plant level, providing full transparency, interactive simulations, and SHAP explainability.
