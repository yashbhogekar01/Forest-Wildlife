import React, { useState } from 'react';
import { X, AlertTriangle, ShieldAlert, CheckCircle2, Save, FileEdit, Radio } from 'lucide-react';
import { updateAlert } from '../services/api';

export default function ThreatConditionModal({ alert, onClose, onSaveSuccess }) {
  if (!alert) return null;

  const [status, setStatus] = useState(alert.status || 'ACTIVE');
  const [severity, setSeverity] = useState(alert.severity || 'CRITICAL');
  const [conditionDetails, setConditionDetails] = useState(alert.current_condition_details || '');
  const [assessmentNotes, setAssessmentNotes] = useState(alert.assessment_notes || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateAlert(alert.id, {
        status,
        severity,
        current_condition_details: conditionDetails,
        assessment_notes: assessmentNotes
      });
      if (onSaveSuccess) onSaveSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save alert modifications');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm font-sans">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center space-x-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                UPDATE INCIDENT :: <span className="text-amber-700">{alert.id}</span>
              </h3>
              <p className="text-[10px] text-slate-500">
                Pench Reserve Incident Management
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs text-slate-700">
          
          {/* Incident Summary Card */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase">Subject Tiger:</span>
              <div className="font-bold text-slate-800 mt-0.5">{alert.tiger_name}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase">Camera Station:</span>
              <div className="font-bold text-emerald-700 mt-0.5">{alert.station_name}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase">Trigger Type:</span>
              <div className="font-bold text-slate-800 mt-0.5">{alert.alert_type}</div>
            </div>
          </div>

          {/* Current Condition Details Textarea */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Current Condition & Assessment Details
            </label>
            <textarea
              rows={3}
              value={conditionDetails}
              onChange={e => setConditionDetails(e.target.value)}
              className="w-full bg-slate-50 text-slate-700 p-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none text-xs"
              placeholder="Enter active threat state details..."
            />
          </div>

          {/* Command Assessment & Override Notes */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Field Command Log & Patrol Notes
            </label>
            <textarea
              rows={3}
              value={assessmentNotes}
              onChange={e => setAssessmentNotes(e.target.value)}
              className="w-full bg-slate-50 text-slate-700 p-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none text-xs"
              placeholder="Record guard dispatch notes, thermal drone status, or ranger team actions..."
            />
          </div>

          {/* Status & Severity Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            
            {/* Severity Radio Buttons */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                Threat Severity Level
              </label>
              <div className="flex space-x-2">
                {['CRITICAL', 'WARNING', 'INFO'].map(sev => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSeverity(sev)}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                      severity === sev
                        ? sev === 'CRITICAL'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : sev === 'WARNING'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Radio Buttons */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                Incident Resolution Status
              </label>
              <div className="flex space-x-2">
                {['ACTIVE', 'INVESTIGATING', 'RESOLVED'].map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st)}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                      status === st
                        ? st === 'ACTIVE'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : st === 'INVESTIGATING'
                          ? 'bg-sky-50 text-sky-800 border-sky-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            <Radio className="w-3 h-3 text-emerald-600 inline" /> Direct DB Sync Enabled
          </span>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-600 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'PERSISTING...' : 'SAVE TO DATABASE'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
