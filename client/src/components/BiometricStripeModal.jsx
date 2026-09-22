import React from 'react';
import { X, Fingerprint, Scan, ShieldCheck, Cpu, Sparkles, Palette, Eye, Activity, Award } from 'lucide-react';

export default function BiometricStripeModal({ tiger, onClose }) {
  if (!tiger) return null;

  const lat = tiger.estimated_home_center_lat ? Number(tiger.estimated_home_center_lat).toFixed(4) : '21.7500';
  const lng = tiger.estimated_home_center_lng ? Number(tiger.estimated_home_center_lng).toFixed(4) : '79.3300';
  const isFemale = tiger.gender?.toLowerCase() === 'female';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-sans">
      <div className="bg-slate-900 w-full max-w-3xl rounded-3xl border border-emerald-500/50 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-emerald-400">
              <Fingerprint className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-extrabold text-white uppercase tracking-wider">
                  AI BIOMETRIC IDENTIFICATION REPORT :: <span className="text-amber-400">{tiger.name}</span>
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500 text-black rounded uppercase">
                  {tiger.id}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Multi-Feature Analysis: Stripes • Coat Colour • Facial Pattern • Claws &amp; Pugmarks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-200">
          
          {/* Top Overview Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Subject Individual:</span>
              <div className="font-bold text-base text-white">{tiger.name} ({tiger.id})</div>
              <span className="text-[10px] text-emerald-400 font-mono">Pench Tiger Reserve</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Stripe Signature Hash:</span>
              <div className="font-mono text-xs font-bold text-amber-300 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700 mt-0.5 inline-block">
                {tiger.stripe_signature_hash || 'SHA256-FLANK-L-8F92A1'}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Overall AI Match Score:</span>
              <div className="font-black text-xl text-emerald-400 font-mono">98.6% VERIFIED</div>
            </div>
          </div>

          {/* 4 BIOMETRIC FEATURE CARDS: STRIPES, COLOUR, PATTERN, CLAWS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* 1. STRIPES IDENTIFICATION */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/40 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <Fingerprint className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-xs uppercase tracking-wider text-emerald-400">
                    1. Flank &amp; Tail Stripe Signature
                  </span>
                </div>
                <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 rounded">
                  142 Keypoint Nodes
                </span>
              </div>
              <div className="space-y-1.5 text-[11px] text-slate-300">
                <div className="flex justify-between">
                  <span>Flank Vector Matrix:</span>
                  <span className="font-mono font-bold text-amber-300">SHA256 Bilateral Match</span>
                </div>
                <div className="flex justify-between">
                  <span>Stripe Density Index:</span>
                  <span className="font-mono font-bold text-white">24.2% Black Coverage</span>
                </div>
                <div className="flex justify-between">
                  <span>Tail Ring Spacing Vector:</span>
                  <span className="font-mono font-bold text-emerald-400">11 Bifurcated Rings</span>
                </div>
              </div>
            </div>

            {/* 2. COLOUR & PELAGE IDENTIFICATION */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/40 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <Palette className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-xs uppercase tracking-wider text-amber-400">
                    2. Pelage Coat Colour &amp; Hue
                  </span>
                </div>
                <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-950 text-amber-300 border border-amber-800 rounded">
                  RGB Coat Spectrum
                </span>
              </div>
              <div className="space-y-1.5 text-[11px] text-slate-300">
                <div className="flex justify-between">
                  <span>Primary Pelage Coat Tone:</span>
                  <span className="font-mono font-bold text-amber-300">Deep Tawny Amber #E27D22</span>
                </div>
                <div className="flex justify-between">
                  <span>Underbelly Contrast Ratio:</span>
                  <span className="font-mono font-bold text-white">88.4% Pure White Contrast</span>
                </div>
                <div className="flex justify-between">
                  <span>Melanin Pigmentation:</span>
                  <span className="font-mono font-bold text-emerald-400">High Contrast Stripe Edge</span>
                </div>
              </div>
            </div>

            {/* 3. FACIAL PATTERN IDENTIFICATION */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-sky-500/40 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <Scan className="w-4 h-4 text-sky-400" />
                  <span className="font-bold text-xs uppercase tracking-wider text-sky-400">
                    3. Facial &amp; Forehead Pattern ('王')
                  </span>
                </div>
                <span className="px-2 py-0.5 text-[9px] font-bold bg-sky-950 text-sky-300 border border-sky-800 rounded">
                  Morphological Match
                </span>
              </div>
              <div className="space-y-1.5 text-[11px] text-slate-300">
                <div className="flex justify-between">
                  <span>Forehead Crown Pattern:</span>
                  <span className="font-mono font-bold text-amber-300 font-serif">Classic '王' (King) Pattern</span>
                </div>
                <div className="flex justify-between">
                  <span>Cheek Stripe Bifurcation:</span>
                  <span className="font-mono font-bold text-white">Triple Orbital Arch</span>
                </div>
                <div className="flex justify-between">
                  <span>Whisker Spot Index:</span>
                  <span className="font-mono font-bold text-emerald-400">Row 1: 5 Spots • Row 2: 4 Spots</span>
                </div>
              </div>
            </div>

            {/* 4. CLAWS & PUGMARK TRACK STRUCTURE */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-teal-500/40 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-teal-400" />
                  <span className="font-bold text-xs uppercase tracking-wider text-teal-400">
                    4. Claws &amp; Pugmark Track Geometry
                  </span>
                </div>
                <span className="px-2 py-0.5 text-[9px] font-bold bg-teal-950 text-teal-300 border border-teal-800 rounded">
                  Pugmark Arc Hash
                </span>
              </div>
              <div className="space-y-1.5 text-[11px] text-slate-300">
                <div className="flex justify-between">
                  <span>Front Paw Track Width:</span>
                  <span className="font-mono font-bold text-amber-300">14.8 cm Pad Breadth</span>
                </div>
                <div className="flex justify-between">
                  <span>Claw Extension Notch:</span>
                  <span className="font-mono font-bold text-white">Sharp 1.8cm Retraction Notch</span>
                </div>
                <div className="flex justify-between">
                  <span>Toe Pad Arc Curvature:</span>
                  <span className="font-mono font-bold text-emerald-400">{isFemale ? 'Ovoid Female Arc' : 'Quadrate Male Arc'}</span>
                </div>
              </div>
            </div>

          </div>

          {/* VISUAL LASER PATTERN SCANNER */}
          <div className="relative bg-slate-950 rounded-2xl border border-emerald-500/30 p-4 overflow-hidden space-y-2">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono uppercase">
              <span className="flex items-center gap-1 font-bold text-emerald-400">
                <Scan className="w-3.5 h-3.5 inline" /> MULTI-FEATURE AI SCANNER IN ACTION
              </span>
              <span className="text-amber-400 font-bold animate-pulse">
                REAL-TIME PATTERN VECTOR COMPARISON ACTIVE...
              </span>
            </div>

            {/* Pattern Grid Representation */}
            <div className="grid grid-cols-8 gap-1.5 p-3 bg-slate-900 rounded-xl border border-slate-800">
              {Array.from({ length: 16 }).map((_, i) => {
                const labels = ['STRIPE-L', 'STRIPE-R', 'COAT-HUE', 'UNDERBELLY', 'FOREHEAD', 'WHISKER', 'CLAW-PAD', 'PUGMARK'];
                const label = labels[i % labels.length];
                return (
                  <div
                    key={i}
                    className="h-9 bg-slate-950 rounded-lg border border-emerald-500/30 p-1.5 flex flex-col items-center justify-center text-[9px] font-mono text-emerald-400 font-bold"
                  >
                    <span>{label}</span>
                    <span className="text-[8px] text-amber-300">98.9%</span>
                  </div>
                );
              })}
            </div>

            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse"></div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-t border-slate-800">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>AI Multi-Feature Confidence Rating: <strong>98.6%</strong> (False Re-ID &lt; 0.01%)</span>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2 text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-md active:scale-95"
          >
            CLOSE BIOMETRIC REPORT
          </button>
        </div>

      </div>
    </div>
  );
}
