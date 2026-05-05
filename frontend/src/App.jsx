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
        <div className="logo">
          <Zap size={28} color="#f59e0b" />
          <span>HelioWind AI</span>
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

        <div style={{ flex: 1 }}></div>

        <div className="nav-item">
          <Activity size={20} />
          Twin Status
        </div>
        <div className="nav-item">
          <Settings size={20} />
          Settings
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {activeTab === 'dashboard' ? (
          <Dashboard assets={assets} onSelectAsset={navigateToAsset} />
        ) : (
          selectedAsset && <AssetView asset={selectedAsset} />
        )}
      </div>
    </div>
  );
}

export default App;
