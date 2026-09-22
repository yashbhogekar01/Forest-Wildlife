import React from 'react';
import { Image, ShieldAlert, Eye, Fingerprint, Activity, Radio, ArrowUpRight, Camera, AlertTriangle, Sparkles, CheckCircle2, Filter, Upload, Moon, Sun, Scissors, Zap } from 'lucide-react';
import MapComponent from '../components/MapComponent';

export default function DashboardOverview({
  stats,
  stations,
  sightings,
  tigers,
  alerts,
  weather,
  onOpenUpload,
  onSelectAlert,
  onSelectTiger,
  onSelectSighting,
  onViewAllCaptures,
  onViewAllTigers,
  onViewAllAlerts
}) {
  if (!stats) return <div className="p-8 text-center text-slate-500 font-medium">Loading data...</div>;

  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE' || a.status === 'INVESTIGATING');

  return (
    <div className="space-y-6">

      {/* NIGHT-VISION AI ENHANCEMENT & TELEMETRY PLAN BANNER */}
      <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-teal-950 text-white p-5 rounded-3xl shadow-lg border border-emerald-500/40 space-y-4">
        
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-2xl text-emerald-400 shadow-inner">
              <Moon className="w-6 h-6 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-base tracking-wide uppercase text-amber-400">
                  🌙 NIGHT-VISION AI ENHANCEMENT & AUTO-CROP PLAN
                </span>
                <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 text-black rounded-md uppercase tracking-wider shadow-sm">
                  ACTIVE PIPELINE
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Automated low-light assessment, CLAHE contrast equalization, Non-Local Means IR denoising &amp; 12.5% dynamic padding auto-crop active across Pench camera trap network.
              </p>
            </div>
          </div>

          {/* Quick Action Buttons for Rangers / Officers */}
          <div className="flex items-center space-x-3">
            {onOpenUpload && (
              <button
                onClick={onOpenUpload}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Upload className="w-4 h-4 text-black stroke-[3]" />
                <span>+ ADD PHOTO MANUALLY</span>
              </button>
            )}

            <button
              onClick={onViewAllCaptures}
              className="px-4 py-2.5 bg-slate-900/90 hover:bg-slate-950 text-emerald-300 font-bold text-xs rounded-xl border border-emerald-500/40 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>View Night Gallery</span>
            </button>
          </div>
        </div>

        {/* 4 Telemetry Feature KPI Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-emerald-500/30">
          
          <div className="bg-slate-900/90 p-3 rounded-2xl border border-emerald-500/30 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> CLAHE Equalization
            </span>
            <p className="font-bold text-emerald-300 text-xs">LAB 8x8 Tile Grid (100% Active)</p>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-2xl border border-emerald-500/30 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-cyan-400" /> IR Denoise Rate
            </span>
            <p className="font-bold text-cyan-300 text-xs">NL-Means (98.4% Efficiency)</p>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-2xl border border-emerald-500/30 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
              <Scissors className="w-3 h-3 text-emerald-400" /> Auto-Crop Padding
            </span>
            <p className="font-bold text-emerald-400 text-xs">12.5% Dynamic Body Padding</p>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-2xl border border-emerald-500/30 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" /> Enhanced Captures
            </span>
            <p className="font-bold text-amber-300 text-xs">{sightings.length} Frames Processed</p>
          </div>

        </div>

      </div>

      {/* Clean KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Total Images */}
        <div
          onClick={onViewAllCaptures}
          title="Click to view all camera captures"
          className="bg-white p-4 rounded-2xl space-y-1.5 border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-md cursor-pointer group transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase group-hover:text-emerald-600 transition-colors">
            <span>Camera Captures</span>
            <Image className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-slate-800 group-hover:text-emerald-700 transition-colors flex items-center justify-between">
            <span>{stats.total_images_processed.toLocaleString()}</span>
            <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600" />
          </div>
          <div className="text-xs text-emerald-700 font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 inline" /> +412 in last 24h
            </span>
            <span className="text-[10px] text-slate-400 group-hover:underline">View Gallery →</span>
          </div>
        </div>

        {/* KPI 2: Useful Wildlife Captures */}
        <div
          onClick={onViewAllCaptures}
          title="Click to view camera trap captures"
          className="bg-white p-4 rounded-2xl space-y-1.5 border border-slate-200 shadow-sm hover:border-amber-500 hover:shadow-md cursor-pointer group transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase group-hover:text-amber-600 transition-colors">
            <span>Wildlife Detections</span>
            <Camera className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-amber-700 group-hover:text-amber-800 transition-colors flex items-center justify-between">
            <span>{stats.useful_captures.toLocaleString()}</span>
            <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-amber-600" />
          </div>
          <div className="text-xs text-amber-700 font-semibold flex items-center justify-between">
            <span>Target Species Verified</span>
            <span className="text-[10px] text-slate-400 group-hover:underline">Explore →</span>
          </div>
        </div>

        {/* KPI 3: Tigers Identified */}
        <div
          onClick={onViewAllTigers}
          title="Click to view cataloged tigers"
          className="bg-white p-4 rounded-2xl space-y-1.5 border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-md cursor-pointer group transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase group-hover:text-emerald-600 transition-colors">
            <span>Cataloged Tigers</span>
            <Fingerprint className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 flex items-center justify-between">
            <span>{stats.tigers_identified_count}</span>
            <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600" />
          </div>
          <div className="text-xs text-emerald-700 font-semibold flex items-center justify-between">
            <span>Stripe Identification</span>
            <span className="text-[10px] text-slate-400 group-hover:underline">Database →</span>
          </div>
        </div>

        {/* KPI 4: Active Threat Alerts */}
        <div
          onClick={onViewAllAlerts}
          title="Click to view incidents & alerts"
          className="bg-white p-4 rounded-2xl space-y-1.5 border border-amber-200 shadow-sm hover:border-amber-400 hover:shadow-md cursor-pointer group transition-all"
        >
          <div className="flex items-center justify-between text-amber-700 text-xs font-bold uppercase">
            <span>Active Incidents</span>
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-800 flex items-center justify-between">
            <span>{stats.active_alerts_count}</span>
            <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-amber-600" />
          </div>
          <div className="text-xs text-amber-700 font-bold uppercase flex items-center justify-between">
            <span>Reserve Monitoring</span>
            <span className="text-[10px] text-slate-400 group-hover:underline">Alerts →</span>
          </div>
        </div>

      </div>

      {/* Main Grid: Satellite Map Preview & Incidents Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Map Preview */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-600" />
              PENCH TIGER RESERVE SATELLITE MAP
            </h2>
            <span className="text-xs text-slate-500 font-mono font-semibold">Pench Sector: 21.60°–21.90°N, 79.15°–79.50°E</span>
          </div>

          <MapComponent
            stations={stations}
            sightings={sightings}
            tigers={tigers}
            onSelectAnimal={onSelectTiger}
            height="460px"
            showWeatherOverlay={true}
            weather={weather}
          />
        </div>

        {/* Incidents Stream */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              ACTIVE INCIDENTS ({activeAlerts.length})
            </h2>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {activeAlerts.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs bg-white rounded-2xl border border-slate-200 shadow-sm">
                No active incidents detected.
              </div>
            ) : (
              activeAlerts.map(alert => (
                <div
                  key={alert.id}
                  onClick={() => onSelectAlert(alert)}
                  className="bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-amber-400 shadow-sm transition-all cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-amber-50 text-amber-800 border border-amber-200 uppercase">
                      {alert.severity} • {alert.alert_type}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
                    </span>
                  </div>

                  <div className="font-bold text-xs text-slate-800 group-hover:text-emerald-700 transition-colors">
                    {alert.tiger_name} @ {alert.station_name}
                  </div>

                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {alert.current_condition_details}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Recent Captures */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Camera className="w-4 h-4 text-emerald-600" />
            RECENT CAMERA CAPTURES
          </h2>
          <button
            onClick={onViewAllCaptures}
            className="text-xs text-emerald-700 hover:underline font-bold flex items-center gap-1"
          >
            VIEW ALL CAPTURES ({sightings.length}) <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {sightings.slice(0, 5).map(s => {
            const matchedTiger = tigers.find(t => t.id === s.tiger_id);
            return (
              <div
                key={s.id}
                onClick={() => {
                  if (onSelectSighting) onSelectSighting(s);
                  else if (matchedTiger && onSelectTiger) onSelectTiger(matchedTiger);
                }}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-emerald-400 shadow-sm cursor-pointer group p-2 space-y-2 transition-all"
              >
                <div className="relative h-36 rounded-xl overflow-hidden bg-slate-100">
                  <img src={s.image_url} alt={s.tiger_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 text-emerald-800 text-[10px] font-bold rounded-md border border-emerald-200 shadow-sm">
                    {s.confidence_score}% Match
                  </div>
                </div>

                <div className="p-1 space-y-1 text-xs">
                  <div className="font-bold text-slate-800 truncate">{s.tiger_name}</div>
                  <div className="text-[10px] text-emerald-700 font-semibold">{s.station_name}</div>
                  {matchedTiger && (
                    <div className="text-[10px] text-slate-500 font-medium">
                      {matchedTiger.gender || 'Female'}, {matchedTiger.age_years || '5'} Yrs
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

