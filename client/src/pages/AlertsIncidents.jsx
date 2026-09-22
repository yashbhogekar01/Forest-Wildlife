import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, Filter, CheckCircle2, Clock, FileEdit, Radio } from 'lucide-react';
import ThreatConditionModal from '../components/ThreatConditionModal';

export default function AlertsIncidents({ alerts = [], onAlertSaved }) {
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [activeModalAlert, setActiveModalAlert] = useState(null);

  const filteredAlerts = alerts.filter(a => {
    if (selectedSeverity !== 'ALL' && a.severity !== selectedSeverity) return false;
    if (selectedStatus !== 'ALL' && a.status !== selectedStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* Title Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-base font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          RESERVE INCIDENTS & THREAT ALERTS
        </h1>
        <p className="text-xs text-slate-500">
          Real-Time Proximity Alerts, Range Shift Anomalies, and Field Command Response Logs
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        
        {/* Severity Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-emerald-600" />
          <span className="text-xs text-slate-500 font-bold uppercase">Severity:</span>
          <div className="flex space-x-1.5">
            {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map(sev => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                  selectedSeverity === sev
                    ? sev === 'CRITICAL'
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : sev === 'WARNING'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : sev === 'INFO'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-bold uppercase">Status:</span>
          <div className="flex space-x-1.5">
            {['ALL', 'ACTIVE', 'INVESTIGATING', 'RESOLVED'].map(st => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                  selectedStatus === st
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Alert Cards List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs bg-white rounded-2xl border border-slate-200 shadow-sm">
            NO INCIDENT ALERTS MATCHING SPECIFIED CRITERIA
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className={`bg-white p-5 rounded-2xl border shadow-sm transition-all space-y-3 ${
                alert.severity === 'CRITICAL'
                  ? 'border-amber-300 bg-amber-50/20 hover:border-amber-400'
                  : alert.severity === 'WARNING'
                  ? 'border-amber-200 bg-amber-50/10 hover:border-amber-300'
                  : 'border-emerald-200 bg-emerald-50/10 hover:border-emerald-300'
              }`}
            >
              
              {/* Alert Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-2.5 py-0.5 text-xs font-bold rounded-md border uppercase ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : alert.severity === 'WARNING'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {alert.severity} :: {alert.alert_type}
                  </span>
                  <span className="text-xs font-bold text-slate-700">{alert.id}</span>
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  <span
                    className={`px-2 py-0.5 rounded-md font-bold uppercase ${
                      alert.status === 'ACTIVE'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : alert.status === 'INVESTIGATING'
                        ? 'bg-sky-50 text-sky-800 border border-sky-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    STATUS: {alert.status}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(alert.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Alert Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Subject Tiger:</span>
                  <div className="font-bold text-slate-800 text-sm mt-0.5">{alert.tiger_name}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Camera Station:</span>
                  <div className="font-bold text-emerald-700 text-sm mt-0.5">{alert.station_name}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Location Zone:</span>
                  <div className="font-bold text-slate-800 text-sm mt-0.5">{alert.zone || 'Buffer Zone'}</div>
                </div>
              </div>

              {/* Threat Condition Text */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-emerald-700 font-bold uppercase">
                  INCIDENT DETAILS
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {alert.current_condition_details}
                </p>
              </div>

              {/* Assessment Log */}
              {alert.assessment_notes && (
                <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-sky-700 font-bold">RANGER COMMAND LOG: </span>
                  <span>{alert.assessment_notes}</span>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setActiveModalAlert(alert)}
                  className="flex items-center space-x-2 px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all shadow-sm"
                >
                  <FileEdit className="w-4 h-4" />
                  <span>UPDATE STATUS & NOTES</span>
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Threat Condition Modal */}
      {activeModalAlert && (
        <ThreatConditionModal
          alert={activeModalAlert}
          onClose={() => setActiveModalAlert(null)}
          onSaveSuccess={() => {
            if (onAlertSaved) onAlertSaved();
          }}
        />
      )}

    </div>
  );
}
