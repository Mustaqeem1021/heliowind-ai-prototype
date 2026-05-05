import numpy as np
from data_generator import ASSETS

def apply_digital_twin(asset_id: str, forecast_point: dict):
    """
    Apply Digital Twin logic to a base forecast point.
    Adjusts the prediction based on physical constraints and asset degradation.
    """
    asset = ASSETS[asset_id]
    weather = forecast_point["weather"]
    base_pred = forecast_point["base_prediction_mw"]
    
    insights = []
    adjusted_pred = base_pred
    shap_values = []
    
    if asset["type"] == "solar":
        # 1. Temperature Derating
        # Solar panels lose efficiency at high temps (typically above 25C)
        temp = weather["temperature"]
        if temp > 25:
            temp_penalty = (temp - 25) * 0.004 # 0.4% loss per degree C above 25
            adjusted_pred = adjusted_pred * (1 - temp_penalty)
            if temp_penalty > 0.02 and base_pred > 10:
                insights.append(f"High temp ({temp}°C) reducing output by {round(temp_penalty*100, 1)}% due to thermal derating.")
                
        # 2. Age Degradation
        # ~0.5% degradation per year
        age_penalty = asset["age_years"] * 0.005
        adjusted_pred = adjusted_pred * (1 - age_penalty)
        if base_pred > 10:
             insights.append(f"Applied {round(age_penalty*100, 1)}% baseline efficiency drop due to {asset['age_years']} years of panel degradation.")
             
        # 3. Soiling / Dust (mock logic: higher if no rain, we just use random chance here for demo)
        if np.random.random() > 0.85 and base_pred > 10:
            soiling_loss = np.random.uniform(0.01, 0.04)
            adjusted_pred = adjusted_pred * (1 - soiling_loss)
            insights.append(f"Identified localized dust accumulation reducing yield by {round(soiling_loss*100, 1)}%.")

        # Mock SHAP Values
        cc = weather["cloud_cover"]
        shap_cc = -round((cc / 100) * 45, 1) if cc > 30 else round((30 - cc) / 30 * 15, 1)
        shap_temp = -round(temp_penalty * 100, 1) if 'temp_penalty' in locals() else round(np.random.uniform(1, 5), 1)
        shap_irrad = round((weather["irradiation"] / 1000) * 60, 1)
        
        shap_values = [
            {"feature": "Cloud Cover", "impact": shap_cc},
            {"feature": "Irradiation", "impact": shap_irrad},
            {"feature": "Temperature", "impact": shap_temp},
            {"feature": "Asset Age", "impact": -round(age_penalty*100, 1)}
        ]

    elif asset["type"] == "wind":
        # 1. Age Degradation
        age_penalty = asset["age_years"] * 0.003
        adjusted_pred = adjusted_pred * (1 - age_penalty)
        if base_pred > 10:
            insights.append(f"Twin factored in {round(age_penalty*100, 1)}% drivetrain efficiency loss due to asset age.")
            
        # 2. Wake Effect (Turbines blocking each other)
        # Mock logic: high wind speed might cause more turbulence for downstream turbines
        wind_speed = weather["wind_speed"]
        if wind_speed > 8:
            wake_loss = np.random.uniform(0.02, 0.08)
            adjusted_pred = adjusted_pred * (1 - wake_loss)
            if base_pred > 10:
                insights.append(f"High wind direction triggering {round(wake_loss*100, 1)}% loss due to wake effects between turbines.")
                
        # Mock SHAP Values
        ws = weather["wind_speed"]
        shap_ws = round((ws / 12) * 80, 1) if ws > 3 else -20.0
        shap_wake = -round(wake_loss*100, 1) if 'wake_loss' in locals() else 0.0
        
        shap_values = [
            {"feature": "Wind Speed", "impact": shap_ws},
            {"feature": "Wake Effect", "impact": shap_wake},
            {"feature": "Asset Age", "impact": -round(age_penalty*100, 1)}
        ]
                
    # Ensure no negative generation
    adjusted_pred = max(0, adjusted_pred)
    
    # Calculate Uncertainty (P10, P90) based on weather volatility
    # If cloud cover is 50%, it's highly uncertain. If 0% or 100%, more certain.
    if asset["type"] == "solar":
        cloud_factor = (50 - abs(50 - weather["cloud_cover"])) / 50 # 0 to 1, peaks at 50%
        uncertainty_margin = adjusted_pred * (0.05 + 0.15 * cloud_factor)
        p10 = max(0, adjusted_pred - uncertainty_margin)
        p90 = adjusted_pred + uncertainty_margin
    else:
        # Wind uncertainty based on wind speed volatility
        uncertainty_margin = adjusted_pred * (0.10 + 0.05 * (weather["wind_speed"] / 10))
        p10 = max(0, adjusted_pred - uncertainty_margin)
        p90 = min(asset["capacity_mw"], adjusted_pred + uncertainty_margin)

    # Clean up empty insights if pred is near 0
    if adjusted_pred < 1:
        insights = ["Generation near zero; Digital Twin physical constraints minimal."]

    if not insights:
        insights = ["Asset performing nominally as per manufacturer curve."]

    return {
        "p50_expected_mw": round(adjusted_pred, 2),
        "p10_worst_mw": round(p10, 2),
        "p90_best_mw": round(p90, 2),
        "twin_insights": insights,
        "shap_values": shap_values
    }
