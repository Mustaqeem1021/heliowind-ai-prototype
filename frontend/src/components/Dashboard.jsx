import React, { useState, useEffect } from 'react';
import { CloudRain, Sun, Wind, AlertCircle, Activity, Bell } from 'lucide-react';

const Dashboard = ({ assets, onSelectAsset }) => {
  const [alertsData, setAlertsData] = useState({ smart_alerts: [], drift_alerts: [] });

  useEffect(() => {
    fetch('http://localhost:8000/api/dashboard/alerts')
      .then(res => res.json())
      .then(data => setAlertsData(data))
      .catch(err => console.error("Error fetching alerts:", err));
  }, []);

  // Aggregation Logic (Plant -> Cluster -> State)
  const totalCapacity = assets.reduce((sum, a) => sum + a.capacity_mw, 0);

  return (
    <div>
      <div className="header">
        <h1>Karnataka State Overview</h1>
        <p>Aggregated real-time generation forecasting and Digital Twin monitoring across {assets.length} clusters.</p>
      </div>

      <div className="dashboard-grid">
        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span>State-Level Generation (Day-Ahead)</span>
            <Sun size={18} />
          </div>
          <div>
            <span className="stat-value">12.4</span>
            <span className="stat-unit">GWh</span>
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--success)' }}>
            Aggregated from {totalCapacity} MW Total Capacity
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span>Uncertainty Margin</span>
            <CloudRain size={18} />
          </div>
          <div>
            <span className="stat-value" style={{color: 'var(--warning)'}}>±12%</span>
            <span className="stat-unit">System-wide</span>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span>Active Digital Twins</span>
            <Wind size={18} />
          </div>
          <div>
            <span className="stat-value" style={{color: 'var(--success)'}}>{assets.length}</span>
            <span className="stat-unit">Assets Syncing</span>
          </div>
        </div>
      </div>

      {/* Alerts & Drift Detection Panel */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="glass-panel">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={18} color="var(--accent-solar)" /> Smart Alerts
          </h2>
          <div className="insights-list">
            {alertsData.smart_alerts.map(alert => (
              <div key={alert.id} className="insight-item" style={{ padding: '0.75rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderLeftColor: 'var(--warning)' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 500 }}>{alert.message}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)' }}>
            <Activity size={18} /> Drift Detection Monitors
          </h2>
          <div className="insights-list">
            {alertsData.drift_alerts.map(alert => (
              <div key={alert.id} className="insight-item" style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderLeftColor: 'var(--danger)' }}>
                <AlertCircle size={18} className="insight-icon" style={{ color: 'var(--danger)' }} />
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--danger)' }}>{alert.asset} (Drift: {alert.drift})</p>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>Managed Assets</h2>
        <div className="asset-list">
          {assets.map(asset => (
            <div key={asset.id} className="asset-card" onClick={() => onSelectAsset(asset)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                  width: '40px', height: '40px', borderRadius: '8px', 
                  backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center',
                  color: asset.type === 'solar' ? 'var(--accent-solar)' : 'var(--accent-wind)'
                }}>
                  {asset.type === 'solar' ? <Sun size={24} /> : <Wind size={24} />}
                </div>
                <div className="asset-info">
                  <h3>{asset.name}</h3>
                  <p>{asset.location} • {asset.capacity_mw} MW Capacity</p>
                </div>
              </div>
              <div>
                <span className={`badge ${asset.type}`}>{asset.type}</span>
              </div>
            </div>
          ))}
          {assets.length === 0 && <p style={{color: 'var(--text-muted)'}}>Loading assets...</p>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
