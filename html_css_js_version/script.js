// Pench Rakshak - Single Page Application Engine (Vanilla JS)

// Mock Dataset
const APP_DATA = {
  tigers: [
    { id: 'T-101', name: 'Rajah', sex: 'Male', territory: 'Core Core Sector (Sillari)', age: '7.5 yrs', stripeMatch: '98.4%', status: 'Normal', sightings: 48, photo: '../client/public/images/tiger_trap_1.jpg' },
    { id: 'T-108', name: 'Choti Tara', sex: 'Female', territory: 'Khawasa Buffer', age: '5.2 yrs', stripeMatch: '96.1%', status: 'Near Village Boundary', alertLevel: 'HIGH', sightings: 34, photo: '../client/public/images/tiger_trap_2.jpg' },
    { id: 'T-112', name: 'Mahavir', sex: 'Male', territory: 'Karmajhiri Range', age: '8.1 yrs', stripeMatch: '99.0%', status: 'Normal', sightings: 52, photo: '../client/public/images/tiger_trap_3.jpg' },
    { id: 'T-115', name: 'Collarwali Jr.', sex: 'Female', territory: 'Turia Zone', age: '4.0 yrs', stripeMatch: '94.8%', status: 'Core Active', sightings: 29, photo: '../client/public/images/tiger_trap_4.jpg' },
    { id: 'T-120', name: 'Bheem', sex: 'Male', territory: 'Gomukh Buffer', age: '6.3 yrs', stripeMatch: '97.2%', status: 'Near Village Boundary', alertLevel: 'WARNING', sightings: 41, photo: '../client/public/images/tiger_trap_5.jpg' }
  ],
  stations: [
    { id: 'CT-101', name: 'Sillari Core Station 1', lat: 21.652, lng: 79.312, battery: 94, status: 'ONLINE', captures: 142 },
    { id: 'CT-102', name: 'Khawasa Buffer Gate 4', lat: 21.685, lng: 79.351, battery: 88, status: 'ONLINE', captures: 98 },
    { id: 'CT-103', name: 'Karmajhiri River Bed', lat: 21.610, lng: 79.280, battery: 76, status: 'ONLINE', captures: 210 },
    { id: 'CT-104', name: 'Turia Meadow Trail', lat: 21.640, lng: 79.330, battery: 91, status: 'ONLINE', captures: 175 },
    { id: 'CT-105', name: 'Gomukh Sector Checkpoint', lat: 21.695, lng: 79.380, battery: 62, status: 'LOW_BATTERY', captures: 84 }
  ],
  alerts: [
    { id: 'ALT-904', tiger_id: 'T-108', tiger_name: 'Choti Tara', village: 'Pipariya Village (800m)', level: 'CRITICAL', status: 'ACTIVE', time: '12 mins ago', details: 'Tiger T-108 detected within 800 meters of village perimeter.' },
    { id: 'ALT-902', tiger_id: 'T-120', tiger_name: 'Bheem', village: 'Khawasa Outer Fringe (1.2km)', level: 'WARNING', status: 'INVESTIGATING', time: '45 mins ago', details: 'Movement vector trending towards human agricultural settlement.' }
  ],
  reviews: [
    { id: 'REV-501', photo: '../client/public/images/tiger_trap_6.jpg', camera: 'CT-103', confidence: '87.4%', candidate: 'T-101 (Rajah)', timestamp: '2026-09-22 14:15' },
    { id: 'REV-502', photo: '../client/public/images/tiger_trap_7.jpg', camera: 'CT-105', confidence: '92.1%', candidate: 'T-120 (Bheem)', timestamp: '2026-09-22 13:40' }
  ]
};

// Global Map & Chart Instances
let leafletMap = null;

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  renderDashboard();
  renderTigers();
  renderCaptures();
  renderAlerts();
  renderReviews();
});

// Tab Switcher
function initTabs() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      const targetTab = item.getAttribute('data-tab');
      document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
      });

      const selectedTabEl = document.getElementById(`tab-${targetTab}`);
      if (selectedTabEl) {
        selectedTabEl.style.display = 'block';
      }

      if (targetTab === 'map') {
        initMap();
      }
    });
  });
}

// Render Dashboard
function renderDashboard() {
  const container = document.getElementById('dashboard-alerts-list');
  if (!container) return;

  container.innerHTML = APP_DATA.alerts.map(a => `
    <div style="padding: 12px; margin-bottom: 8px; border-radius: 8px; background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <strong style="color: #f87171;">${a.level}: ${a.tiger_name} (${a.tiger_id})</strong>
        <p style="font-size: 13px; color: #cbd5e1; margin-top: 4px;">${a.details}</p>
        <span style="font-size: 11px; color: #94a3b8;">Near ${a.village} • ${a.time}</span>
      </div>
      <button class="btn btn-danger" style="padding: 6px 12px; font-size: 12px;" onclick="triggerSiren('${a.tiger_name}')">Dispatch Patrol</button>
    </div>
  `).join('');
}

// Render Tiger Database
function renderTigers() {
  const grid = document.getElementById('tigers-grid');
  if (!grid) return;

  grid.innerHTML = APP_DATA.tigers.map(t => `
    <div class="glass-panel" style="padding: 16px; border-radius: 12px; position: relative;">
      <img src="${t.photo}" style="width: 100%; height: 160px; object-fit: cover; border-radius: 8px;" alt="${t.name}" />
      <div style="margin-top: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="font-size: 18px; color: #fff;">${t.name} (${t.id})</h3>
          <span class="badge ${t.alertLevel === 'HIGH' ? 'badge-rose' : 'badge-emerald'}">${t.sex}</span>
        </div>
        <p style="font-size: 13px; color: #94a3b8; margin-top: 6px;">Territory: ${t.territory}</p>
        <div style="display: flex; justify-content: space-between; margin-top: 10px; font-size: 12px; color: #cbd5e1;">
          <span>Match: <strong>${t.stripeMatch}</strong></span>
          <span>Sightings: <strong>${t.sightings}</strong></span>
        </div>
        <button class="btn btn-outline" style="width: 100%; margin-top: 12px; justify-content: center;" onclick="viewTigerDetails('${t.id}')">View Biometric Profile</button>
      </div>
    </div>
  `).join('');
}

// Render Camera Traps
function renderCaptures() {
  const grid = document.getElementById('captures-grid');
  if (!grid) return;

  grid.innerHTML = APP_DATA.tigers.map((t, idx) => `
    <div class="image-card">
      <img src="${t.photo}" alt="Capture ${idx}" />
      <div class="image-card-info">
        <span class="badge badge-emerald">AI Verified: 98%</span>
        <h4 style="margin-top: 6px; color: #fff;">${t.name} (${t.id})</h4>
        <p style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Station: CT-10${idx + 1} • 2026-09-22</p>
      </div>
    </div>
  `).join('');
}

// Render Alerts
function renderAlerts() {
  const tbody = document.getElementById('alerts-table-body');
  if (!tbody) return;

  tbody.innerHTML = APP_DATA.alerts.map(a => `
    <tr>
      <td><strong>${a.id}</strong></td>
      <td>${a.tiger_name} (${a.tiger_id})</td>
      <td><span class="badge ${a.level === 'CRITICAL' ? 'badge-rose' : 'badge-amber'}">${a.level}</span></td>
      <td>${a.village}</td>
      <td><span class="badge badge-blue">${a.status}</span></td>
      <td>${a.time}</td>
      <td><button class="btn btn-outline" style="padding: 4px 10px; font-size: 12px;" onclick="triggerSiren('${a.tiger_name}')">Sound Alarm</button></td>
    </tr>
  `).join('');
}

// Render Human Review Queue
function renderReviews() {
  const container = document.getElementById('review-queue-container');
  if (!container) return;

  container.innerHTML = APP_DATA.reviews.map(r => `
    <div class="glass-panel" style="padding: 16px; display: flex; gap: 16px; margin-bottom: 12px; align-items: center;">
      <img src="${r.photo}" style="width: 120px; height: 90px; object-fit: cover; border-radius: 8px;" />
      <div style="flex: 1;">
        <h4 style="color: #fff;">Sighting Candidate: ${r.candidate}</h4>
        <p style="font-size: 13px; color: #94a3b8; margin-top: 4px;">Camera: ${r.camera} • Confidence: <strong style="color: #34d399;">${r.confidence}</strong></p>
        <span style="font-size: 11px; color: #64748b;">Captured: ${r.timestamp}</span>
      </div>
      <div style="display: flex; gap: 8px;">
        <button class="btn btn-primary" onclick="alert('Confirmed tiger match!')">Confirm Match</button>
        <button class="btn btn-outline" onclick="alert('Flagged for expert review.')">Re-evaluate</button>
      </div>
    </div>
  `).join('');
}

// Interactive Map Initializer (Leaflet.js)
function initMap() {
  if (leafletMap) return;

  const mapContainer = document.getElementById('leaflet-map-element');
  if (!mapContainer) return;

  // Initialize Leaflet map centered at Pench Tiger Reserve
  leafletMap = L.map('leaflet-map-element').setView([21.652, 79.312], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(leafletMap);

  // Add camera trap station markers
  APP_DATA.stations.forEach(s => {
    const marker = L.marker([s.lat, s.lng]).addTo(leafletMap);
    marker.bindPopup(`
      <div style="color: #0f172a; font-family: sans-serif;">
        <strong>${s.name} (${s.id})</strong><br/>
        Status: ${s.status}<br/>
        Captures: ${s.captures}<br/>
        Battery: ${s.battery}%
      </div>
    `);
  });
}

// Siren sound trigger simulation
function triggerSiren(tigerName) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(440, audioContext.currentTime);
  osc.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.5);

  osc.connect(gain);
  gain.connect(audioContext.destination);

  osc.start();
  osc.stop(audioContext.currentTime + 1.2);

  alert(`⚠️ ALARM TRIGGERED! Village Proximity Siren Activated for ${tigerName}. Response Team dispatched.`);
}

// View Tiger Details Modal
function viewTigerDetails(id) {
  const tiger = APP_DATA.tigers.find(t => t.id === id);
  if (!tiger) return;

  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.innerHTML = `
    <div class="modal-content glass-panel">
      <button class="close-btn" onclick="this.closest('.modal-backdrop').remove()">✕</button>
      <div style="display: flex; gap: 16px; align-items: center;">
        <img src="${tiger.photo}" style="width: 140px; height: 140px; object-fit: cover; border-radius: 12px; border: 2px solid #10b981;" />
        <div>
          <h2 style="color: #fff; font-size: 24px;">${tiger.name} (${tiger.id})</h2>
          <p style="color: #34d399; font-size: 14px; margin-top: 2px;">Stripe Biometric Confidence: ${tiger.stripeMatch}</p>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 6px;">Territory: ${tiger.territory}</p>
          <p style="color: #94a3b8; font-size: 13px;">Age: ${tiger.age} • Gender: ${tiger.sex}</p>
        </div>
      </div>
      <div style="margin-top: 20px; padding: 14px; background: rgba(0,0,0,0.4); border-radius: 8px;">
        <h4 style="color: #e2e8f0; font-size: 14px; margin-bottom: 6px;">Recent Telemetry Sighting Logs</h4>
        <p style="font-size: 12px; color: #94a3b8;">• 2026-09-22 14:10: Station CT-101 (Sillari Trail)</p>
        <p style="font-size: 12px; color: #94a3b8;">• 2026-09-21 08:45: Station CT-104 (Turia Waterhole)</p>
      </div>
      <button class="btn btn-primary" style="width: 100%; margin-top: 16px; justify-content: center;" onclick="this.closest('.modal-backdrop').remove()">Close Profile</button>
    </div>
  `;
  document.body.appendChild(modal);
}

// Modal open helpers
function openUploadModal() {
  alert("Camera Trap Upload Dialog: Select image file (.jpg, .png, .raw) to submit for AI Biometric Identification.");
}

function openAiAssistant() {
  alert("Maya AI Assistant initialized. Ask questions regarding tiger movements, territory overlap, or proximity risks.");
}
