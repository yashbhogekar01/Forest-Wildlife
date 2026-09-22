import React from 'react';
import { Camera, Sparkles, Scan, Crosshair } from 'lucide-react';

export default function FloatingIdentifyButton({ onClick }) {
  return (
    <div className="fixed bottom-6 right-6 z-40 group font-sans">
      {/* Outer Glowing Pulsing Ring */}
      <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-full blur-md opacity-85 group-hover:opacity-100 animate-pulse transition duration-500"></div>

      {/* Floating Action Button */}
      <button
        onClick={onClick}
        type="button"
        className="relative px-5 py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:via-orange-400 hover:to-amber-500 text-slate-950 rounded-full font-black text-xs uppercase tracking-wider flex items-center gap-2.5 shadow-[0_0_30px_rgba(249,115,22,0.85)] border-2 border-orange-200 transition-all duration-300 transform group-hover:scale-105 active:scale-95 cursor-pointer"
        title="Open AI Tiger Photo Identification & Match System"
      >
        <div className="p-1.5 bg-slate-950 text-orange-400 rounded-full shadow-inner flex items-center justify-center">
          <Camera className="w-4 h-4 text-orange-400 group-hover:rotate-12 transition-transform duration-300" />
        </div>

        <span className="font-extrabold tracking-widest text-slate-950 flex items-center gap-1.5">
          <span>AI TIGER IDENTIFY</span>
          <Sparkles className="w-3.5 h-3.5 text-slate-950 animate-bounce" />
        </span>

        {/* Live Status Radar Pill */}
        <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-950/80 text-orange-300 text-[9px] font-mono border border-orange-400/40">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping"></span>
          READY
        </span>
      </button>
    </div>
  );
}
