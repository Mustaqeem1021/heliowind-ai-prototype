from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import datetime
import random
from data_generator import ASSETS, generate_forecast_series, generate_base_forecast
from digital_twin import apply_digital_twin

app = FastAPI(title="HelioWind AI Prototype API")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/assets")
def get_assets():
    """Return all configured assets."""
    return {"assets": list(ASSETS.values())}

@app.get("/api/dashboard/alerts")
def get_dashboard_alerts():
    """Return mock Smart Alerts and Drift Detection warnings."""
    return {
        "smart_alerts": [
            {"id": 1, "type": "warning", "message": "Solar drop expected at 14:00 due to 85% cloud cover over Pavagada.", "time": "2 hours ago"},
            {"id": 2, "type": "success", "message": "Wind spike expected in North cluster (Chitradurga) tonight at 21:00.", "time": "1 hour ago"}
        ],
        "drift_alerts": [
            {"id": 1, "asset": "Chitradurga Wind Cluster", "drift": "4.2%", "message": "Warning: Model accuracy drift detected over last 7 days. Recalibration recommended.", "severity": "high"}
        ]
    }

@app.get("/api/forecast/{asset_id}")
def get_forecast(asset_id: str):
    """
    Get the day-ahead forecast for a specific asset,
    including Digital Twin adjustments and uncertainty.
    """
    if asset_id not in ASSETS:
        raise HTTPException(status_code=404, detail="Asset not found")
        
    # Generate 24 hours starting from 6 AM today (for consistent demo data)
    now = datetime.datetime.now()
    start_time = now.replace(hour=6, minute=0, second=0, microsecond=0)
    
    base_series = generate_forecast_series(asset_id, start_time, hours=24)
    
    final_series = []
    daily_insights = []
    
    for point in base_series:
        twin_data = apply_digital_twin(asset_id, point)
        
        # Collect unique insights for the day (skip defaults)
        for insight in twin_data["twin_insights"]:
            if "nominally" not in insight and "zero" not in insight and insight not in daily_insights:
                daily_insights.append(insight)
                
        final_series.append({
            "timestamp": point["timestamp"],
            "hour": point["hour"],
            "weather": point["weather"],
            "base_prediction_mw": point["base_prediction_mw"],
            "p50_expected_mw": twin_data["p50_expected_mw"],
            "p10_worst_mw": twin_data["p10_worst_mw"],
            "p90_best_mw": twin_data["p90_best_mw"],
            "shap_values": twin_data.get("shap_values", [])
        })
        
    # Ensure we have at least one insight
    if not daily_insights:
        daily_insights.append("Asset operating at standard modeled efficiency. No significant anomalies detected.")

    return {
        "asset": ASSETS[asset_id],
        "forecast": final_series,
        "daily_insights": daily_insights[:4] # Return max 4 top insights
    }

class SimulationRequest(BaseModel):
    cloud_cover: float
    temperature: float
    wind_speed: float
    irradiation: float

@app.post("/api/simulate/{asset_id}")
def simulate_what_if(asset_id: str, req: SimulationRequest):
    """
    Run a what-if simulation with custom weather parameters for the current hour.
    Returns the new base prediction, new twin prediction, and insights.
    """
    if asset_id not in ASSETS:
        raise HTTPException(status_code=404, detail="Asset not found")
        
    asset = ASSETS[asset_id]
    custom_weather = {
        "cloud_cover": req.cloud_cover,
        "temperature": req.temperature,
        "wind_speed": req.wind_speed,
        "irradiation": req.irradiation
    }
    
    # Calculate new base
    base_pred = generate_base_forecast(asset, custom_weather)
    
    # Calculate new twin
    mock_point = {
        "weather": custom_weather,
        "base_prediction_mw": base_pred
    }
    twin_data = apply_digital_twin(asset_id, mock_point)
    
    return {
        "weather": custom_weather,
        "base_prediction_mw": base_pred,
        "simulated_expected_mw": twin_data["p50_expected_mw"],
        "insights": twin_data["twin_insights"],
        "shap_values": twin_data["shap_values"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
