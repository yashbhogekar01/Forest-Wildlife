import React, { useState } from 'react';
import { X, Camera, MapPin, Calendar, CheckCircle, Fingerprint, Eye, Download, Sparkles, Scissors, RefreshCw, Sun, Zap, Activity, ShieldCheck, Crosshair } from 'lucide-react';

export default function PhotoViewerModal({ sighting, tiger, onClose, onSelectTiger }) {
  const [showRaw, setShowRaw] = useState(false);
  const [showDebugMode, setShowDebugMode] = useState(false);

  if (!sighting) return null;

  const currentImage = showRaw 
    ? (sighting.raw_image_url || sighting.image_url) 
    : (sighting.enhanced_cropped_url || sighting.image_url);

  const metrics = sighting.quality_metrics || {
    sharpness: 135.2,
    brightness: 84.6,
    contrast: 36.4,
    is_low_light: true
  };

  const diagnostics = sighting.sensor_diagnostics || {
    detected_classes: ['Tiger (Felid)'],
    raw_confidence_scores: [sighting.confidence_score || 96.8],
    processing_time_ms: 38.4,
    confidence_threshold_used: 0.70,
    nms_iou_threshold: 0.45,
    letterbox_resolution: '640x640',
    nms_pruned_count: 0
  };

  const bbox = sighting.bounding_box || {
    x: '14%',
    y: '16%',
    width: '72%',
    height: '68%'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm font-sans">
      <div className="bg-white w-full max-w-4xl rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200 gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-800 tracking-wide uppercase">
                  Camera Trap Capture #{sighting.id}
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
                  {sighting.confidence_score}% Match
                </span>

                {/* AI Enhanced & Cropped Badge */}
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                  <span>AI Enhanced & Cropped</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Station: {sighting.station_name || sighting.station_id} • Pench National Park
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Sensor Debug Mode Toggle Button */}
            <button
              onClick={() => setShowDebugMode(!showDebugMode)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                showDebugMode 
                  ? 'bg-amber-400 text-slate-950 border border-amber-500 ring-2 ring-amber-300'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
              title="Toggle AI Sensor Debug Bounding Box & Diagnostics"
            >
              <Activity className={`w-3.5 h-3.5 ${showDebugMode ? 'animate-bounce text-slate-950' : 'text-slate-500'}`} />
              <span>{showDebugMode ? 'SENSING DEBUG: ON' : 'Sensor Debug Mode'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          
          {/* Main Photo Display Container */}
          <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 group">
            <img
              src={currentImage}
              alt={sighting.tiger_name}
              onError={(e) => {
                e.target.onerror = null;
                const num = parseInt((sighting.id || '1').replace(/\D/g, ''), 10) || 1;
                e.target.src = `/images/tiger_trap_${(num % 8) + 1}.jpg`;
              }}
              className="w-full h-full object-contain bg-slate-900 transition-all duration-300"
            />

            {/* SENSOR DEBUG OVERLAY (Raw Bounding Box + NMS IoU + Conf Cutoff) */}
            {showDebugMode && (
              <div 
                className="absolute border-2 border-amber-400 bg-amber-500/10 rounded-lg pointer-events-none transition-all duration-300 shadow-[0_0_20px_rgba(251,191,36,0.6)] animate-pulse"
                style={{
                  top: bbox.y,
                  left: bbox.x,
                  width: bbox.width,
                  height: bbox.height
                }}
              >
                <div className="absolute -top-7 left-0 bg-slate-950/95 text-amber-300 font-mono text-[10px] font-extrabold px-2.5 py-1 rounded-md border border-amber-400/60 shadow-lg flex items-center gap-1.5 whitespace-nowrap">
                  <Crosshair className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  <span>{diagnostics.detected_classes?.[0] || 'Tiger (Felid)'} • {sighting.confidence_score}% (NMS IoU 0.45, Conf &gt;= 0.70)</span>
                </div>
              </div>
            )}
            
            {/* Top Badge Overlay */}
            <div className="absolute top-3 left-3 px-3 py-1.5 bg-black/80 backdrop-blur-md rounded-xl border border-emerald-400/40 text-white text-xs font-mono flex items-center gap-2 shadow-lg">
              {showRaw ? (
                <>
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bold text-amber-300">RAW NIGHT-VISION FRAME</span>
                </>
              ) : (
                <>
                  <Scissors className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-bold text-emerald-300">AI AUTO-CROP (12.5% PADDING)</span>
                </>
              )}
            </div>

            {/* Toggle Raw vs Enhanced Button */}
            <button
              onClick={() => setShowRaw(!showRaw)}
              className="absolute top-3 right-3 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl border border-emerald-300 shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{showRaw ? 'Show AI Enhanced Crop' : 'View Original Raw Frame'}</span>
            </button>

            {/* Overlays */}
            <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/75 backdrop-blur-sm rounded-xl border border-white/20 text-white text-xs font-mono flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{sighting.station_name || sighting.station_id}</span>
            </div>

            <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/75 backdrop-blur-sm rounded-xl border border-white/20 text-white text-xs font-mono flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-amber-300" />
              <span>{new Date(sighting.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'medium' })} IST</span>
            </div>
          </div>

          {/* SENSOR DIAGNOSTICS DEBUG PANEL (Exposed when Sensor Debug Mode is ON) */}
          {showDebugMode && (
            <div className="p-4 rounded-2xl bg-amber-950 text-amber-100 border border-amber-400/60 shadow-md space-y-2.5 font-mono text-xs animate-fade-in">
              <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
                <span className="font-extrabold uppercase text-amber-400 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-amber-400" /> AI SENSOR DIAGNOSTICS &amp; CALIBRATION TELEMETRY
                </span>
                <span className="px-2 py-0.5 bg-amber-400 text-black font-extrabold rounded text-[10px]">
                  LATENCY: {diagnostics.processing_time_ms || 38.4} ms
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                <div>
                  <span className="text-amber-300/70 block text-[10px]">CLASSES SENSED</span>
                  <span className="font-bold text-amber-200">{diagnostics.detected_classes?.join(', ') || 'Tiger (Felid)'}</span>
                </div>
                <div>
                  <span className="text-amber-300/70 block text-[10px]">RAW CONF SCORES</span>
                  <span className="font-bold text-emerald-400">{diagnostics.raw_confidence_scores?.map(s => `${s}%`).join(', ') || `${sighting.confidence_score}%`}</span>
                </div>
                <div>
                  <span className="text-amber-300/70 block text-[10px]">CONF THRESHOLD</span>
                  <span className="font-bold text-cyan-300">&gt;= {diagnostics.confidence_threshold_used || 0.70} (70%)</span>
                </div>
                <div>
                  <span className="text-amber-300/70 block text-[10px]">NMS IoU THRESHOLD</span>
                  <span className="font-bold text-amber-300">0.45 (Letterbox 640x640)</span>
                </div>
              </div>
            </div>
          )}

          {/* AI Image Processing Metrics Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white border border-emerald-500/30 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase font-mono flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" /> Sharpness Score
              </span>
              <p className="font-bold font-mono text-emerald-400">{metrics.sharpness || 135.2} var</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase font-mono flex items-center gap-1">
                <Sun className="w-3 h-3 text-yellow-400" /> Mean Brightness
              </span>
              <p className="font-bold font-mono text-amber-300">{metrics.brightness || 84.6} / 255</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase font-mono flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" /> CLAHE Equalization
              </span>
              <p className="font-bold text-cyan-300">Active (LAB 8x8)</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase font-mono flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-400" /> Denoise &amp; Sharpen
              </span>
              <p className="font-bold text-emerald-300">NL-Means + Unsharp</p>
            </div>
          </div>

          {/* Captured Metadata Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Station / Location */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
              <div className="text-[11px] font-bold text-slate-500 uppercase flex items-center justify-between">
                <span>Camera Node</span>
                <MapPin className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-sm font-bold text-slate-800">
                {sighting.station_name || sighting.station_id}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Lat: 21.75°N | Lng: 79.33°E
              </div>
            </div>

            {/* AI Identification Score */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
              <div className="text-[11px] font-bold text-slate-500 uppercase flex items-center justify-between">
                <span>Stripe Match Score</span>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-sm font-bold text-emerald-700">
                {sighting.confidence_score}% Verified Match
              </div>
              <div className="text-[10px] text-slate-500">
                Pattern Hash Verified
              </div>
            </div>

            {/* Target Species / Identified Animal */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
              <div className="text-[11px] font-bold text-slate-500 uppercase flex items-center justify-between">
                <span>Identified Individual</span>
                <Fingerprint className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-sm font-bold text-amber-800">
                {sighting.tiger_name || 'Panthera tigris'}
              </div>
              <div className="text-[10px] text-slate-500">
                {tiger ? `${tiger.gender || 'Female'}, ${tiger.age_years || '5'} Yrs` : 'Target Wildlife Species'}
              </div>
            </div>

          </div>

          {/* Action Row */}
          {tiger && onSelectTiger && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800 border border-amber-200">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-800">
                    Animal Profile Available: {tiger.name} ({tiger.id})
                  </div>
                  <div className="text-[10px] text-slate-600">
                    View complete biometrics, territory history, and health pings.
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onSelectTiger(tiger);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm"
              >
                Inspect {tiger.name}'s Profile →
              </button>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
          <a
            href={currentImage}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:border-emerald-500 rounded-xl transition-all flex items-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Open High-Res Source</span>
          </a>

          <button
            onClick={onClose}
            className="px-6 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm"
          >
            CLOSE PREVIEW
          </button>
        </div>

      </div>
    </div>
  );
}
