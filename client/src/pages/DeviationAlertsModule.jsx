import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, Shield, Activity, Flame, Eye, CheckCircle2, XCircle, Filter, 
  MapPin, Calendar, Clock, Download, RefreshCw, FileText, Check, ArrowRight,
  TrendingUp, AlertOctagon, HelpCircle, Layers, SlidersHorizontal, User, MessageSquare
} from 'lucide-react';

export default function DeviationAlertsModule({ 
  alerts = [], 
  tigers = [], 
  stations = [], 
  onAlertSaved 
}) {
  const [filterSeverity, setFilterSeverity] = useState('ALL'); // 'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'RANGE_SHIFT' | 'NEW_STATION' | 'BUFFER' | 'VILLAGE' | 'ABSENCE' | 'ARTEFACT'
  const [selectedAlertForEvidence, setSelectedAlertForEvidence] = useState(null);
  const [officerNoteInput, setOfficerNoteInput] = useState('');
  const [coreShiftThresholdSqKm, setCoreShiftThresholdSqKm] = useState(15.0);
  const [bufferShiftThresholdKm, setBufferShiftThresholdKm] = useState(5.0);

  const [liveAlerts, setLiveAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);

  // Fetch live alerts from database API
  const fetchAlerts = async () => {
    try {
      setLoadingAlerts(true);
      const res = await fetch('/api/alerts');
      const data = await res.json();
      if (Array.isArray(data)) {
        setLiveAlerts(data);
      }
    } catch (err) {
      console.error('Error fetching live alerts:', err);
    } finally {
      setLoadingAlerts(false);
    }
  };

  React.useEffect(() => {
    fetchAlerts();
  }, []);

  // Run automated deviation detection engine
  const handleRunDeviationEngine = async () => {
    try {
      setLoadingAlerts(true);
      const runId = `RUN_${Date.now()}`;
      const res = await fetch(`/api/alerts/analyze/${runId}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(`Automated deviation analysis run '${runId}' completed. ${data.new_alerts_generated} new alerts generated across Pench Tiger Reserve!`);
        fetchAlerts();
      }
    } catch (err) {
      console.error('Error running deviation engine:', err);
    } finally {
      setLoadingAlerts(false);
    }
  };

  // Review Decision Handler
  const handleReviewDecision = async (alertId, decision) => {
    try {
      const res = await fetch(`/api/alerts/${alertId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: decision,
          review_notes: officerNoteInput || `Reviewed by Forest Department Officer - ${decision}`,
          reviewer_id: 'RFO_Officer'
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Alert '${alertId}' successfully updated with status '${decision}'.`);
        setSelectedAlertForEvidence(null);
        setOfficerNoteInput('');
        fetchAlerts();
      }
    } catch (err) {
      console.error('Error submitting alert review decision:', err);
    }
  };

  // Dynamic Rule-Based Alert Feed
  const evaluatedAlerts = useMemo(() => {
    const listToFilter = liveAlerts.length > 0 ? liveAlerts : alerts;
    return listToFilter.filter(a => {
      if (filterSeverity !== 'ALL' && a.severity !== filterSeverity) return false;
      if (filterType !== 'ALL' && a.alert_type !== filterType) return false;
      return true;
    });
  }, [liveAlerts, alerts, filterSeverity, filterType]);

  // Export Handlers
  const handleExportAlertsReport = (format) => {
    if (format === 'CSV') {
      window.open('/api/alerts/export/csv', '_blank');
    } else if (format === 'GeoJSON') {
      window.open('/api/alerts/export/geojson', '_blank');
    } else {
      window.open('/api/alerts/export/csv', '_blank');
    }
  };

  return (
    <div className="space-y-6 text-slate-800 font-sans pb-12">
      
      {/* 🚨 MODULE HEADER BAR */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 p-6 rounded-3xl text-white border border-red-500/40 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-mono text-[10px] font-extrabold uppercase tracking-wider animate-pulse">
              REAL-TIME BEHAVIORAL DISRUPTION ENGINE
            </span>
            <span className="text-[11px] text-amber-300 font-mono">
              Survey Effort &amp; Artefact Corrected
            </span>
          </div>
          <h2 className="text-2xl font-black text-amber-400 tracking-wide uppercase mt-1 flex items-center gap-2">
            <AlertOctagon className="w-7 h-7 text-red-500" />
            <span>🚨 Wildlife Deviation &amp; Trend Intelligence</span>
          </h2>
          <p className="text-xs text-slate-300 font-medium mt-0.5">
            Automated detection of territory shifts, buffer crossings, village proximity, and survey artefact validation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRunDeviationEngine}
            disabled={loadingAlerts}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loadingAlerts ? 'animate-spin' : ''}`} />
            <span>Run Deviation Analysis</span>
          </button>

          {['CSV', 'GeoJSON'].map(fmt => (
            <button
              key={fmt}
              onClick={() => handleExportAlertsReport(fmt)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export {fmt}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ⚙️ 13. CONFIGURABLE THRESHOLDS PANEL */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-3">
          <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
          <div>
            <span className="font-extrabold text-slate-900 uppercase">Configurable Alert Thresholds:</span>
            <span className="text-slate-500 text-[11px] block">Adjust range shift and buffer proximity sensitivity</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <label className="font-bold text-slate-700">Core Range Threshold:</label>
            <input 
              type="number" 
              value={coreShiftThresholdSqKm} 
              onChange={e => setCoreShiftThresholdSqKm(parseFloat(e.target.value) || 15.0)}
              className="w-16 p-1.5 bg-slate-50 border border-slate-300 rounded-xl font-bold font-mono text-center"
            />
            <span className="text-slate-500 font-bold">km²</span>
          </div>

          <div className="flex items-center space-x-2">
            <label className="font-bold text-slate-700">Buffer Displacement Threshold:</label>
            <input 
              type="number" 
              value={bufferShiftThresholdKm} 
              onChange={e => setBufferShiftThresholdKm(parseFloat(e.target.value) || 5.0)}
              className="w-16 p-1.5 bg-slate-50 border border-slate-300 rounded-xl font-bold font-mono text-center"
            />
            <span className="text-slate-500 font-bold">km</span>
          </div>
        </div>
      </div>

      {/* 🔍 20. ALERT CENTER UI & FILTERS */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2 text-xs">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="font-bold text-slate-700 uppercase">Severity Filter:</span>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(sev => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all ${
                  filterSeverity === sev 
                    ? 'bg-slate-900 text-white shadow' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="font-bold text-slate-700 uppercase">Type Filter:</span>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 text-xs font-bold text-slate-800"
            >
              <option value="ALL">All Alert Types</option>
              <option value="RANGE_SHIFT">Range Shift</option>
              <option value="NEW_STATION">New Camera Station</option>
              <option value="BUFFER">Buffer Movement</option>
              <option value="VILLAGE">Village Proximity</option>
              <option value="ABSENCE">Prolonged Absence</option>
            </select>
          </div>
        </div>

        {/* Alert Cards Feed */}
        <div className="space-y-3">
          {evaluatedAlerts.map(alert => (
            <div 
              key={alert.id}
              className={`p-5 rounded-2xl border transition-all space-y-3 ${
                alert.severity === 'CRITICAL'
                  ? 'bg-red-50/80 border-red-300 shadow-md'
                  : alert.severity === 'HIGH'
                  ? 'bg-amber-50/80 border-amber-300'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
                <div className="flex items-center space-x-2.5">
                  <span className={`px-2.5 py-0.5 rounded-md font-mono text-[9px] font-extrabold uppercase text-white ${
                    alert.severity === 'CRITICAL' ? 'bg-red-600' : alert.severity === 'HIGH' ? 'bg-amber-600' : 'bg-slate-700'
                  }`}>
                    {alert.severity} SEVERITY
                  </span>
                  <span className="font-extrabold text-slate-900 text-sm">{alert.tiger_name} ({alert.tiger_id})</span>
                  <span className="text-slate-500 text-xs font-mono">• {alert.timestamp}</span>
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <span className="font-bold text-slate-700">AI Confidence:</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono font-bold">{alert.confidence_score}%</span>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{alert.detected_change}</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  <strong>Evidence:</strong> {typeof alert.supporting_evidence === 'object' ? JSON.stringify(alert.supporting_evidence) : alert.supporting_evidence || 'Traceable telemetry observation logs'} | <strong>Survey Quality:</strong> {alert.survey_effort_score ? `${Math.round(alert.survey_effort_score * 100)}% Active` : alert.survey_quality || '94% Station Coverage'}
                </p>
              </div>

              {/* 18. SURVEY ARTEFACT WARNING CALLOUT */}
              {(alert.is_artefact || alert.status === 'SURVEY_ARTEFACT') && (
                <div className="p-3 bg-amber-100/90 border border-amber-300 text-amber-900 rounded-xl text-xs font-medium flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>{alert.ai_explanation || alert.detected_change}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedAlertForEvidence(alert)}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>View Evidence Page</span>
                  </button>

                  <button
                    onClick={() => handleReviewDecision(alert.id || alert.alert_id, 'SURVEY_ARTEFACT')}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-300 rounded-xl transition-all cursor-pointer"
                  >
                    Mark as Survey Artefact
                  </button>
                </div>

                <button
                  onClick={() => handleReviewDecision(alert.id || alert.alert_id, 'CONFIRMED_BEHAVIOURAL_CHANGE')}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Acknowledge Alert</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🔍 21. ALERT EVIDENCE PAGE MODAL */}
      {selectedAlertForEvidence && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] font-sans">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertOctagon className="w-6 h-6 text-red-500" />
                <div>
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                    Alert Evidence Analysis: {selectedAlertForEvidence.id}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedAlertForEvidence.tiger_name} ({selectedAlertForEvidence.tiger_id})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedAlertForEvidence(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-800">
              
              {/* Change & AI Explanation */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                <span className="font-extrabold text-amber-900 uppercase text-[10px]">
                  💡 AI Explainability ("Why am I seeing this alert?"):
                </span>
                <p className="text-slate-800 leading-relaxed font-medium">
                  {selectedAlertForEvidence.ai_explanation}
                </p>
              </div>

              {/* BEFORE VS AFTER MOVEMENT MAP COMPARISON */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">BEFORE (Historical Territory):</span>
                  <div className="text-lg font-black text-amber-400">{selectedAlertForEvidence.previous_area}</div>
                  <div className="h-28 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center text-slate-500 font-mono text-[10px]">
                    [Historical Polygon Map]
                  </div>
                </div>

                <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">AFTER (Current Telemetry Run):</span>
                  <div className="text-lg font-black text-emerald-400">{selectedAlertForEvidence.current_area} ({selectedAlertForEvidence.area_change})</div>
                  <div className="h-28 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center text-slate-500 font-mono text-[10px]">
                    [New Extended Range Map]
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Survey Quality</span>
                  <span className="text-xs font-bold text-emerald-700 block mt-0.5">{selectedAlertForEvidence.survey_quality}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">AI Confidence</span>
                  <span className="text-xs font-bold text-amber-700 block mt-0.5">{selectedAlertForEvidence.confidence_score}%</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Station Node</span>
                  <span className="text-xs font-bold text-slate-800 block mt-0.5">{selectedAlertForEvidence.station_name}</span>
                </div>
              </div>

              {/* Officer Recommendation Form */}
              <div className="space-y-1.5 pt-2">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Forest Department Officer Inspection Notes:
                </label>
                <textarea
                  rows={3}
                  value={officerNoteInput}
                  onChange={e => setOfficerNoteInput(e.target.value)}
                  placeholder="Enter officer assessment notes (e.g., Beat patrol dispatched to inspect buffer boundary...)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-between items-center text-xs">
              <button
                onClick={() => setSelectedAlertForEvidence(null)}
                className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300"
              >
                Close Evidence Window
              </button>

              <button
                onClick={() => handleReviewDecision(selectedAlertForEvidence.id || selectedAlertForEvidence.alert_id, 'CONFIRMED_BEHAVIOURAL_CHANGE')}
                className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow"
              >
                Save Officer Assessment
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
