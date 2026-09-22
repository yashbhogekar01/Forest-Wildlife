import React from 'react';
import { LayoutDashboard, Camera, Fingerprint, Map, AlertTriangle, FileText, Bot, Sparkles, Compass, AlertOctagon, ShieldCheck } from 'lucide-react';

export default function SidebarNav({ activeTab, setActiveTab, activeAlertsCount, onOpenAiAssistant }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'reviews', label: 'Human Review Queue', icon: ShieldCheck, badge: 'Verification', isAlert: true },
    { id: 'tigers', label: 'Animal Database (Age/Sex)', icon: Fingerprint, badge: '125 Tigers' },
    { id: 'occupancy', label: 'Tiger Area Occupancy', icon: Compass, badge: 'Spatial MCP' },
    { id: 'deviation', label: 'Deviation & Trend Intelligence', icon: AlertOctagon, badge: 'Trend AI', isAlert: true },
    { id: 'captures', label: 'Camera Trap Gallery', icon: Camera },
    { id: 'map', label: 'Interactive Satellite Map', icon: Map, badge: 'HD Satellite' },
    { id: 'alerts', label: 'Threat Alerts', icon: AlertTriangle, badge: activeAlertsCount ? `${activeAlertsCount}` : null, isAlert: true },
    { id: 'reports', label: 'Reports & Export', icon: FileText },
  ];

  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col justify-between hidden md:flex shrink-0 h-full overflow-y-auto select-none z-20">
      <div className="py-4">
        <div className="px-4 mb-3">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
            Navigation
          </p>
        </div>

        <nav className="space-y-1 px-2.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 text-[9px] rounded-md font-bold ${
                      item.isAlert && activeAlertsCount > 0
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* AI Intelligence Assistant Navigation Item */}
          <button
            onClick={onOpenAiAssistant}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-amber-900 bg-gradient-to-r from-amber-50 to-emerald-50 border border-amber-300/80 shadow-sm hover:shadow transition-all group mt-2"
          >
            <div className="flex items-center space-x-3">
              <Bot className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform animate-pulse" />
              <span>Maya AI Assistant</span>
            </div>
            <span className="px-1.5 py-0.5 text-[9px] bg-amber-200 text-amber-900 rounded font-bold">
              AI TELEMETRY
            </span>
          </button>
        </nav>
      </div>

      {/* Clean Status Card */}
      <div className="p-3.5 m-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">Pench Reserve</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            ACTIVE
          </span>
        </div>
        <div className="text-[10px] text-slate-500 space-y-0.5">
          <div className="flex justify-between">
            <span>Camera Stations:</span>
            <span className="text-slate-800 font-bold">12 Active Nodes</span>
          </div>
          <div className="flex justify-between">
            <span>Core Area:</span>
            <span className="text-slate-800 font-bold">758 sq km</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
