import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, MapPin, Maximize2, Compass, Eye, Shield, Radio, Navigation, Zap } from 'lucide-react';

export default function MapComponent({
  stations = [],
  sightings = [],
  tigers = [],
  selectedTigerId = null,
  onSelectAnimal = null,
  height = "500px",
  showWeatherOverlay = true,
  weather = null
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);

  // Basemap type: 'satellite' | 'topo' | 'dark' | 'street'
  const [activeBasemap, setActiveBasemap] = useState('satellite');

  const [layers, setLayers] = useState({
    liveGps: true,
    stations: true,
    sightings: true,
    homeRanges: true,
    trajectories: true,
    hydrology: true,
    bufferZone: true,
  });

  const layerGroupsRef = useRef({
    liveGps: null,
    stations: null,
    sightings: null,
    homeRanges: null,
    trajectories: null,
    hydrology: null,
    bufferZone: null,
  });

  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.aA53nN0vji4mVoW3vi402Q';

  // Basemap Tile URLs
  const basemaps = {
    mapbox: {
      name: '🗺️ Mapbox Satellite HD',
      url: `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`,
      attribution: '&copy; Mapbox'
    },
    mapbox_outdoors: {
      name: '🌲 Mapbox Outdoors GIS',
      url: `https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`,
      attribution: '&copy; Mapbox'
    },
    satellite: {
      name: '📡 ESRI Satellite',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri'
    },
    topo: {
      name: '⛰️ Topo Terrain',
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: 'OpenTopoMap'
    },
    dark: {
      name: '🌙 Tactical Dark',
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: 'CARTO'
    },
    street: {
      name: '🗺️ OpenStreet',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: 'OpenStreetMap'
    }
  };

  const switchBasemap = (type) => {
    setActiveBasemap(type);
    if (mapInstanceRef.current && tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
      const newConfig = basemaps[type] || basemaps.satellite;
      tileLayerRef.current = L.tileLayer(newConfig.url, {
        maxZoom: 19,
        attribution: newConfig.attribution
      }).addTo(mapInstanceRef.current);
    }
  };

  const resetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds([
        [21.6000, 79.1500],
        [21.9000, 79.5000]
      ], { padding: [20, 20], duration: 1.2 });
    }
  };

  useEffect(() => {
    window.inspectAnimalTrigger = (tigerId) => {
      if (onSelectAnimal && tigers.length > 0) {
        const found = tigers.find(t => t.id === tigerId);
        if (found) onSelectAnimal(found);
      }
    };
    return () => {
      delete window.inspectAnimalTrigger;
    };
  }, [tigers, onSelectAnimal]);

  // Handle zooming directly to selected tiger's live position
  useEffect(() => {
    if (selectedTigerId && mapInstanceRef.current && tigers.length > 0) {
      const tiger = tigers.find(t => t.id === selectedTigerId);
      if (tiger) {
        // Find latest sighting or home center
        const tigerPings = sightings.filter(s => s.tiger_id === tiger.id && s.latitude && s.longitude);
        const latestPing = tigerPings[0];
        const lat = latestPing?.latitude || tiger.estimated_home_center_lat || 21.7500;
        const lng = latestPing?.longitude || tiger.estimated_home_center_lng || 79.3300;

        mapInstanceRef.current.flyTo([lat, lng], 13, { duration: 1.2 });
      }
    }
  }, [selectedTigerId, tigers, sightings]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet Map
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [21.7500, 79.3300],
        zoom: 11,
        zoomControl: true,
        attributionControl: false
      });

      const config = basemaps.satellite;
      tileLayerRef.current = L.tileLayer(config.url, {
        maxZoom: 19,
        attribution: config.attribution
      }).addTo(map);

      // Create Layer Groups
      layerGroupsRef.current.hydrology = L.layerGroup().addTo(map);
      layerGroupsRef.current.bufferZone = L.layerGroup().addTo(map);
      layerGroupsRef.current.homeRanges = L.layerGroup().addTo(map);
      layerGroupsRef.current.trajectories = L.layerGroup().addTo(map);
      layerGroupsRef.current.stations = L.layerGroup().addTo(map);
      layerGroupsRef.current.sightings = L.layerGroup().addTo(map);
      layerGroupsRef.current.liveGps = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing layers
    Object.values(layerGroupsRef.current).forEach(group => group && group.clearLayers());

    // 1. HYDROLOGY LAYER: Pench River & Totladoh Reservoir Lake
    if (layers.hydrology && layerGroupsRef.current.hydrology) {
      const penchRiverCoords = [
        [21.890, 79.240],
        [21.850, 79.280],
        [21.810, 79.310],
        [21.770, 79.335],
        [21.730, 79.350],
        [21.680, 79.370],
        [21.620, 79.380]
      ];

      const penchRiver = L.polyline(penchRiverCoords, {
        color: '#38bdf8',
        weight: 4,
        opacity: 0.85,
        smoothFactor: 1
      }).bindTooltip('<div class="font-mono text-xs font-bold text-sky-400">PENCH RIVER</div>');

      const totladohLakeCoords = [
        [21.745, 79.300],
        [21.765, 79.325],
        [21.750, 79.345],
        [21.725, 79.335],
        [21.715, 79.310]
      ];

      const totladohLake = L.polygon(totladohLakeCoords, {
        color: '#0284c7',
        weight: 2,
        fillColor: '#0284c7',
        fillOpacity: 0.45
      }).bindTooltip('<div class="font-mono text-xs font-bold text-sky-300">TOTLADOH RESERVOIR</div>');

      layerGroupsRef.current.hydrology.addLayer(penchRiver);
      layerGroupsRef.current.hydrology.addLayer(totladohLake);
    }

    // 2. BOUNDARIES
    if (layers.bufferZone && layerGroupsRef.current.bufferZone) {
      const corePolygonCoords = [
        [21.84, 79.25],
        [21.85, 79.38],
        [21.78, 79.42],
        [21.68, 79.38],
        [21.65, 79.28],
        [21.72, 79.20]
      ];

      const corePolygon = L.polygon(corePolygonCoords, {
        color: '#10b981',
        weight: 2,
        dashArray: '6, 6',
        fillColor: '#10b981',
        fillOpacity: 0.08
      }).bindTooltip('<div class="font-mono text-xs font-bold text-emerald-400">PENCH CORE SANCTUARY</div>');

      layerGroupsRef.current.bufferZone.addLayer(corePolygon);
    }

    // 2.5 INDIVIDUAL & SEPARATED TIGER TERRITORY ZONES LAYER (Home Ranges)
    if (layers.homeRanges && layerGroupsRef.current.homeRanges && tigers.length > 0) {
      const fallbackColors = ['#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#ec4899', '#14b8a6', '#84cc16'];
      tigers.forEach((tiger, idx) => {
        const isSelected = selectedTigerId === tiger.id;
        
        // If a tiger is selected, only render that tiger's territory zone or highlight it
        if (selectedTigerId && selectedTigerId !== tiger.id) return;

        const lat = tiger.estimated_home_center_lat || 21.7500;
        const lng = tiger.estimated_home_center_lng || 79.3300;
        const radius = tiger.territory_radius_meters || 3200;
        const color = tiger.territory_color || fallbackColors[idx % fallbackColors.length];

        const territoryCircle = L.circle([lat, lng], {
          radius: radius,
          color: color,
          weight: isSelected ? 3 : 1.5,
          dashArray: isSelected ? '0' : '4, 6',
          fillColor: color,
          fillOpacity: isSelected ? 0.28 : 0.12
        });

        const radiusKm = (radius / 1000).toFixed(1);
        territoryCircle.bindTooltip(`
          <div class="font-sans text-xs p-1 space-y-0.5">
            <div class="font-bold text-slate-800">🐅 ${tiger.name}</div>
            <div class="text-[10px] font-bold text-emerald-700">Home Range Territory: ~${radiusKm} km radius</div>
            <div class="text-[9px] text-slate-500 font-mono">Centroid: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E</div>
          </div>
        `, { sticky: true });

        layerGroupsRef.current.homeRanges.addLayer(territoryCircle);
      });
    }

    // 3. CAMERA STATIONS (Small orange/amber dots along trails and riverbanks)
    if (layers.stations && layerGroupsRef.current.stations) {
      stations.forEach(st => {
        let color = '#f97316'; // Small orange/amber dot
        if (st.status === 'Offline') color = '#ef4444';
        if (st.status === 'Maintenance') color = '#eab308';

        const customIcon = L.divIcon({
          className: 'custom-station-icon',
          html: `<div class="relative flex items-center justify-center cursor-pointer group" title="${st.station_name}">
            <div class="w-3.5 h-3.5 rounded-full bg-slate-900 border border-amber-300 flex items-center justify-center shadow-md">
              <div class="w-1.5 h-1.5 rounded-full" style="background-color: ${color}"></div>
            </div>
          </div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });

        const marker = L.marker([st.latitude, st.longitude], { icon: customIcon });
        marker.bindPopup(`
          <div class="font-sans text-xs p-1">
            <div class="font-bold text-amber-900">📷 ${st.station_name}</div>
            <div class="text-[10px] text-slate-600 font-mono">Node ID: ${st.id} • Status: <strong style="color: ${color}">${st.status}</strong></div>
            <div class="text-[10px] text-emerald-700 font-medium">Zone: ${st.zone || 'Pench Sector'}</div>
          </div>
        `);
        layerGroupsRef.current.stations.addLayer(marker);
      });
    }

    // 4. LIVE TIGER GPS COLLAR LOCATION TRACKING LAYER
    if (layers.liveGps && layerGroupsRef.current.liveGps && tigers.length > 0) {
      tigers.forEach(tiger => {
        const tigerPings = sightings.filter(s => s.tiger_id === tiger.id && s.latitude && s.longitude);
        const latestPing = tigerPings[0];
        
        const lat = latestPing?.latitude || tiger.estimated_home_center_lat || 21.7500;
        const lng = latestPing?.longitude || tiger.estimated_home_center_lng || 79.3300;
        const isSelected = selectedTigerId === tiger.id;
        const isFemale = tiger.gender?.toLowerCase() === 'female';

        // Animated Radar GPS Target Icon
        const gpsIcon = L.divIcon({
          className: 'custom-live-gps-target',
          html: `<div class="relative flex items-center justify-center cursor-pointer group">
            <!-- Pulsing outer radar ring -->
            <div class="absolute w-10 h-10 rounded-full border-2 ${isSelected ? 'border-cyan-400 animate-ping' : 'border-amber-400 opacity-60'}"></div>
            <div class="absolute w-6 h-6 rounded-full ${isSelected ? 'bg-cyan-500/30' : 'bg-amber-500/20'} animate-pulse"></div>

            <!-- Central GPS Collar Badge -->
            <div class="relative w-7 h-7 rounded-full border-2 ${isSelected ? 'border-cyan-400 bg-cyan-950' : 'border-amber-400 bg-black'} shadow-2xl overflow-hidden flex items-center justify-center">
              ${latestPing?.image_url 
                ? `<img src="${latestPing.image_url}" class="w-full h-full object-cover" />`
                : `<span class="text-[10px] font-bold text-amber-300">${tiger.name.substring(0, 2)}</span>`
              }
            </div>

            <!-- Live GPS Status Pill -->
            <div class="absolute -bottom-5 px-1.5 py-0.2 bg-black/90 text-white text-[8px] font-mono font-bold rounded border border-command-emerald/50 whitespace-nowrap flex items-center gap-1 shadow">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>${tiger.name.split(' ')[0]} [${isFemale ? '♀' : '♂'} ${tiger.age_years || 5}Y]</span>
            </div>
          </div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });

        const liveMarker = L.marker([lat, lng], { icon: gpsIcon });

        const livePopupHTML = `
          <div class="font-sans p-1 max-w-[220px] space-y-2">
            <div class="flex items-center justify-between border-b border-slate-700 pb-1">
              <span class="font-bold text-white text-xs flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                TIGER LIVE LOCATION
              </span>
              <span class="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                GPS LIVE
              </span>
            </div>

            <div>
              <div class="font-bold text-sm text-amber-400">${tiger.name}</div>
              <div class="text-[10px] font-semibold text-emerald-300">
                ${isFemale ? 'Female ♀' : 'Male ♂'} • ${tiger.age_years || '5.2'} Years Old
              </div>
            </div>

            <div class="bg-black/70 p-2 rounded-lg text-[10px] space-y-1 font-mono text-slate-300">
              <div class="flex justify-between">
                <span class="text-slate-400">Live Coords:</span>
                <span class="text-cyan-300 font-bold">${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Collar Battery:</span>
                <span class="text-emerald-400 font-bold">94% (VHF/GPS)</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Health:</span>
                <span class="text-white">${tiger.health_status || 'Healthy'}</span>
              </div>
            </div>

            <button
              onclick="window.inspectAnimalTrigger('${tiger.id}')"
              class="w-full py-1.5 text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-lg transition-all shadow cursor-pointer"
            >
              VIEW ANIMAL PROFILE
            </button>
          </div>
        `;

        liveMarker.bindPopup(livePopupHTML);

        liveMarker.on('click', () => {
          if (onSelectAnimal) onSelectAnimal(tiger);
        });

        layerGroupsRef.current.liveGps.addLayer(liveMarker);
      });
    }

    // 5. TRAJECTORIES
    if (layers.trajectories && layerGroupsRef.current.trajectories && sightings.length > 0) {
      const sightingsByTiger = {};
      sightings.forEach(s => {
        if (!s.tiger_id || !s.latitude || !s.longitude) return;
        if (!sightingsByTiger[s.tiger_id]) sightingsByTiger[s.tiger_id] = [];
        sightingsByTiger[s.tiger_id].push(s);
      });

      const trajColors = ['#f59e0b', '#06b6d4', '#ec4899', '#10b981', '#a855f7', '#ef4444'];

      Object.entries(sightingsByTiger).forEach(([tigerId, tSightings], idx) => {
        if (selectedTigerId && selectedTigerId !== tigerId) return;

        if (tSightings.length >= 2) {
          const sorted = [...tSightings].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          const coords = sorted.map(s => [s.latitude, s.longitude]);
          const color = trajColors[idx % trajColors.length];

          const trackPolyline = L.polyline(coords, {
            color: color,
            weight: selectedTigerId === tigerId ? 4 : 2.5,
            dashArray: '8, 8',
            opacity: 0.9
          });

          layerGroupsRef.current.trajectories.addLayer(trackPolyline);
        }
      });
    }

  }, [stations, sightings, tigers, layers, selectedTigerId]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm font-sans isolate z-0" style={{ height }}>
      
      {/* Leaflet Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0 bg-slate-100" />

      {/* Floating Basemap Switcher HUD (Top Left) */}
      <div className="absolute top-3 left-3 z-10 bg-white p-2 rounded-xl border border-slate-200 shadow-md flex items-center space-x-1.5">
        {Object.entries(basemaps).map(([type, b]) => (
          <button
            key={type}
            onClick={() => switchBasemap(type)}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
              activeBasemap === type
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            {b.name}
          </button>
        ))}

        <button
          onClick={resetView}
          className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 ml-1"
          title="Reset View to Pench Center"
        >
          <Maximize2 className="w-4 h-4 text-emerald-600" />
        </button>
      </div>

      {/* Map Layer Control HUD (Bottom Left) */}
      <div className="absolute bottom-3 left-3 z-10 bg-white p-3 rounded-xl text-xs border border-slate-200 space-y-2 shadow-md max-w-lg">
        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
          <span className="text-[11px] text-emerald-700 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-emerald-600" /> MAP LAYERS
          </span>
        </div>
        <div className="flex flex-wrap gap-3 text-slate-600 text-xs">
          
          <label className="flex items-center space-x-1.5 cursor-pointer hover:text-slate-900">
            <input
              type="checkbox"
              checked={layers.liveGps}
              onChange={e => setLayers({ ...layers, liveGps: e.target.checked })}
              className="accent-emerald-600 rounded"
            />
            <span className="text-amber-700 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Tiger Live Location
            </span>
          </label>

          <label className="flex items-center space-x-1.5 cursor-pointer hover:text-slate-900">
            <input
              type="checkbox"
              checked={layers.trajectories}
              onChange={e => setLayers({ ...layers, trajectories: e.target.checked })}
              className="accent-sky-600 rounded"
            />
            <span className="text-sky-700 font-semibold">Movement Tracks</span>
          </label>

          <label className="flex items-center space-x-1.5 cursor-pointer hover:text-slate-900">
            <input
              type="checkbox"
              checked={layers.homeRanges}
              onChange={e => setLayers({ ...layers, homeRanges: e.target.checked })}
              className="accent-purple-600 rounded"
            />
            <span className="text-purple-700 font-semibold">Territory Zones</span>
          </label>

          <label className="flex items-center space-x-1.5 cursor-pointer hover:text-slate-900">
            <input
              type="checkbox"
              checked={layers.stations}
              onChange={e => setLayers({ ...layers, stations: e.target.checked })}
              className="accent-emerald-600 rounded"
            />
            <span className="text-emerald-700 font-semibold">Camera Nodes</span>
          </label>

          <label className="flex items-center space-x-1.5 cursor-pointer hover:text-slate-900">
            <input
              type="checkbox"
              checked={layers.hydrology}
              onChange={e => setLayers({ ...layers, hydrology: e.target.checked })}
              className="accent-cyan-600 rounded"
            />
            <span className="text-cyan-700 font-semibold">Pench River & Lake</span>
          </label>

        </div>
      </div>

      {/* Floating Weather Overlay (Top Right) */}
      {showWeatherOverlay && weather && (
        <div className="absolute top-3 right-3 z-10 max-w-xs hidden sm:block">
          <div className="bg-white p-2.5 rounded-xl text-xs border border-slate-200 shadow-md space-y-1">
            <div className="flex items-center justify-between text-[10px] text-emerald-700 font-bold uppercase">
              <span className="flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-600" /> LIVE WEATHER
              </span>
              <span className="bg-emerald-50 px-1.5 py-0.5 rounded text-[9px] text-emerald-700 border border-emerald-200 font-bold">ONLINE</span>
            </div>
            <div className="text-sm font-bold text-slate-800">{weather.temperature_celsius}°C | {weather.conditions}</div>
          </div>
        </div>
      )}

    </div>
  );
}
