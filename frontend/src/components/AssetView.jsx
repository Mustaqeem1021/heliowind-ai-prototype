import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ComposedChart, Legend, BarChart, Bar, Cell } from 'recharts';
import { Cpu, AlertTriangle, Cloud, Thermometer, Wind, SlidersHorizontal, Info, PlayCircle } from 'lucide-react';
import ExplainerCarousel from './ExplainerCarousel';

const AssetView = ({ asset }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // What-If Simulation State
  const [simParams, setSimParams] = useState({
    cloud_cover: 50,
    temperature: 25,
    wind_speed: 5,
    irradiation: 800
  });
  const [simResult, setSimResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:8000/api/forecast/${asset.id}`)
      .then(res => res.json())
      .then(json => {
        const formattedData = json.forecast.map(point => {
          return {
            time: `${point.hour}:00`,
            expected: point.p50_expected_mw,
            range: [point.p10_worst_mw, point.p90_best_mw],
            base: point.base_prediction_mw,
            weather: point.weather,
            shap_values: point.shap_values
          };
        });
        
        setData({
          forecast: formattedData,
          insights: json.daily_insights
        });
        
        // Initialize sim params based on current first hour
        if(formattedData.length > 0) {
           setSimParams({
               cloud_cover: formattedData[0].weather.cloud_cover || 0,
               temperature: formattedData[0].weather.temperature || 25,
               wind_speed: formattedData[0].weather.wind_speed || 5,
               irradiation: formattedData[0].weather.irradiation || 0
           });
        }
        
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching forecast:", err);
        setLoading(false);
      });
  }, [asset]);

  const runSimulation = (paramsOverride = null) => {
    setSimulating(true);
    const paramsToUse = paramsOverride || simParams;
    if(paramsOverride) setSimParams(paramsOverride);
    
    fetch(`http://localhost:8000/api/simulate/${asset.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paramsToUse)
    })
    .then(res => res.json())
    .then(res => {
        setSimResult(res);
        setSimulating(false);
    });
  };

  if (loading || !data) {
    return <div className="loading">Simulating Digital Twin...</div>;
  }

  const color = asset.type === 'solar' ? 'var(--accent-solar)' : 'var(--accent-wind)';
  const areaColor = asset.type === 'solar' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(6, 182, 212, 0.2)';

  // Current SHAP values to show (either from simulation or first hour of forecast)
  const currentShap = simResult ? simResult.shap_values : (data.forecast[0]?.shap_values || []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const weather = payload[0].payload.weather;
      return (
        <div className="glass-panel" style={{ padding: '1rem', border: '1px solid var(--panel-border)' }}>
          <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Time: {label}</p>
          <p style={{ color: color, fontWeight: 700 }}>Expected: {payload[0].payload.expected} MW</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Range: {payload[0].payload.range[0]} - {payload[0].payload.range[1]} MW</p>
          
          <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '0.5rem', marginTop: '0.5rem', display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Thermometer size={14} /> {weather?.temperature || 0}°C
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
               {asset.type === 'solar' ? <Cloud size={14} /> : <Wind size={14} />} 
               {asset.type === 'solar' ? `${weather?.cloud_cover || 0}%` : `${weather?.wind_speed || 0} m/s`}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div className="header">
        <h1>{asset.name}</h1>
        <p>{asset.location} • {asset.capacity_mw} MW • {asset.type.toUpperCase()}</p>
      </div>
      
      <div className="dashboard-grid">
         <div className="glass-panel" style={{ gridColumn: '1 / 2', backgroundColor: 'rgba(59, 130, 246, 0.05)', borderLeft: '4px solid var(--accent-blue)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--accent-blue)', marginBottom: '0.5rem' }}>
               <Info size={18} /> Architecture Notice: Hybrid ML + Digital Twin
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
               <strong>Base ML Model</strong> learns historical weather-to-generation patterns. <br/>
               <strong>Digital Twin Layer</strong> explicitly corrects predictions based on real-time physical constraints (e.g., thermal derating, wake effects) ensuring the forecast is physically grounded and explainable.
            </p>
         </div>

         {/* Cinematic Explainer Video Mock */}
         <div className="glass-panel" style={{ gridColumn: '2 / -1', padding: 0, overflow: 'hidden', position: 'relative', minHeight: '300px', display: 'flex', border: '1px solid var(--panel-border)' }}>
            <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10, display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.6)', padding: '0.5rem 1rem', borderRadius: '2rem', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
               <PlayCircle size={16} color="#ccff00" />
               <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', letterSpacing: '0.5px' }}>Concept Animation</span>
            </div>
            
            <div style={{ flex: 1, width: '100%', height: '100%' }}>
               <ExplainerCarousel />
            </div>
         </div>
      </div>

      <div className="dashboard-grid">
        <div className="glass-panel" style={{ gridColumn: '1 / -1' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Day-Ahead Forecast (Digital Twin Adjusted)
          </h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.forecast} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} />
                <YAxis stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area type="monotone" dataKey="range" name="Uncertainty Range (P10 - P90)" fill={areaColor} stroke="none" />
                <Line type="monotone" dataKey="expected" name="Expected Generation (P50)" stroke={color} strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="base" name="Base AI Prediction (No Twin)" stroke="var(--text-muted)" strokeWidth={1} strokeDasharray="5 5" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Explainability & What-If Sandbox */}
        <div className="glass-panel" style={{ gridColumn: '1 / 2' }}>
           <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <SlidersHorizontal size={20} color="var(--accent-solar)" />
              "What-If" Scenario Simulator
           </h2>
           <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
             Stress-test the Digital Twin by injecting custom weather scenarios.
           </p>

           <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {asset.type === 'solar' ? (
                  <>
                    <button className="badge" style={{ cursor: 'pointer' }} onClick={() => runSimulation({...simParams, cloud_cover: 0, irradiation: 900})}>Clear Sky</button>
                    <button className="badge" style={{ cursor: 'pointer' }} onClick={() => runSimulation({...simParams, cloud_cover: 95, irradiation: 100})}>Heavy Storm</button>
                  </>
              ) : (
                  <>
                    <button className="badge" style={{ cursor: 'pointer' }} onClick={() => runSimulation({...simParams, wind_speed: 14})}>High Wind (Optimal)</button>
                    <button className="badge" style={{ cursor: 'pointer' }} onClick={() => runSimulation({...simParams, wind_speed: 2})}>Low Wind (Cut-off)</button>
                  </>
              )}
           </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                 <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    <span>Cloud Cover (%)</span> <span>{simParams.cloud_cover}%</span>
                 </label>
                 <input type="range" min="0" max="100" value={simParams.cloud_cover} onChange={(e) => setSimParams({...simParams, cloud_cover: Number(e.target.value)})} style={{ width: '100%' }} />
              </div>
              <div>
                 <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    <span>Wind Speed (m/s)</span> <span>{simParams.wind_speed} m/s</span>
                 </label>
                 <input type="range" min="0" max="30" value={simParams.wind_speed} onChange={(e) => setSimParams({...simParams, wind_speed: Number(e.target.value)})} style={{ width: '100%' }} />
              </div>
           </div>
           
           <button 
             onClick={() => runSimulation()}
             style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'var(--accent-blue)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}
           >
              {simulating ? "Simulating..." : "Run Simulation"}
           </button>

           {simResult && (
               <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
                   <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Simulated Expected Generation:</p>
                   <p style={{ fontSize: '1.5rem', fontWeight: 700, color: color }}>{simResult.simulated_expected_mw} MW</p>
                   {simResult.insights.map((insight, idx) => (
                       <p key={idx} style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: 'var(--warning)' }}>⚠️ {insight}</p>
                   ))}
               </div>
           )}
        </div>

        <div className="glass-panel" style={{ gridColumn: '2 / -1' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Cpu size={20} color="var(--accent-blue)" />
            SHAP Explainability (Top Factors)
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Real-time feature importance driving the current prediction.
          </p>
          
          <div style={{ height: '250px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentShap} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.05)"/>
                <XAxis type="number" stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} />
                <YAxis dataKey="feature" type="category" stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)', fontSize: 12}} width={100} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: 'var(--bg-dark)', borderColor: 'var(--panel-border)' }} />
                <Bar dataKey="impact" barSize={20}>
                  {currentShap.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.impact > 0 ? 'var(--success)' : 'var(--danger)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--panel-border)' }}>
             <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
               <em>Positive values (Green) increase generation. Negative values (Red) decrease generation.</em>
             </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AssetView;
