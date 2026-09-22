import React, { useState } from 'react';
import { Map, Layers, Radio, Shield, Navigation, Compass, Eye, Activity, RefreshCw } from 'lucide-react';
import MapComponent from '../components/MapComponent';
import WeatherWidget from '../components/WeatherWidget';
import { simulateCapture } from '../services/api';

export default function MovementMap({ stations = [], sightings = [], tigers = [], initialTigerId = null, onSelectAnimal, onPingSuccess, weather = null }) {
  const [selectedTigerId, setSelectedTigerId] = useState(initialTigerId || 'ALL');
  const [isPinging, setIsPinging] = useState(false);
  const [pingStatus, setPingStatus] = useState(null);

  React.useEffect(() => {
    if (initialTigerId) {
      setSelectedTigerId(initialTigerId);
      const tiger = tigers.find(t => t.id === initialTigerId);
      if (tiger) {
        setPingStatus(`📍 Mapbox API Live Location Centered: ${tiger.name} (${tiger.id})`);
        setTimeout(() => setPingStatus(null), 5000);
      }
    }
  }, [initialTigerId, tigers]);

  const triggerLivePing = async () => {
    setIsPinging(true);
    setPingStatus(null);
    try {
      const res = await simulateCapture({ tiger_id: selectedTigerId !== 'ALL' ? selectedTigerId : undefined });
      setIsPinging(false);
      setPingStatus(`Live GPS Ping Received for ${res.tiger?.name || 'Tiger'} via Mapbox Telemetry!`);
      if (onPingSuccess) onPingSuccess();
      setTimeout(() => setPingStatus(null), 4000);
    } catch (err) {
      console.error(err);
      setIsPinging(false);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Title Bar & Live Tracking Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-base font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Map className="w-5 h-5 text-emerald-600" />
            TIGER LIVE LOCATION & SATELLITE MOVEMENT MAP
          </h1>
          <p className="text-xs text-slate-500">
            Live GPS radio collar telemetry signals, HD Satellite Imagery, Pench River Hydrology & Movement Trajectories.
          </p>
        </div>

        {/* Live Tiger Selector & Trigger Ping Controls */}
        <div className="flex items-center space-x-3">
          
          {/* Live Location Dropdown Selector */}
          <div className="flex items-center space-x-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
            <Navigation className="w-4 h-4 text-emerald-600 shrink-0 ml-1" />
            <span className="text-xs text-slate-500 uppercase font-bold text-[10px]">TRACK LIVE LOCATION:</span>
            <select
              value={selectedTigerId}
              onChange={e => setSelectedTigerId(e.target.value)}
              className="bg-slate-50 text-slate-700 text-xs p-1.5 rounded-lg border border-slate-200 focus:border-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="ALL">ALL LIVE TIGERS ({tigers.length})</option>
              {tigers.map(t => (
                <option key={t.id} value={t.id}>
                  📍 {t.name} ({t.gender || 'Female'}, {t.age_years || '5'} YRS)
                </option>
              ))}
            </select>

            {selectedTigerId !== 'ALL' && (
              <button
                onClick={() => {
                  const tiger = tigers.find(t => t.id === selectedTigerId);
                  if (tiger && onSelectAnimal) onSelectAnimal(tiger);
                }}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1 shadow-sm"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>INSPECT</span>
              </button>
            )}
          </div>

          {/* Trigger Live GPS Collar Ping Button */}
          <button
            onClick={triggerLivePing}
            disabled={isPinging}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${isPinging ? 'animate-spin' : ''}`} />
            <span>{isPinging ? 'Pinging GPS Collar...' : '📡 Trigger Live GPS Collar Ping'}</span>
          </button>

        </div>

      </div>

      {pingStatus && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center justify-between shadow-sm">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            {pingStatus}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Telemetry Updated Live</span>
        </div>
      )}

      {/* Weather Widget */}
      {weather && (
        <WeatherWidget weather={weather} />
      )}

      {/* Full Screen Satellite Map */}
      <div className="w-full">
        <MapComponent
          stations={stations}
          sightings={sightings}
          tigers={tigers}
          selectedTigerId={selectedTigerId === 'ALL' ? null : selectedTigerId}
          onSelectAnimal={onSelectAnimal}
          height="680px"
          showWeatherOverlay={false}
          weather={weather}
        />
      </div>

    </div>
  );
}
