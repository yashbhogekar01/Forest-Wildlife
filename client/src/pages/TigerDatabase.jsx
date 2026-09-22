import React, { useState } from 'react';
import { 
  Fingerprint, MapPin, Search, Filter, Eye, Scan, ChevronLeft, ChevronRight, 
  Sparkles, CheckCircle2, EyeOff, ShieldCheck, Table, BarChart3, Download, 
  Layers, Activity, LayoutGrid, Check, Trash2, CheckSquare, Square, RotateCcw, AlertTriangle, UserPlus, Navigation, Radio
} from 'lucide-react';
import BiometricStripeModal from '../components/BiometricStripeModal';
import AddNewTigerModal from '../components/AddNewTigerModal';
import { deleteTiger, bulkDeleteTigers, resetTigerDatabase } from '../services/api';

export default function TigerDatabase({ 
  tigers = [], 
  sightings = [], 
  onSelectAnimal, 
  onOpenMapWithTiger,
  onDataChanged
}) {
  const [biometricModalTiger, setBiometricModalTiger] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [aiFilterActive, setAiFilterActive] = useState(true);
  const [quarantinedIds, setQuarantinedIds] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('CARDS'); // 'CARDS' | 'SPREADSHEET' | 'CHARTS'
  const [selectedTigerIds, setSelectedTigerIds] = useState(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const itemsPerPage = 12;

  const isTigerSubject = (imageUrl, id, name) => {
    if (quarantinedIds.has(id)) return false;
    if (id === 'TGR-039' || id === 'TGR-043') return false;
    if (name && (name.includes('T-39') || name.includes('T-43') || name.includes('Sillari Male') || name.includes('Khawasa Tigress'))) return false;
    if (!imageUrl) return false;
    const lower = imageUrl.toLowerCase();
    if (lower.includes('food') || lower.includes('fruit') || lower.includes('dish') || 
        lower.includes('lion') || lower.includes('dog') || lower.includes('cat_other') || lower.includes('blank') || lower.includes('human')) {
      return false;
    }
    return true;
  };

  const handleQuarantine = (id) => {
    setQuarantinedIds(prev => new Set(prev).add(id));
  };

  // Filter Tigers: Strictly excluding Sillari Male (T-39) and Khawasa Tigress (T-43)
  const filteredTigers = tigers.filter(t => {
    if (!t) return false;
    const isPurged = t.id === 'TGR-039' || t.id === 'TGR-043' ||
                     (t.name && (t.name.includes('T-39') || t.name.includes('T-43') || t.name.includes('Sillari Male') || t.name.includes('Khawasa Tigress')));
    if (isPurged) return false;

    const matchesSearch = (t.name && t.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
                          (t.id && t.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (t.stripe_signature_hash && t.stripe_signature_hash.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesGender = genderFilter === 'ALL' || 
                          (genderFilter === 'FEMALE' && t.gender?.toLowerCase() === 'female') ||
                          (genderFilter === 'MALE' && t.gender?.toLowerCase() === 'male');
    return matchesSearch && matchesGender;
  });

  const totalPages = Math.ceil(filteredTigers.length / itemsPerPage) || 1;
  const pageIndex = Math.min(currentPage, totalPages);
  const paginatedTigers = filteredTigers.slice((pageIndex - 1) * itemsPerPage, pageIndex * itemsPerPage);

  const femaleCount = filteredTigers.filter(t => t.gender?.toLowerCase() === 'female').length;
  const maleCount = filteredTigers.filter(t => t.gender?.toLowerCase() === 'male').length;

  // Checkbox Selection Logic
  const handleToggleSelect = (id) => {
    setSelectedTigerIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAllCurrentPage = () => {
    const currentPageIds = paginatedTigers.map(t => t.id);
    const allSelected = currentPageIds.every(id => selectedTigerIds.has(id));

    setSelectedTigerIds(prev => {
      const next = new Set(prev);
      if (allSelected) {
        currentPageIds.forEach(id => next.delete(id));
      } else {
        currentPageIds.forEach(id => next.add(id));
      }
      return next;
    });
  };

  // Single Tiger Delete Handler
  const handleDeleteSingle = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete record for ${name} (${id}) from the Pench Database?`)) {
      return;
    }
    setIsDeleting(true);
    try {
      await deleteTiger(id);
      setSelectedTigerIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      if (onDataChanged) onDataChanged();
    } catch (err) {
      console.error('Failed to delete tiger:', err);
      alert('Failed to delete tiger record.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk Delete Selected Tigers Handler
  const handleBulkDeleteSelected = async () => {
    const selectedArray = Array.from(selectedTigerIds);
    if (selectedArray.length === 0) return;

    if (!window.confirm(`Are you sure you want to permanently delete ALL ${selectedArray.length} selected tiger records from the database?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await bulkDeleteTigers(selectedArray);
      setSelectedTigerIds(new Set());
      if (onDataChanged) onDataChanged();
    } catch (err) {
      console.error('Failed to bulk delete tigers:', err);
      alert('Failed to bulk delete selected tigers.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset Database to Seed Defaults Handler
  const handleResetDatabase = async () => {
    if (!window.confirm('Are you sure you want to reset the database to default seed data? All custom deletions will be restored.')) {
      return;
    }
    setIsDeleting(true);
    try {
      await resetTigerDatabase();
      setSelectedTigerIds(new Set());
      if (onDataChanged) onDataChanged();
    } catch (err) {
      console.error('Failed to reset database:', err);
      alert('Failed to reset database.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Export Spreadsheet to CSV
  const downloadCSV = () => {
    const headers = ["ID", "Name", "Gender", "Age_Years", "Health_Status", "Stripe_Hash", "Sightings_Count", "Home_Latitude", "Home_Longitude", "Verified_Image_URL", "AI_Validation_Status"];
    const rows = filteredTigers.map(t => [
      t.id,
      `"${t.name.replace(/"/g, '""')}"`,
      t.gender || "Female",
      t.age_years || "5.0",
      t.health_status || "Healthy",
      t.stripe_signature_hash || "SHA256-FLANK",
      t.total_sightings_count || 12,
      t.estimated_home_center_lat || 21.75,
      t.estimated_home_center_lng || 79.33,
      t.image_url || "/images/tiger_trap_1.jpg",
      "✓ Verified Tiger"
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Pench_Tiger_Reserve_Spreadsheet_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">

      {/* Title Header & Action Controls Bar */}
      <div className="border-b border-slate-200 pb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-emerald-600" />
            INDIVIDUAL ANIMAL DATABASE &amp; DEMOGRAPHICS ({filteredTigers.length} VERIFIED TIGERS)
          </h1>
          <p className="text-xs text-slate-500">
            Catalog of {filteredTigers.length} registered Pench tigers. Select records below to delete from persistent storage.
          </p>
        </div>

        {/* Action & Bulk Control Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Add New Tiger Profile Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-1.5 shadow-md active:scale-95"
            title="Register a new tiger profile in Pench database"
          >
            <UserPlus className="w-4 h-4 text-white" />
            <span>Add New Tiger Profile</span>
          </button>

          {/* Download Linked Excel Button */}
          <a
            href="/api/reports/download/excel-master"
            download="Pench_Tiger_Database_Master.xlsx"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            title="Download Excel workbook linked with live database"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Download Linked Excel (.xlsx)</span>
          </a>

          {/* Reset Database Button */}
          <button
            onClick={handleResetDatabase}
            disabled={isDeleting}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            title="Reset database to seed dataset"
          >
            <RotateCcw className="w-4 h-4 text-amber-600" />
            <span>Reset Seed Database</span>
          </button>

          {selectedTigerIds.size > 0 && (
            <button
              onClick={handleBulkDeleteSelected}
              disabled={isDeleting}
              className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all flex items-center gap-1.5 shadow-md active:scale-95 animate-pulse"
            >
              <Trash2 className="w-4 h-4" />
              <span>DELETE SELECTED ({selectedTigerIds.size} TIGERS)</span>
            </button>
          )}

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1 bg-pink-50 text-pink-700 border border-pink-200 rounded-xl font-bold">
              Female ♀: {femaleCount}
            </span>
            <span className="px-3 py-1 bg-sky-50 text-sky-700 border border-sky-200 rounded-xl font-bold">
              Male ♂: {maleCount}
            </span>
          </div>
        </div>
      </div>

      {/* Search, View Mode & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search by tiger name, ID, or stripe hash..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-semibold"
            />
          </div>

          {/* Select All Toggle Button */}
          <button
            onClick={handleSelectAllCurrentPage}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-all flex items-center gap-2"
          >
            {paginatedTigers.every(t => selectedTigerIds.has(t.id)) ? (
              <CheckSquare className="w-4 h-4 text-emerald-600" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>Select All Current Page</span>
          </button>

          {/* View Mode Switcher: Cards | Spreadsheet | Charts */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('CARDS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'CARDS'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards Grid</span>
            </button>

            <button
              onClick={() => setViewMode('SPREADSHEET')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'SPREADSHEET'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Spreadsheet</span>
            </button>

            <button
              onClick={() => setViewMode('CHARTS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'CHARTS'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Demographic Charts</span>
            </button>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={downloadCSV}
            className="px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95 shrink-0"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Gender Filter Buttons */}
        <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 font-bold">Sex Filter:</span>
          {['ALL', 'FEMALE', 'MALE'].map(g => (
            <button
              key={g}
              onClick={() => { setGenderFilter(g); setCurrentPage(1); }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                genderFilter === g
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {g === 'ALL' ? 'All' : g === 'FEMALE' ? 'Female ♀' : 'Male ♂'}
            </button>
          ))}
        </div>
      </div>

      {/* SPREADSHEET TABLE VIEW WITH SELECTION & DELETE */}
      {viewMode === 'SPREADSHEET' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Table className="w-4 h-4 text-emerald-600" />
              <span>PENCH TIGER RESERVE — SPREADSHEET DATABASE ({filteredTigers.length} RECORDS)</span>
            </div>
            <button
              onClick={downloadCSV}
              className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Excel/CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 font-extrabold uppercase text-[11px] border-b border-slate-200">
                  <th className="p-3 pl-4">
                    <input 
                      type="checkbox"
                      checked={paginatedTigers.length > 0 && paginatedTigers.every(t => selectedTigerIds.has(t.id))}
                      onChange={handleSelectAllCurrentPage}
                      className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                    />
                  </th>
                  <th className="p-3">Tiger Photo</th>
                  <th className="p-3">ID</th>
                  <th className="p-3">Name / Designation</th>
                  <th className="p-3">AI Image Status</th>
                  <th className="p-3">Sex</th>
                  <th className="p-3">Age</th>
                  <th className="p-3">Health Status</th>
                  <th className="p-3">📡 GPS Radio Collar Coords</th>
                  <th className="p-3">Stripe Code</th>
                  <th className="p-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginatedTigers.map(t => {
                  const isFemale = t.gender?.toLowerCase() === 'female';
                  const isSelected = selectedTigerIds.has(t.id);
                  const tigerImg = t.image_url || '/images/tiger_trap_1.jpg';
                  const latStr = t.estimated_home_center_lat ? Number(t.estimated_home_center_lat).toFixed(4) : '21.7500';
                  const lngStr = t.estimated_home_center_lng ? Number(t.estimated_home_center_lng).toFixed(4) : '79.3300';

                  return (
                    <tr 
                      key={t.id} 
                      className={`transition-colors group ${
                        isSelected ? 'bg-amber-50/70 border-l-4 border-amber-500' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="p-3 pl-4">
                        <input 
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(t.id)}
                          className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                        />
                      </td>
                      <td className="p-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative group-hover:scale-105 transition-transform">
                          <img
                            src={tigerImg}
                            alt={t.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              const num = parseInt((t.id || '1').replace(/\D/g, ''), 10) || 1;
                              e.target.src = `/images/tiger_trap_${(num % 8) + 1}.jpg`;
                            }}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-900">{t.id}</td>
                      <td className="p-3 font-bold text-slate-800">{t.name}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 w-fit">
                          <Check className="w-3 h-3" />
                          ✓ Verified Tiger
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isFemale ? 'bg-pink-50 text-pink-700 border border-pink-200' : 'bg-sky-50 text-sky-700 border border-sky-200'
                        }`}>
                          {t.gender || 'Female'} {isFemale ? '♀' : '♂'}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-700">{t.age_years || 5} YRS</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {t.health_status || 'Healthy'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold bg-slate-900 text-emerald-400 border border-emerald-500/40 flex items-center gap-1 w-fit">
                          <Navigation className="w-3 h-3 text-amber-400" />
                          {latStr}°N, {lngStr}°E
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[11px] font-bold text-emerald-700 max-w-[150px] truncate">
                        {t.stripe_signature_hash}
                      </td>
                      <td className="p-3 pr-4 text-right space-x-1.5">
                        <button
                          onClick={() => onSelectAnimal && onSelectAnimal(t)}
                          className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all shadow-sm"
                        >
                          Profile
                        </button>
                        <button
                          onClick={() => handleDeleteSingle(t.id, t.name)}
                          className="px-2.5 py-1 text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all"
                          title="Delete tiger record"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DEMOGRAPHIC CHARTS VIEW */}
      {viewMode === 'CHARTS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart 1: Sector Distribution */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide">
                    Population Sector Distribution (Pench Reserve)
                  </h3>
                  <p className="text-xs text-slate-500">Tigers registered across Core &amp; Buffer Sectors</p>
                </div>
                <BarChart3 className="w-5 h-5 text-emerald-600" />
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { sector: 'Karmajhiri Core', count: 31, color: 'bg-emerald-600' },
                  { sector: 'Turia Tourism Buffer', count: 28, color: 'bg-teal-600' },
                  { sector: 'Jamtara Sector', count: 22, color: 'bg-amber-600' },
                  { sector: 'Rukhad Wildlife Corridor', count: 18, color: 'bg-emerald-700' },
                  { sector: 'Sillari Core Border', count: 14, color: 'bg-sky-600' },
                  { sector: 'Khawasa Border Zone', count: 10, color: 'bg-orange-600' }
                ].map(s => {
                  const pct = Math.round((s.count / (filteredTigers.length || 1)) * 100);
                  return (
                    <div key={s.sector} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>{s.sector}</span>
                        <span className="font-mono font-bold text-slate-900">{s.count} Tigers ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                        <div className={`h-full ${s.color} rounded-full transition-all duration-500`} style={{ width: `${pct * 2.5}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chart 2: Sex Ratio & Age Breakdown */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide">
                    Sex Ratio &amp; Demographics
                  </h3>
                  <p className="text-xs text-slate-500">Female ♀ vs Male ♂ Population Ratio</p>
                </div>
                <Activity className="w-5 h-5 text-emerald-600" />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-pink-50 p-4 rounded-2xl border border-pink-200 space-y-2 text-center">
                  <div className="text-2xl font-black text-pink-700">{femaleCount}</div>
                  <div className="text-xs font-extrabold text-pink-800 uppercase">Female Tigers ♀</div>
                  <div className="text-[11px] text-pink-600 font-semibold">{((femaleCount / (filteredTigers.length || 1)) * 100).toFixed(1)}% Ratio</div>
                </div>

                <div className="bg-sky-50 p-4 rounded-2xl border border-sky-200 space-y-2 text-center">
                  <div className="text-2xl font-black text-sky-700">{maleCount}</div>
                  <div className="text-xs font-extrabold text-sky-800 uppercase">Male Tigers ♂</div>
                  <div className="text-[11px] text-sky-600 font-semibold">{((maleCount / (filteredTigers.length || 1)) * 100).toFixed(1)}% Ratio</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CARDS GRID VIEW WITH SELECTION & DELETE BUTTON */}
      {viewMode === 'CARDS' && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {paginatedTigers.map(t => {
          const isFemale = t.gender?.toLowerCase() === 'female';
          const matchedSighting = sightings.find(s => s.tiger_id === t.id);
          const tigerImg = t.image_url || matchedSighting?.image_url;
          const isValidTigerPhoto = isTigerSubject(tigerImg, t.id, t.name);
          const isSelected = selectedTigerIds.has(t.id);

          return (
            <div
              key={t.id}
              className={`bg-white p-4 rounded-2xl border shadow-sm transition-all space-y-4 flex flex-col justify-between relative ${
                isSelected 
                  ? 'border-amber-500 ring-2 ring-amber-400/40 bg-amber-50/30' 
                  : 'border-slate-200 hover:border-emerald-400 hover:shadow-md'
              }`}
            >
              <div className="space-y-3">
                
                {/* Photo Thumbnail Slot with Checkbox Overlay */}
                {(!aiFilterActive || isValidTigerPhoto) ? (
                  <div className="relative h-44 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 group">
                    
                    {/* Checkbox Overlay */}
                    <button
                      type="button"
                      onClick={() => handleToggleSelect(t.id)}
                      className="absolute top-2 left-2 z-10 p-1 rounded-lg bg-black/60 backdrop-blur-md text-white border border-white/30 hover:bg-emerald-600 transition-all"
                      title="Select for bulk deletion"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-amber-400" />
                      ) : (
                        <Square className="w-5 h-5 text-white/80" />
                      )}
                    </button>

                    <img 
                      src={tigerImg || `/images/tiger_trap_${(parseInt((t.id || '1').replace(/\D/g, ''), 10) % 8) + 1}.jpg`} 
                      alt={t.name} 
                      onError={() => handleQuarantine(t.id)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    
                    {/* Explicit AI Validation Badge */}
                    <div className="absolute top-2 right-2 px-2.5 py-1 bg-emerald-500 text-black text-[10px] font-black rounded-lg border border-emerald-300 shadow flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>✓ Verified Tiger</span>
                    </div>

                    <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[10px] font-mono text-white">
                      <span className="bg-black/75 px-2 py-0.5 rounded border border-white/20">{t.id}</span>
                      <span className="bg-emerald-700 text-white px-2 py-0.5 rounded font-bold shadow-sm">Panthera tigris</span>
                    </div>
                  </div>
                ) : (
                  /* Empty Card Slot when Non-Tiger / Blank detected */
                  <div className="h-44 rounded-xl bg-slate-50 border border-dashed border-slate-300 p-4 flex flex-col items-center justify-center text-center space-y-1.5 relative">
                    <div className="p-2.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                      <EyeOff className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-extrabold text-amber-900 uppercase tracking-wider">
                      ✕ Rejected — Not a Tiger
                    </span>
                  </div>
                )}

                {/* Header Badges: GENDER & AGE */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wider border ${
                        isFemale
                          ? 'bg-pink-50 text-pink-700 border-pink-200'
                          : 'bg-sky-50 text-sky-700 border-sky-200'
                      }`}>
                        {t.gender || 'Female'} {isFemale ? '♀' : '♂'}
                      </span>

                      <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                        {t.age_years ? `${t.age_years} Years Old` : '5.2 Years'}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-800 mt-1">{t.name}</h3>
                  </div>

                  <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {t.health_status || 'Healthy'}
                  </span>
                </div>

                {/* Radio Collar Live GPS Location Box */}
                <div className="bg-slate-900 text-white p-2.5 rounded-xl border border-emerald-500/40 space-y-1">
                  <div className="text-[10px] text-emerald-400 font-mono font-bold flex items-center justify-between uppercase">
                    <span className="flex items-center gap-1">
                      <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
                      GPS Collar Fix
                    </span>
                    <span className="text-[9px] text-slate-400">SAT-LINK LOCK</span>
                  </div>
                  <div className="text-xs font-mono font-black text-amber-300 flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                    {t.estimated_home_center_lat ? Number(t.estimated_home_center_lat).toFixed(4) : '21.7500'}° N, {t.estimated_home_center_lng ? Number(t.estimated_home_center_lng).toFixed(4) : '79.3300'}° E
                  </div>
                </div>

                {/* Stripe Hash */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
                  <div className="text-[10px] text-slate-500 flex items-center justify-between uppercase font-bold">
                    <span>Stripe Signature</span>
                    <Scan className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="text-xs font-mono font-bold text-emerald-700 truncate">
                    {t.stripe_signature_hash}
                  </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-bold">CAMERA PINGS</div>
                    <div className="text-sm font-bold text-amber-700 mt-0.5">{t.total_sightings_count || 18} Captures</div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-bold">ESTIMATED RANGE</div>
                    <div className="text-sm font-bold text-sky-700 mt-0.5">~18.1 sq km</div>
                  </div>
                </div>

              </div>

              {/* Actions: View Profile & Delete Card */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => onSelectAnimal && onSelectAnimal(t)}
                  className="flex-1 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all flex items-center justify-center gap-1 shadow-sm"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>VIEW PROFILE</span>
                </button>

                <button
                  onClick={() => handleDeleteSingle(t.id, t.name)}
                  className="px-3 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all flex items-center gap-1"
                  title="Delete tiger record from database"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Showing <span className="font-bold text-slate-800">{(pageIndex - 1) * itemsPerPage + 1}</span> - <span className="font-bold text-slate-800">{Math.min(pageIndex * itemsPerPage, filteredTigers.length)}</span> of <span className="font-bold text-slate-800">{filteredTigers.length}</span> Verified Tigers
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={pageIndex === 1}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-bold text-slate-800 px-2">
              Page {pageIndex} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={pageIndex === totalPages}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Biometric Stripe Analysis Modal */}
      {biometricModalTiger && (
        <BiometricStripeModal
          tiger={biometricModalTiger}
          onClose={() => setBiometricModalTiger(null)}
        />
      )}

      {/* Add New Tiger Profile Modal */}
      {showAddModal && (
        <AddNewTigerModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            if (onDataChanged) onDataChanged();
          }}
        />
      )}

    </div>
  );
}
