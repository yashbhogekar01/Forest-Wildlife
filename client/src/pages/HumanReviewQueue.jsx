import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, XCircle, UserPlus, RefreshCw, AlertTriangle, 
  MapPin, Calendar, Camera, Sparkles, Fingerprint, Eye, ShieldCheck, 
  ChevronRight, FileText, Filter, Check
} from 'lucide-react';

export default function HumanReviewQueue({ onSelectTiger, onViewLocationOnMap }) {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [actionSuccessMessage, setActionSuccessMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPendingQueue();
  }, []);

  const fetchPendingQueue = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reviews/pending');
      const data = await res.json();
      if (data.success && data.queue) {
        setQueue(data.queue);
        if (data.queue.length > 0) {
          setSelectedCandidateId(data.queue[0].top_candidates?.[0]?.individual_id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch pending reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeItem = queue[selectedItemIndex];

  const handleDecision = async (decisionType) => {
    if (!activeItem) return;
    setIsSubmitting(true);
    setActionSuccessMessage(null);

    try {
      const res = await fetch(`/api/reviews/${activeItem.observation_id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: decisionType,
          candidate_tiger_id: selectedCandidateId || activeItem.top_candidates?.[0]?.individual_id,
          reviewer_notes: reviewerNotes
        })
      });
      const data = await res.json();

      if (data.success) {
        setActionSuccessMessage(`Decision '${decisionType}' logged successfully! Assigned: ${data.assigned_tiger_id}`);
        // Remove item from queue
        setTimeout(() => {
          const updated = queue.filter((_, idx) => idx !== selectedItemIndex);
          setQueue(updated);
          setSelectedItemIndex(0);
          setActionSuccessMessage(null);
          setReviewerNotes('');
          if (updated.length > 0) {
            setSelectedCandidateId(updated[0].top_candidates?.[0]?.individual_id);
          }
        }, 1200);
      }
    } catch (err) {
      console.error('Error submitting review decision:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin" />
        <p className="text-sm font-bold text-slate-700">Loading Human Review Queue...</p>
      </div>
    );
  }

  if (queue.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4 max-w-2xl mx-auto my-12">
        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full w-16 h-16 mx-auto flex items-center justify-center border border-emerald-200">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">All Observations Verified!</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          No ambiguous tiger observations require human verification at this time. All incoming camera trap captures have been processed with high-confidence automated matches or enrolled cleanly.
        </p>
        <button
          onClick={fetchPendingQueue}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Queue</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white border border-amber-500/30 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-amber-500/20 rounded-2xl border border-amber-400/40 text-amber-400">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold uppercase tracking-wide">Human Review Verification Queue</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs">
                {queue.length} PENDING
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Ambiguous Match Threshold Calibration (75% – 89% similarity). Expert reviewer decisions update future model embeddings.
            </p>
          </div>
        </div>

        <button
          onClick={fetchPendingQueue}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/40 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Sync Pending Queue</span>
        </button>
      </div>

      {actionSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xs border border-emerald-300 flex items-center gap-2 shadow-lg animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Main Reviewer Workstation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Queue Navigator Sidebar (3 cols) */}
        <div className="lg:col-span-3 space-y-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm max-h-[750px] overflow-y-auto">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2 flex items-center justify-between">
            <span>Pending Reviews ({queue.length})</span>
            <Filter className="w-3.5 h-3.5" />
          </div>

          <div className="space-y-2">
            {queue.map((item, idx) => (
              <button
                key={item.observation_id}
                onClick={() => {
                  setSelectedItemIndex(idx);
                  setSelectedCandidateId(item.top_candidates?.[0]?.individual_id);
                  setReviewerNotes('');
                }}
                className={`w-full p-3 rounded-2xl text-left border transition-all flex items-center gap-3 cursor-pointer ${
                  selectedItemIndex === idx
                    ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300 shadow-md'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <img
                  src={item.image_url}
                  alt="Observation thumbnail"
                  className="w-12 h-12 rounded-xl object-cover bg-slate-900 border border-slate-200 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800 truncate">#{item.observation_id}</span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                      {item.identification_confidence}%
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">{item.station_name}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* CENTER & RIGHT COLUMN: Side-by-Side Review Workstation (9 cols) */}
        {activeItem && (
          <div className="lg:col-span-9 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* QUERY IMAGE DISPLAY PANEL */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-amber-400 text-slate-950 font-black text-[10px] rounded-md uppercase tracking-wider">
                      NEW OBSERVATION
                    </span>
                    <span className="text-xs font-bold text-slate-700 font-mono">#{activeItem.observation_id}</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 font-mono">
                    Detection: {activeItem.detection_confidence}%
                  </span>
                </div>

                <div className="relative h-64 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 group">
                  <img
                    src={activeItem.image_url}
                    alt="Query camera trap frame"
                    className="w-full h-full object-contain bg-slate-900"
                  />
                  <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/80 backdrop-blur-md rounded-xl text-white text-[10px] font-mono border border-white/20 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                    <span>Flank: {activeItem.flank_side}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-sky-600" /> Station Node
                    </span>
                    <p className="font-bold text-slate-800 truncate">{activeItem.station_name}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-amber-600" /> Timestamp
                    </span>
                    <p className="font-bold text-slate-800 truncate">
                      {new Date(activeItem.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* TOP 5 CANDIDATE MATCHES LIST */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Fingerprint className="w-4 h-4 text-emerald-600" />
                    <span>Top 5 Candidate Matches</span>
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">Vector Similarity Search</span>
                </div>

                <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                  {activeItem.top_candidates?.map((cand, cIdx) => (
                    <div
                      key={cand.individual_id}
                      onClick={() => setSelectedCandidateId(cand.individual_id)}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        selectedCandidateId === cand.individual_id
                          ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-300 shadow-md'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={cand.reference_image}
                          alt={cand.tiger_name}
                          className="w-12 h-12 rounded-xl object-cover bg-slate-900 border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-800">{cand.tiger_name}</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                              {cand.individual_id}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Territory: {cand.territory} • {cand.sex}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`text-xs font-black font-mono px-2.5 py-1 rounded-lg border ${
                          cIdx === 0 
                            ? 'bg-amber-400 text-slate-950 border-amber-500' 
                            : 'bg-slate-200 text-slate-800 border-slate-300'
                        }`}>
                          {cand.similarity_score}% Match
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* REVIEWER DECISION & AUDIT FORM */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Human Verification &amp; Audit Log
                </h3>
                <span className="text-[10px] font-mono text-slate-400">Target Selected: {selectedCandidateId || 'None'}</span>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Reviewer Audit Justification Notes (Optional)
                </label>
                <textarea
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  placeholder="Enter audit rationale (e.g., Flank stripe curvature matched at 4 points; low-light shadow accounted for)..."
                  rows={2}
                  className="w-full bg-slate-950 text-xs text-slate-100 p-3 rounded-2xl border border-slate-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                
                {/* CONFIRM MATCH */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleDecision('CONFIRM')}
                  className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Match</span>
                </button>

                {/* REJECT CANDIDATE */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleDecision('REJECT')}
                  className="p-3 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Candidate</span>
                </button>

                {/* ENROLL AS NEW INDIVIDUAL */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleDecision('CREATE_NEW')}
                  className="p-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Enroll New Individual</span>
                </button>

                {/* MARK UNUSABLE */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleDecision('MARK_UNUSABLE')}
                  className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Mark Unusable</span>
                </button>

              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
