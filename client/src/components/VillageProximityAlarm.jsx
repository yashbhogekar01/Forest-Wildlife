import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, AlertOctagon, Power, Play, X } from 'lucide-react';
import { sirenPlayer } from '../utils/audioAlert';

export default function VillageProximityAlarm({ alerts = [], onSelectAlert }) {
  // Filter alerts specifically for tigers near village areas with active status
  const villageAlerts = alerts.filter(a => 
    (a.status === 'ACTIVE' || a.status === 'INVESTIGATING') && 
    (a.alert_type === 'PROXIMITY_VILLAGE' || a.severity === 'CRITICAL' || (a.station_name && a.station_name.toLowerCase().includes('village')))
  );

  // Master Buzzer ON/OFF Option State (saved in localStorage)
  const [isBuzzerEnabled, setIsBuzzerEnabled] = useState(() => {
    const saved = localStorage.getItem('village_buzzer_master_enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [isMuted, setIsMuted] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const activeAlert = villageAlerts[0];

  // Listen for sync event from Header or other controls
  useEffect(() => {
    const handleSync = () => {
      const saved = localStorage.getItem('village_buzzer_master_enabled');
      if (saved !== null) {
        setIsBuzzerEnabled(JSON.parse(saved));
      }
    };
    window.addEventListener('buzzer_switch_changed', handleSync);
    return () => window.removeEventListener('buzzer_switch_changed', handleSync);
  }, []);

  // Toggle Master Buzzer ON / OFF switch
  const handleToggleBuzzerMaster = () => {
    const nextState = !isBuzzerEnabled;
    setIsBuzzerEnabled(nextState);
    localStorage.setItem('village_buzzer_master_enabled', JSON.stringify(nextState));
    window.dispatchEvent(new Event('buzzer_switch_changed'));
    if (!nextState) {
      sirenPlayer.stopLoop();
    }
  };

  // Sound execution logic:
  // Buzzer ONLY turns ON if a tiger is detected near village AND Master Buzzer Switch is ON AND sound is not muted/dismissed
  useEffect(() => {
    if (activeAlert && !isDismissed && !isMuted && isBuzzerEnabled) {
      sirenPlayer.startLoop();
    } else {
      sirenPlayer.stopLoop();
    }

    return () => {
      sirenPlayer.stopLoop();
    };
  }, [activeAlert, isDismissed, isMuted, isBuzzerEnabled]);

  // If no tiger is near the village area, keep alarm silent and return null
  if (!activeAlert || isDismissed) {
    return null;
  }

  const handleToggleMute = () => {
    const mutedState = sirenPlayer.toggleMute();
    setIsMuted(mutedState);
  };

  const handleTestBuzzerSound = () => {
    if (isBuzzerEnabled) {
      sirenPlayer.playBuzzerPulse();
    } else {
      alert("The Buzzer is currently turned OFF. Please click 'BUZZER OFF' to switch it ON first.");
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-600 via-red-600 to-amber-700 text-white px-4 py-3 shadow-lg relative animate-fade-in font-sans z-30 border-b border-red-500">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Warning Indicator & Details */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-xl shadow-sm animate-pulse">
            <AlertOctagon className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-red-950/80 text-red-200 font-extrabold uppercase text-[9px] tracking-wider border border-red-400">
                🚨 TIGER NEAR VILLAGE DETECTED
              </span>
              <span className="font-bold text-white text-xs">
                {activeAlert.tiger_name || 'Subject Tiger'} detected near {activeAlert.station_name || 'Village Perimeter'}!
              </span>
            </div>
            <p className="text-[11px] text-amber-100 mt-0.5 font-medium">
              {activeAlert.current_condition_details || 'High priority: Tiger observed near village border. Dispatch ranger team immediately.'}
            </p>
          </div>
        </div>

        {/* Action Controls & Special ON/OFF Buzzer Option */}
        <div className="flex items-center space-x-2.5">
          
          {/* SPECIAL OPTION: Master Buzzer ON/OFF Switch */}
          <div className="flex items-center bg-black/30 backdrop-blur-md p-1 rounded-xl border border-white/20">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 text-amber-200 hidden sm:inline">
              Buzzer System:
            </span>
            <button
              onClick={handleToggleBuzzerMaster}
              className={`px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                isBuzzerEnabled
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600 ring-2 ring-emerald-300'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
              title="Special Option: Turn Master Buzzer Alarm System ON or OFF"
            >
              <Power className={`w-3.5 h-3.5 ${isBuzzerEnabled ? 'text-white animate-pulse' : 'text-slate-400'}`} />
              <span>{isBuzzerEnabled ? 'BUZZER ON' : 'BUZZER OFF'}</span>
            </button>
          </div>

          {/* Mute / Unmute Button (when Buzzer is ON) */}
          {isBuzzerEnabled && (
            <button
              onClick={handleToggleMute}
              className={`px-2.5 py-1 rounded-xl font-bold text-xs flex items-center gap-1 transition-all shadow-sm ${
                isMuted
                  ? 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                  : 'bg-amber-400 text-amber-950 font-extrabold hover:bg-amber-300 animate-bounce'
              }`}
              title="Silence current alert sound"
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>SILENCED</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>🔊 ALARM SOUNDING</span>
                </>
              )}
            </button>
          )}

          {/* Test Sound Button */}
          <button
            onClick={handleTestBuzzerSound}
            className="px-2.5 py-1 rounded-xl font-medium text-xs bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors hidden lg:flex items-center gap-1"
            title="Test Industrial Warning Sound"
          >
            <Play className="w-3 h-3 text-amber-300" />
            <span>Test Sound</span>
          </button>

          {/* View Details / Ranger Dispatch */}
          <button
            onClick={() => onSelectAlert && onSelectAlert(activeAlert)}
            className="px-3 py-1 rounded-xl font-bold text-xs bg-white text-red-700 hover:bg-amber-50 transition-all shadow-md active:scale-95"
          >
            Ranger Dispatch →
          </button>

          {/* Dismiss Alert Banner */}
          <button
            onClick={() => {
              setIsDismissed(true);
              sirenPlayer.stopLoop();
            }}
            className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/20 transition-colors"
            title="Dismiss Banner"
          >
            <X className="w-4 h-4" />
          </button>

        </div>

      </div>
    </div>
  );
}
