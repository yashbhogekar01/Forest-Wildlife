import React, { useState } from 'react';
import { X, UserPlus, Fingerprint, MapPin, Sparkles, Camera, Check, Shield, Upload, ImageIcon } from 'lucide-react';
import { createTiger } from '../services/api';

export default function AddNewTigerModal({ onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('Female');
  const [ageYears, setAgeYears] = useState('4.5');
  const [healthStatus, setHealthStatus] = useState('Healthy');
  const [territory, setTerritory] = useState('Karmajhiri Core');
  const [stripeHash, setStripeHash] = useState(`SHA256-FLANK-L-${Math.floor(Math.random()*16777215).toString(16).toUpperCase()}`);
  const [lat, setLat] = useState('21.7500');
  const [lng, setLng] = useState('79.3300');
  const [imageUrl, setImageUrl] = useState('/images/tiger_trap_1.jpg');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const tigerImageSamples = [
    { name: "Sample Trap 1", url: "/images/tiger_trap_1.jpg" },
    { name: "Sample Trap 2", url: "/images/tiger_trap_2.jpg" },
    { name: "Sample Trap 3", url: "/images/tiger_trap_3.jpg" },
    { name: "Sample Trap 4", url: "/images/tiger_trap_4.jpg" },
    { name: "Sample Trap 5", url: "/images/tiger_trap_5.jpg" },
    { name: "Sample Trap 6", url: "/images/tiger_trap_6.jpg" }
  ];

  // File Upload Handler
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Please enter a valid tiger name/designation.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await createTiger({
        name: name.trim(),
        gender,
        age_years: parseFloat(ageYears) || 4.5,
        health_status: healthStatus,
        territory,
        stripe_signature_hash: stripeHash,
        estimated_home_center_lat: parseFloat(lat) || 21.7500,
        estimated_home_center_lng: parseFloat(lng) || 79.3300,
        image_url: imageUrl
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Error adding new tiger profile:', err);
      setErrorMessage('Failed to create tiger profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans">
      <div className="bg-white w-full max-w-xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-emerald-400">
              <UserPlus className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white uppercase tracking-wider">
                Register New Tiger Profile
              </h2>
              <p className="text-xs text-slate-400">
                Add new Panthera tigris individual to Pench Database
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs text-slate-800">
          
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-medium text-xs">
              {errorMessage}
            </div>
          )}

          {/* Name Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Tiger Name / Designation *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Karmajhiri Sub-adult (T-126)"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
            />
          </div>

          {/* Gender & Age */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Sex / Gender
              </label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
              >
                <option value="Female">Female ♀</option>
                <option value="Male">Male ♂</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Age (Years)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="20"
                value={ageYears}
                onChange={e => setAgeYears(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold font-mono"
              />
            </div>
          </div>

          {/* Health & Territory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Health Condition
              </label>
              <select
                value={healthStatus}
                onChange={e => setHealthStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
              >
                <option value="Healthy">Healthy</option>
                <option value="Prime">Prime</option>
                <option value="Under Observation">Under Observation</option>
                <option value="Pregnant">Pregnant</option>
                <option value="Sub-adult">Sub-adult</option>
                <option value="Injured">Injured</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Territory Sector
              </label>
              <select
                value={territory}
                onChange={e => setTerritory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
              >
                <option value="Karmajhiri Core">Karmajhiri Core</option>
                <option value="Turia Tourism Buffer">Turia Tourism Buffer</option>
                <option value="Jamtara Sector">Jamtara Sector</option>
                <option value="Sillari Core Border">Sillari Core Border</option>
                <option value="Khawasa Border Zone">Khawasa Border Zone</option>
                <option value="Rukhad Wildlife Corridor">Rukhad Wildlife Corridor</option>
              </select>
            </div>
          </div>

          {/* Stripe Pattern Hash Signature */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Stripe Signature Code
            </label>
            <input
              type="text"
              value={stripeHash}
              onChange={e => setStripeHash(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-mono font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Latitude & Longitude */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Home Center Lat (°N)
              </label>
              <input
                type="number"
                step="0.0001"
                value={lat}
                onChange={e => setLat(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Home Center Lng (°E)
              </label>
              <input
                type="number"
                step="0.0001"
                value={lng}
                onChange={e => setLng(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* PHOTO UPLOAD & PRESET SELECTION BOX */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Upload Tiger Photo or Choose Sample
              </label>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                ✓ Verified Panthera tigris Only
              </span>
            </div>

            {/* Direct File Upload Drop Zone */}
            <div className="relative border-2 border-dashed border-emerald-400 bg-emerald-50/40 rounded-2xl p-4 text-center hover:bg-emerald-50 transition-all cursor-pointer">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center justify-center space-y-1.5 pointer-events-none">
                <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-sm">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800">
                  Click to Upload Tiger Photo File from Computer
                </span>
                <span className="text-[10px] text-slate-500">
                  Supports JPG, PNG, WEBP camera trap image files
                </span>
              </div>
            </div>

            {/* Selected Image Preview */}
            {imageUrl && (
              <div className="relative h-32 rounded-2xl overflow-hidden border border-slate-300 bg-slate-100 shadow-inner flex items-center justify-center">
                <img src={imageUrl} alt="Tiger preview" className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-500 text-black text-[10px] font-black rounded-md shadow">
                  Selected Photo Preview
                </div>
              </div>
            )}
            
            {/* Presets Grid */}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Or select from verified preset samples:</span>
              <div className="grid grid-cols-3 gap-2">
                {tigerImageSamples.map(sample => (
                  <button
                    type="button"
                    key={sample.url}
                    onClick={() => setImageUrl(sample.url)}
                    className={`h-16 rounded-xl overflow-hidden border-2 relative transition-all ${
                      imageUrl === sample.url ? 'border-emerald-500 ring-2 ring-emerald-400/40' : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={sample.url} alt={sample.name} className="w-full h-full object-cover" />
                    {imageUrl === sample.url && (
                      <div className="absolute inset-0 bg-emerald-950/40 flex items-center justify-center text-white">
                        <Check className="w-5 h-5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-md active:scale-95 flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isSubmitting ? 'SAVING PROFILE...' : 'SAVE TIGER PROFILE'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
