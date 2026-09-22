import React, { useState, useEffect } from 'react';
import { Shield, Bell, Camera, CloudSun, Clock, MapPin, Upload, Search, Volume2, VolumeX, Power, LogOut, UserCheck, Bot } from 'lucide-react';
import { sirenPlayer } from '../utils/audioAlert';

export default function Header({ tigers = [], activeAlertsCount, onOpenSimulation, onOpenUpload, onSelectAnimal, weather, currentUser, onLogout, onOpenAiAssistant }) {
  const [time, setTime] = useState(new Date());

  // Master Buzzer ON/OFF State synced with localStorage
  const [isBuzzerEnabled, setIsBuzzerEnabled] = useState(() => {
    const saved = localStorage.getItem('village_buzzer_master_enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleBuzzer = () => {
    const nextState = !isBuzzerEnabled;
    setIsBuzzerEnabled(nextState);
    localStorage.setItem('village_buzzer_master_enabled', JSON.stringify(nextState));
    if (!nextState) {
      sirenPlayer.stopLoop();
    }
    // Dispatch custom event to notify all components
    window.dispatchEvent(new Event('buzzer_switch_changed'));
  };

  const formattedTime = time.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  });

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-2.5 sticky top-0 z-40 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 max-w-7xl mx-auto w-full">
        
        {/* Official Pench Tiger Reserve Brand & Logo */}
        <div className="flex items-center space-x-3">
          <div className="p-1 bg-amber-50 border border-amber-300 rounded-xl shadow-sm flex items-center justify-center shrink-0">
            <img 
              src="/pench-logo.jpg" 
              alt="Pench Tiger Reserve Logo" 
              className="h-9 w-auto object-contain rounded-lg"
            />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <span className="text-emerald-950 font-black">Pench Rakshak</span>
              <span className="text-[10px] uppercase tracking-wider font-bold bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded-md">
                Pench Tiger Reserve
              </span>
            </h1>
            <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 inline shrink-0" />
              <span>AI Command & Telemetry Monitoring Portal</span>
            </p>
          </div>
        </div>

        {/* Simple Animal Search Dropdown */}
        <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
          <Search className="w-4 h-4 text-emerald-600 shrink-0" />
          <select
            defaultValue=""
            onChange={(e) => {
              const tiger = tigers.find(t => t.id === e.target.value);
              if (tiger && onSelectAnimal) onSelectAnimal(tiger);
            }}
            className="bg-white text-slate-700 text-xs py-1 px-2.5 rounded-lg border border-slate-200 focus:border-emerald-500 focus:outline-none cursor-pointer"
          >
            <option value="" disabled>🔍 Select Animal (Age & Sex Info)...</option>
            {tigers
              .filter(t => t && t.id !== 'TGR-039' && t.id !== 'TGR-043' && !t.name?.includes('T-39') && !t.name?.includes('T-43') && !t.name?.includes('Sillari Male') && !t.name?.includes('Khawasa Tigress'))
              .map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} • {t.gender || 'Female'}, {t.age_years || '5'} YRS
                </option>
              ))}
          </select>
        </div>

        {/* Action Controls & User Logout */}
        <div className="flex items-center space-x-2.5">
          
          {/* AI Assistant Button in Header */}
          <button
            onClick={onOpenAiAssistant}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-extrabold bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-600 hover:to-emerald-700 text-white rounded-xl shadow-md transition-all active:scale-95 animate-pulse"
          >
            <Bot className="w-4 h-4" />
            <span>AI Assistant</span>
          </button>
          
          {/* SPECIAL OPTION: Master Buzzer Switch in Header */}
          <button
            onClick={handleToggleBuzzer}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all shadow-sm active:scale-95 ${
              isBuzzerEnabled
                ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
            }`}
            title="Special Master Switch to ON/OFF Village Proximity Buzzer Alarm"
          >
            <Power className={`w-3.5 h-3.5 ${isBuzzerEnabled ? 'text-amber-600' : 'text-slate-400'}`} />
            <span>BUZZER {isBuzzerEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Upload Image Button */}
          <button
            onClick={onOpenUpload}
            className="flex items-center space-x-2 px-3.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all shadow-sm active:scale-95"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Photo</span>
          </button>

          {/* Simulate Ping */}
          <button
            onClick={onOpenSimulation}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg transition-all hidden sm:flex"
          >
            <Camera className="w-4 h-4 text-emerald-600" />
            <span>Test Ping</span>
          </button>

          {/* Live Clock & AI Image Filter Status Pill */}
          <div className="hidden lg:flex items-center space-x-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-emerald-600 text-white rounded uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-ping"></span>
              AI IMAGE FILTER ACTIVE
            </span>
            <Clock className="w-3.5 h-3.5 text-emerald-600 ml-1" />
            <span className="font-semibold text-slate-800">{formattedTime}</span>
          </div>

          {/* Active Alerts Badge */}
          {activeAlertsCount > 0 && (
            <div className="flex items-center px-2.5 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 font-bold space-x-1.5">
              <Bell className="w-3.5 h-3.5 text-amber-600" />
              <span>{activeAlertsCount} Alerts</span>
            </div>
          )}

          {/* User Profile Badge & Logout */}
          {currentUser && (
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800 leading-tight">{currentUser.name}</span>
                <span className="text-[10px] text-emerald-700 font-medium">{currentUser.role}</span>
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200 hover:border-red-200 transition-all active:scale-95"
                title="Log Out of Command Portal"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

      </div>
    </header>
  );
}
