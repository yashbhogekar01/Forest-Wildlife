import React from 'react';
import { CloudSun, Wind, Droplets, Gauge, Sunset, Sunrise, Eye } from 'lucide-react';

export default function WeatherWidget({ weather }) {
  if (!weather) return null;

  return (
    <div className="bg-white rounded-2xl p-3 text-xs font-sans border border-slate-200 shadow-sm space-y-2">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center space-x-2">
          <CloudSun className="w-4 h-4 text-emerald-600" />
          <span className="font-bold text-slate-800 uppercase tracking-wider">PENCH LIVE WEATHER</span>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
          weather.live_api 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
            : 'bg-slate-100 text-slate-700 border-slate-300'
        }`}>
          {weather.live_api ? '🌐 OPEN_METEO_LIVE' : (weather.telemetry_status || 'NOMINAL')}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-1 text-slate-700">
        <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
          <div className="text-[10px] text-slate-500 uppercase font-bold">TEMP & COND</div>
          <div className="text-sm font-bold text-slate-800 mt-0.5">{weather.temperature_celsius}°C</div>
          <div className="text-[9px] text-emerald-700 font-semibold truncate">{weather.conditions}</div>
        </div>

        <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
          <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
            <Droplets className="w-3 h-3 text-sky-600 inline" /> HUMIDITY
          </div>
          <div className="text-sm font-bold text-sky-700 mt-0.5">{weather.humidity_percent}%</div>
          <div className="text-[9px] text-slate-500">Dew Point 19°C</div>
        </div>

        <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
          <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
            <Wind className="w-3 h-3 text-emerald-600 inline" /> WIND
          </div>
          <div className="text-sm font-bold text-slate-800 mt-0.5">{weather.wind_speed_kmh} km/h</div>
          <div className="text-[9px] text-slate-500">{weather.wind_direction} Vector</div>
        </div>

        <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
          <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
            <Gauge className="w-3 h-3 text-amber-600 inline" /> BAROMETER
          </div>
          <div className="text-sm font-bold text-amber-700 mt-0.5">{weather.barometric_pressure_hpa} hPa</div>
          <div className="text-[9px] text-slate-500">Steady Trend</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
        <span className="flex items-center gap-1">
          <Sunrise className="w-3 h-3 text-amber-600 inline" /> Rise: {weather.sunrise}
        </span>
        <span className="flex items-center gap-1">
          <Sunset className="w-3 h-3 text-amber-600 inline" /> Set: {weather.sunset}
        </span>
        <span className="flex items-center gap-1">
          <Eye className="w-3.5 h-3.5 text-sky-600 inline" /> Vis: {weather.visibility_km} km
        </span>
      </div>
    </div>
  );
}
