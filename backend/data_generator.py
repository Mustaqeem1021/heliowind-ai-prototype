import random
import datetime
import math
import numpy as np

# Asset configurations
ASSETS = {
    "pavagada_1": {
        "id": "pavagada_1",
        "name": "Pavagada Solar Block A",
        "type": "solar",
        "location": "Tumkur, Karnataka",
        "capacity_mw": 500,
        "age_years": 4,
        "base_efficiency": 0.18
    },
    "chitradurga_1": {
        "id": "chitradurga_1",
        "name": "Chitradurga Wind Cluster",
        "type": "wind",
        "location": "Chitradurga, Karnataka",
        "capacity_mw": 300,
        "age_years": 8,
        "base_efficiency": 0.35
    }
}

def generate_weather(hour: int, asset_type: str, time_offset_hours: int = 0):
    """Generate realistic synthetic weather based on hour of day."""
    # Add some noise based on time offset to simulate changing conditions
    noise = np.random.normal(0, 0.1)
    
    if asset_type == "solar":
        # Sunlight curve (roughly 6 AM to 6 PM)
        if 6 <= hour <= 18:
            # Peak around noon (hour 12)
            solar_intensity = math.sin((hour - 6) / 12 * math.pi)
            irradiation = max(0, solar_intensity * 1000 + np.random.normal(0, 50)) # W/m2
            cloud_cover = max(0, min(100, 20 + np.random.normal(0, 15) + (time_offset_hours * 2))) # %
            temp = 25 + solar_intensity * 10 + np.random.normal(0, 2) # C
        else:
            irradiation = 0
            cloud_cover = 50 + np.random.normal(0, 20)
            temp = 20 + np.random.normal(0, 2)
            
        return {
            "irradiation": round(irradiation, 2),
            "cloud_cover": round(cloud_cover, 2),
            "temperature": round(temp, 2),
            "wind_speed": round(abs(np.random.normal(3, 1)), 2)
        }
    elif asset_type == "wind":
        # Wind speeds often peak in late afternoon/evening
        base_wind = 6 + math.sin((hour - 12) / 24 * math.pi) * 3
        wind_speed = max(0, base_wind + np.random.normal(0, 1.5) + (time_offset_hours * 0.1)) # m/s
        return {
            "irradiation": 0,
            "cloud_cover": round(abs(np.random.normal(40, 20)), 2),
            "temperature": round(22 + np.random.normal(0, 3), 2),
            "wind_speed": round(wind_speed, 2)
        }
    return {}

def generate_base_forecast(asset, weather):
    """Mock the pure AI model forecast (without Digital Twin adjustments)."""
    if asset["type"] == "solar":
        # Simple physical model + noise
        efficiency = asset["base_efficiency"]
        # Capacity * (Irradiation / 1000) * (1 - cloud_cover * 0.005)
        raw_power = asset["capacity_mw"] * (weather["irradiation"] / 1000) * efficiency / 0.18
        # Clouds block sun
        cloud_factor = max(0, 1 - (weather["cloud_cover"] / 100))
        power = raw_power * (0.4 + 0.6 * cloud_factor)
        power = max(0, power + np.random.normal(0, power * 0.05))
        return round(power, 2)
        
    elif asset["type"] == "wind":
        # Power curve mock
        ws = weather["wind_speed"]
        if ws < 3: power = 0 # cut-in
        elif ws > 25: power = 0 # cut-out
        elif ws >= 12: power = asset["capacity_mw"] # rated
        else:
            # Cubic relationship between cut-in and rated
            power = asset["capacity_mw"] * ((ws - 3) / (12 - 3)) ** 3
            
        power = max(0, power + np.random.normal(0, power * 0.05))
        return round(min(power, asset["capacity_mw"]), 2)

def generate_forecast_series(asset_id: str, start_time: datetime.datetime, hours: int = 24):
    """Generate a full time series of forecasts."""
    asset = ASSETS[asset_id]
    data = []
    
    for i in range(hours):
        current_time = start_time + datetime.timedelta(hours=i)
        weather = generate_weather(current_time.hour, asset["type"], time_offset_hours=i)
        base_pred = generate_base_forecast(asset, weather)
        
        data.append({
            "timestamp": current_time.isoformat(),
            "hour": current_time.hour,
            "weather": weather,
            "base_prediction_mw": base_pred
        })
        
    return data
