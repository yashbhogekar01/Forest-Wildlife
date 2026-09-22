const API_BASE = '/api';

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error('Failed to fetch system stats');
  return res.json();
}

export async function fetchTigers() {
  const res = await fetch(`${API_BASE}/tigers`);
  if (!res.ok) throw new Error('Failed to fetch tigers catalog');
  return res.json();
}

export async function fetchTigerById(id) {
  const res = await fetch(`${API_BASE}/tigers/${id}`);
  if (!res.ok) throw new Error('Failed to fetch tiger detail');
  return res.json();
}

export async function createTiger(tigerData) {
  const res = await fetch(`${API_BASE}/tigers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tigerData)
  });
  if (!res.ok) throw new Error('Failed to create new tiger profile');
  return res.json();
}

export async function deleteTiger(id) {
  const res = await fetch(`${API_BASE}/tigers/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete tiger record');
  return res.json();
}

export async function bulkDeleteTigers(ids) {
  const res = await fetch(`${API_BASE}/tigers/bulk-delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids })
  });
  if (!res.ok) throw new Error('Failed to bulk delete tiger records');
  return res.json();
}

export async function resetTigerDatabase() {
  const res = await fetch(`${API_BASE}/tigers/reset`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to reset tiger database');
  return res.json();
}

export async function fetchStations() {
  const res = await fetch(`${API_BASE}/stations`);
  if (!res.ok) throw new Error('Failed to fetch camera stations');
  return res.json();
}

export async function updateStationStatus(id, status) {
  const res = await fetch(`${API_BASE}/stations/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update station status');
  return res.json();
}

export async function fetchSightings() {
  const res = await fetch(`${API_BASE}/sightings`);
  if (!res.ok) throw new Error('Failed to fetch camera trap sightings');
  return res.json();
}

export async function simulateCapture(data = {}) {
  const res = await fetch(`${API_BASE}/sightings/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to simulate camera capture');
  return res.json();
}

export async function uploadSighting(data) {
  const res = await fetch(`${API_BASE}/sightings/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to upload camera trap image');
  return res.json();
}


export async function fetchAlerts() {
  const res = await fetch(`${API_BASE}/alerts`);
  if (!res.ok) throw new Error('Failed to fetch threat alerts');
  return res.json();
}

export async function updateAlert(id, updates) {
  const res = await fetch(`${API_BASE}/alerts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('Failed to update alert status');
  return res.json();
}

export async function fetchReports() {
  const res = await fetch(`${API_BASE}/reports`);
  if (!res.ok) throw new Error('Failed to fetch reports');
  return res.json();
}

export async function generateReport(report_type) {
  const res = await fetch(`${API_BASE}/reports/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ report_type })
  });
  if (!res.ok) throw new Error('Failed to generate report');
  return res.json();
}

export async function fetchWeather() {
  const res = await fetch(`${API_BASE}/weather`);
  if (!res.ok) throw new Error('Failed to fetch weather telemetry');
  return res.json();
}

export async function askAiAssistant(payload) {
  const res = await fetch(`${API_BASE}/ai/assistant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to get response from AI Assistant');
  return res.json();
}

// Spatial GIS Analysis APIs
export async function runSpatialAnalysis(runId = `RUN_${Date.now()}`) {
  const res = await fetch(`${API_BASE}/spatial/analyze/${runId}`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to execute spatial analysis run');
  return res.json();
}

export async function fetchSpatialTigers() {
  const res = await fetch(`${API_BASE}/spatial/tigers`);
  if (!res.ok) throw new Error('Failed to fetch spatial tiger summaries');
  return res.json();
}

export async function fetchSpatialOverlaps() {
  const res = await fetch(`${API_BASE}/spatial/overlaps`);
  if (!res.ok) throw new Error('Failed to fetch territorial overlaps');
  return res.json();
}

// Human Review Queue APIs
export async function fetchPendingReviews() {
  const res = await fetch(`${API_BASE}/reviews/pending`);
  if (!res.ok) throw new Error('Failed to fetch pending human review queue');
  return res.json();
}

export async function submitReviewDecision(observationId, decisionData) {
  const res = await fetch(`${API_BASE}/reviews/${observationId}/decision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(decisionData)
  });
  if (!res.ok) throw new Error('Failed to submit reviewer decision');
  return res.json();
}

// Excel Sync API
export async function syncExcelDatabase() {
  const res = await fetch(`${API_BASE}/reports/sync-excel`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to sync Excel workbook');
  return res.json();
}

