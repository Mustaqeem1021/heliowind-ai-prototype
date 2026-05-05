import React, { useState, useEffect } from 'react';
import { Sun, Wind, LayoutDashboard, Activity, Settings, Zap } from 'lucide-react';
import Dashboard from './components/Dashboard';
import AssetView from './components/AssetView';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/assets')
      .then(res => res.json())
      .then(data => {
        setAssets(data.assets);
      })
      .catch(err => console.error("Error fetching assets:", err));
  }, []);

  const navigateToAsset = (asset) => {
    setSelectedAsset(asset);
    setActiveTab('asset');
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo" style={{ gap: '0.5rem' }}>
          <div style={{ backgroundColor: '#ccff00', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(204, 255, 0, 0.4)' }}>
             <Zap size={16} color="#000" fill="#000" strokeWidth={1} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', letterSpacing: '-1.5px', fontSize: '1.75rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <span style={{ fontWeight: 800, color: '#ffffff' }}>helio</span>
            <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>wind</span>
            <span style={{ color: '#ccff00', fontWeight: 800 }}>.</span>
          </div>
        </div>

        <div 
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => { setActiveTab('dashboard'); setSelectedAsset(null); }}
        >
          <LayoutDashboard size={20} />
          Overview
        </div>

        <div style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, paddingLeft: '1rem' }}>
          Assets
        </div>

        {assets.map(asset => (
          <div 
            key={asset.id}
            className={`nav-item ${activeTab === 'asset' && selectedAsset?.id === asset.id ? 'active' : ''}`}
            onClick={() => navigateToAsset(asset)}
          >
            {asset.type === 'solar' ? <Sun size={20} /> : <Wind size={20} />}
            {asset.name}
          </div>
        ))}

        <div className="nav-item" style={{ flex: 1 }}></div>

        <div 
          className={`nav-item ${activeTab === 'twin-status' ? 'active' : ''}`}
          onClick={() => { setActiveTab('twin-status'); setSelectedAsset(null); }}
        >
          <Activity size={20} />
          Twin Status
        </div>
        <div 
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => { setActiveTab('settings'); setSelectedAsset(null); }}
        >
          <Settings size={20} />
          Settings
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {activeTab === 'dashboard' && <Dashboard assets={assets} onSelectAsset={navigateToAsset} />}
        {activeTab === 'asset' && selectedAsset && <AssetView asset={selectedAsset} />}
        {activeTab === 'twin-status' && (
          <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
             <Activity size={48} color="var(--accent-blue)" style={{ marginBottom: '1rem' }} />
             <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Global Twin Synchronization</h2>
             <p style={{ color: 'var(--text-muted)' }}>All {assets.length} assets are currently streaming and synced with their physical counterparts.</p>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
             <Settings size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
             <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Platform Settings</h2>
             <p style={{ color: 'var(--text-muted)' }}>Configuration panel coming in version 3.0.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
