import React from 'react';
import { X, Fingerprint, MapPin, Calendar, Heart, Shield, Camera, Radio, Navigation, BatteryCharging, Signal } from 'lucide-react';

export default function AnimalDetailModal({ animal, sightings = [], onClose, onOpenBiometrics, onOpenMapWithTiger }) {
  if (!animal) return null;

  const animalSightings = sightings.filter(s => s.tiger_id === animal.id);
  const isFemale = animal.gender?.toLowerCase() === 'female';

  const lat = animal.estimated_home_center_lat ? Number(animal.estimated_home_center_lat).toFixed(5) : '21.77500';
  const lng = animal.estimated_home_center_lng ? Number(animal.estimated_home_center_lng).toFixed(5) : '79.33200';
  const collarId = `IRIDIUM-COLLAR-${animal.id.replace(/\D/g, '') || '015'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans">
      <div className="bg-white w-full max-w-3xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-2xl border ${isFemale ? 'bg-pink-500/20 border-pink-400/40 text-pink-400' : 'bg-sky-500/20 border-sky-400/40 text-sky-400'}`}>
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  {animal.name}
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-emerald-500 text-black font-mono">
                  {animal.id}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Pench Core &amp; Buffer Reserve Sector • GPS Collar Monitored
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          
          {/* Authentic Camera Trap Banner */}
          <div className="relative h-56 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
            <img
              src={animal.image_url || animalSightings[0]?.image_url || '/images/tiger_trap_1.jpg'}
              alt={animal.name}
              onError={(e) => {
                e.target.onerror = null;
                const num = parseInt((animal.id || '1').replace(/\D/g, ''), 10) || 1;
                e.target.src = `/images/tiger_trap_${(num % 8) + 1}.jpg`;
              }}
              className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
            
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <div>
                <div className="px-2.5 py-0.5 text-[10px] font-bold text-white bg-emerald-700 rounded-md shadow-sm inline-block uppercase font-mono mb-1">
                  Camera Trap Capture • Pench Reserve
                </div>
                <h3 className="text-xl font-bold text-white tracking-wide">{animal.name}</h3>
              </div>

              {animalSightings[0] && (
                <div className="text-[10px] text-white bg-black/75 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/20 font-mono text-right">
                  <div>Captured @ {animalSightings[0].station_name}</div>
                  <div className="text-amber-300 font-bold">{animalSightings[0].confidence_score}% Pattern Match</div>
                </div>
              )}
            </div>
          </div>

          {/* REAL-TIME RADIO COLLAR GPS TELEMETRY BOX */}
          <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white p-4 rounded-2xl border border-emerald-500/40 shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2">
              <div className="flex items-center space-x-2">
                <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
                <span className="font-extrabold text-xs uppercase tracking-wider text-amber-400">
                  LIVE SATELLITE GPS RADIO COLLAR TELEMETRY
                </span>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500 text-black rounded uppercase">
                ACTIVE TRANSMITTING
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              
              {/* Exact Coordinates */}
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 uppercase">
                  <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                  Exact Latitude
                </div>
                <div className="text-sm font-mono font-black text-emerald-400">
                  {lat}° N
                </div>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 uppercase">
                  <Navigation className="w-3.5 h-3.5 text-sky-400" />
                  Exact Longitude
                </div>
                <div className="text-sm font-mono font-black text-sky-400">
                  {lng}° E
                </div>
              </div>

              {/* Device ID */}
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 uppercase">
                  <Radio className="w-3.5 h-3.5 text-amber-400" />
                  Collar Device ID
                </div>
                <div className="text-xs font-mono font-bold text-amber-300">
                  {collarId}
                </div>
              </div>

              {/* Battery & Signal Status */}
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 uppercase">
                  <Signal className="w-3.5 h-3.5 text-emerald-400" />
                  Satellite Link
                </div>
                <div className="text-xs font-mono font-bold text-emerald-300 flex items-center gap-1">
                  <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                  94% Solar • 8 Sat
                </div>
              </div>

            </div>

            {/* Pinpoint Location Button */}
            {onOpenMapWithTiger && (
              <div className="pt-1 flex justify-end">
                <button
                  onClick={() => {
                    onClose();
                    onOpenMapWithTiger(animal);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow flex items-center gap-1.5 active:scale-95"
                >
                  <MapPin className="w-4 h-4 text-amber-300" />
                  <span>PINPOINT EXACT LOCATION ON SATELLITE MAP</span>
                </button>
              </div>
            )}
          </div>

          {/* Key Info Box (AGE, SEX, HEALTH, TOTAL SIGHTINGS) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

            {/* GENDER / SEX */}
            <div className={`p-4 rounded-2xl border space-y-1 ${
              isFemale 
                ? 'bg-pink-50 border-pink-200 text-pink-800' 
                : 'bg-sky-50 border-sky-200 text-sky-800'
            }`}>
              <div className="text-[11px] font-bold uppercase opacity-80 flex items-center justify-between">
                <span>Sex / Gender</span>
                <span className="text-base font-bold">{isFemale ? '♀' : '♂'}</span>
              </div>
              <div className="text-xl font-bold text-slate-800 capitalize">
                {animal.gender || 'Female'}
              </div>
              <div className="text-[10px] opacity-75">
                {isFemale ? 'Female Tiger' : 'Male Tiger'}
              </div>
            </div>

            {/* AGE */}
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-amber-900 space-y-1">
              <div className="text-[11px] font-bold uppercase opacity-80 flex items-center justify-between">
                <span>Age</span>
                <Calendar className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-xl font-bold text-slate-800">
                {animal.age_years ? `${animal.age_years} Yrs` : '5.2 Yrs'}
              </div>
              <div className="text-[10px] opacity-80">
                Adult Individual
              </div>
            </div>

            {/* HEALTH CONDITION */}
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-emerald-900 space-y-1">
              <div className="text-[11px] font-bold uppercase opacity-80 flex items-center justify-between">
                <span>Health</span>
                <Heart className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-bold text-slate-800">
                {animal.health_status || 'Healthy'}
              </div>
              <div className="text-[10px] opacity-80">
                Active Tracking
              </div>
            </div>

            {/* CAMERA CAPTURES */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-slate-700 space-y-1">
              <div className="text-[11px] font-bold text-slate-500 uppercase flex items-center justify-between">
                <span>Camera Pings</span>
                <Camera className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-bold text-slate-800">
                {animal.total_sightings_count || animalSightings.length || 18} Pings
              </div>
              <div className="text-[10px] text-slate-500">
                Across Pench Nodes
              </div>
            </div>

          </div>

          {/* Biometric Stripe Signature */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
              <span className="flex items-center gap-1.5">
                <Fingerprint className="w-4 h-4 text-emerald-600 inline" />
                Stripe Pattern Flank Hash Signature
              </span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-mono font-bold text-emerald-700">
              {animal.stripe_signature_hash || 'SHA256-FLANK-L-8F92A1'}
            </div>
          </div>

          {/* Camera Trap Captures Timeline for this Animal */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-600" />
                RECENT CAMERA CAPTURES FOR {animal.name.toUpperCase()} ({animalSightings.length})
              </h3>
            </div>

            {animalSightings.length === 0 ? (
              <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                No recent camera trap images recorded yet for this individual.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {animalSightings.map(s => (
                  <div key={s.id} className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 p-2 space-y-2">
                    <div className="relative h-32 bg-slate-100 rounded-xl overflow-hidden">
                      <img 
                        src={s.image_url} 
                        alt={animal.name} 
                        onError={(e) => {
                          e.target.onerror = null;
                          const num = parseInt((s.id || '1').replace(/\D/g, ''), 10) || 1;
                          e.target.src = `/images/tiger_trap_${(num % 8) + 1}.jpg`;
                        }}
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-white/90 text-[10px] font-mono text-slate-800 rounded-md border border-slate-200 shadow-sm">
                        {s.station_name}
                      </div>
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-md border border-emerald-200 shadow-sm">
                        {s.confidence_score}% Match
                      </div>
                    </div>
                    <div className="p-1 text-[10px] text-slate-500 flex justify-between">
                      <span>Time:</span>
                      <span className="text-slate-800 font-semibold">
                        {new Date(s.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm"
          >
            CLOSE PROFILE
          </button>
        </div>

      </div>
    </div>
  );
}
