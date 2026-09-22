import React, { useState } from 'react';
import { X, Camera, Zap, Radio, CheckCircle, RefreshCw } from 'lucide-react';
import { simulateCapture } from '../services/api';

export default function CaptureSimulationModal({ stations = [], tigers = [], onClose, onSuccess }) {
  const [stationId, setStationId] = useState('');
  const [tigerId, setTigerId] = useState('');
  const [flankSide, setFlankSide] = useState('Right');
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState(null);

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      const data = await simulateCapture({
        station_id: stationId || undefined,
        tiger_id: tigerId || undefined,
        flank_side: flankSide
      });
      setResult(data);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      alert('Simulation failed');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm font-sans">
      <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              TEST CAMERA TRAP PING
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-slate-700">
          
          {!result ? (
            <>
              <p className="text-slate-500">
                Trigger a test camera trap capture at Pench Tiger Reserve to simulate automated tiger stripe matching and location logging.
              </p>

              <div className="space-y-3">
                {/* Station Selection */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Select Target Camera Station (Optional)
                  </label>
                  <select
                    value={stationId}
                    onChange={e => setStationId(e.target.value)}
                    className="w-full bg-slate-50 text-slate-700 p-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none text-xs"
                  >
                    <option value="">-- Random Station Selection --</option>
                    {stations.map(st => (
                      <option key={st.id} value={st.id}>
                        {st.id} - {st.station_name} ({st.zone} Zone)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tiger Selection */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Select Subject Tiger (Optional)
                  </label>
                  <select
                    value={tigerId}
                    onChange={e => setTigerId(e.target.value)}
                    className="w-full bg-slate-50 text-slate-700 p-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none text-xs"
                  >
                    <option value="">-- Random Tiger Match --</option>
                    {tigers.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.id} - {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Flank Side */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Flank Exposure Side
                  </label>
                  <div className="flex space-x-3">
                    {['Left', 'Right'].map(side => (
                      <button
                        key={side}
                        type="button"
                        onClick={() => setFlankSide(side)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                          flankSide === side
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {side} Flank
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Simulation Success Result */
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center space-x-2 text-emerald-700 font-bold text-sm">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span>BIOMETRIC MATCH & PING RECORDED!</span>
              </div>
              <img
                src={result.sighting.image_url}
                className="w-full h-40 object-cover rounded-xl border border-slate-200 shadow-sm"
              />
              <div className="space-y-1 text-slate-700 text-xs">
                <div>Ping ID: <span className="font-bold text-slate-900">{result.sighting.id}</span></div>
                <div>Subject Tiger: <span className="font-bold text-amber-700">{result.tiger.name}</span></div>
                <div>Station: <span className="font-bold text-emerald-700">{result.station.station_name}</span></div>
                <div>CV Match Score: <span className="font-bold text-sky-700">{result.sighting.confidence_score}%</span></div>
                <div className="text-[10px] text-slate-500 mt-2">{result.sighting.notes}</div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
          {!result ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs text-slate-600 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSimulate}
                disabled={isSimulating}
                className="flex items-center space-x-2 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm"
              >
                <Zap className="w-4 h-4" />
                <span>{isSimulating ? 'ANALYZING STRIPES...' : 'TRIGGER CAPTURE PING'}</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setResult(null)}
              className="w-full py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm"
            >
              SIMULATE ANOTHER PING
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
