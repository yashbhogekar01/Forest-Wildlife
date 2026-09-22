import express from 'express';
import { db } from '../db/database.js';
import { DeviationAlertEngine } from '../alert_engine.js';

const router = express.Router();
const alertEngine = new DeviationAlertEngine();

/**
 * POST /api/alerts/analyze/:runId
 * Triggers automated deviation detection and alerting evaluation after a processing run.
 */
router.post('/analyze/:runId', (req, res) => {
  try {
    const { runId } = req.params;
    const sightings = db.getTable('sightings');
    const stations = db.getTable('camera_stations');
    const existingAlerts = db.getTable('alerts');

    // Build station catalog
    const stationCatalog = {};
    stations.forEach(st => {
      stationCatalog[st.id] = {
        station_id: st.id,
        station_name: st.station_name,
        zone: st.zone,
        is_village_adjacent: st.is_village_adjacent || (st.zone === 'Buffer' && st.distance_to_village_meters < 1500),
        distance_to_village_meters: st.distance_to_village_meters || 2800
      };
    });

    // Run evaluation engine
    const newAlerts = alertEngine.evaluate_run(
      runId,
      sightings.slice(0, 15), // Recent run sightings
      sightings,             // Full historical sightings
      stationCatalog
    );

    // Merge and insert into database
    newAlerts.forEach(alt => {
      const exists = existingAlerts.some(a => a.alert_id === alt.alert_id || (a.individual_id === alt.individual_id && a.alert_type === alt.alert_type && a.status === 'NEW'));
      if (!exists) {
        db.insert('alerts', {
          id: alt.alert_id,
          ...alt,
          created_at: new Date().toISOString()
        });
      }
    });

    const updatedAlerts = db.getTable('alerts');

    res.json({
      success: true,
      run_id: runId,
      new_alerts_generated: newAlerts.length,
      total_alerts_count: updatedAlerts.length,
      alerts: newAlerts,
      message: `Deviation analysis run '${runId}' completed. ${newAlerts.length} new automated alerts generated.`
    });
  } catch (err) {
    console.error('Error running deviation alert evaluation:', err);
    res.status(500).json({ error: 'Failed to run deviation alert engine' });
  }
});

/**
 * GET /api/alerts
 * Returns all alerts with enriched tiger and station metadata.
 */
router.get('/', (req, res) => {
  try {
    const alerts = db.getTable('alerts');
    const tigers = db.getTable('tigers');
    const stations = db.getTable('camera_stations');

    const enriched = alerts.map(a => {
      const tiger = tigers.find(t => t.id === (a.individual_id || a.tiger_id));
      const station = stations.find(st => st.id === a.station_id);
      return {
        ...a,
        tiger_name: tiger ? tiger.name : (a.tiger_name || 'Unknown Tiger'),
        tiger_stripe_hash: tiger ? tiger.stripe_signature_hash : null,
        station_name: station ? station.station_name : (a.station_name || 'Unknown Station'),
        latitude: station ? station.latitude : (a.supporting_evidence?.coordinates?.[0] || 21.75),
        longitude: station ? station.longitude : (a.supporting_evidence?.coordinates?.[1] || 79.32),
        zone: station ? station.zone : 'Buffer'
      };
    });

    enriched.sort((a, b) => new Date(b.created_at || b.detected_at) - new Date(a.created_at || a.detected_at));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

/**
 * GET /api/alerts/high-priority
 * Returns high and critical severity alerts.
 */
router.get('/high-priority', (req, res) => {
  try {
    const alerts = db.getTable('alerts');
    const highPriority = alerts.filter(a => a.severity === 'HIGH' || a.severity === 'CRITICAL');
    res.json({ success: true, count: highPriority.length, alerts: highPriority });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch high priority alerts' });
  }
});

/**
 * GET /api/alerts/pending-review
 * Returns alerts requiring human reviewer confirmation.
 */
router.get('/pending-review', (req, res) => {
  try {
    const alerts = db.getTable('alerts');
    const pending = alerts.filter(a => a.status === 'NEW' || a.status === 'PENDING_REVIEW' || a.status === 'ACTIVE');
    res.json({ success: true, count: pending.length, alerts: pending });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pending review alerts' });
  }
});

/**
 * GET /api/alerts/:id
 * Returns a specific alert by ID.
 */
router.get('/:id', (req, res) => {
  try {
    const alert = db.findOne('alerts', a => a.id === req.params.id || a.alert_id === req.params.id);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    res.json({ success: true, alert });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch alert detail' });
  }
});

/**
 * POST /api/alerts/:id/review
 * Logs expert reviewer decision (CONFIRMED, DISMISSED, SURVEY_ARTEFACT).
 */
router.post('/:id/review', (req, res) => {
  try {
    const { decision, review_notes, reviewer_id } = req.body;
    const alertId = req.params.id;

    const alert = db.findOne('alerts', a => a.id === alertId || a.alert_id === alertId);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });

    const updates = {
      status: decision || 'CONFIRMED_BEHAVIOURAL_CHANGE',
      review_notes: review_notes || 'Reviewed by Forest Department Officer',
      reviewed_by: reviewer_id || 'RFO_Officer',
      reviewed_at: new Date().toISOString()
    };

    db.update('alerts', a => a.id === alertId || a.alert_id === alertId, updates);

    res.json({
      success: true,
      alert_id: alertId,
      decision: updates.status,
      message: `Alert '${alertId}' successfully updated with reviewer decision '${updates.status}'.`
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to log review decision' });
  }
});

/**
 * GET /api/alerts/export/csv
 * Exports CSV operational alert report.
 */
router.get('/export/csv', (req, res) => {
  try {
    const alerts = db.getTable('alerts');
    let csv = 'Alert ID,Tiger ID,Tiger Name,Alert Type,Severity,Confidence %,Status,Detected Change,Threshold,Actual Value,Survey Effort Score,Artefact Prob,Detected At\n';

    alerts.forEach(a => {
      csv += `"${a.id || a.alert_id}","${a.individual_id || a.tiger_id}","${a.tiger_name}","${a.alert_type}","${a.severity}",${a.confidence_score || 90},"${a.status}","${(a.detected_change || '').replace(/"/g, '""')}","${a.threshold || 'N/A'}","${a.actual_value || 'N/A'}",${a.survey_effort_score || 0.95},${a.artefact_probability || 0.05},"${a.detected_at || a.created_at}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="Pench_Tiger_Alerts_Report.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: 'Failed to export CSV alert report' });
  }
});

/**
 * GET /api/alerts/export/geojson
 * Exports GeoJSON layer of alert locations.
 */
router.get('/export/geojson', (req, res) => {
  try {
    const alerts = db.getTable('alerts');
    const features = alerts.map(a => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [
          a.supporting_evidence?.coordinates?.[1] || a.longitude || 79.32,
          a.supporting_evidence?.coordinates?.[0] || a.latitude || 21.75
        ]
      },
      properties: {
        alert_id: a.id || a.alert_id,
        individual_id: a.individual_id || a.tiger_id,
        tiger_name: a.tiger_name,
        alert_type: a.alert_type,
        severity: a.severity,
        detected_change: a.detected_change,
        detected_at: a.detected_at || a.created_at
      }
    }));

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="Pench_Tiger_Alerts.geojson"');
    res.send(JSON.stringify({ type: 'FeatureCollection', features }, null, 2));
  } catch (err) {
    res.status(500).json({ error: 'Failed to export GeoJSON alert layer' });
  }
});

// PATCH legacy endpoint compatibility
router.patch('/:id', (req, res) => {
  const { status, assessment_notes, severity } = req.body;
  const updates = {};
  if (status) updates.status = status;
  if (assessment_notes !== undefined) updates.assessment_notes = assessment_notes;
  if (severity) updates.severity = severity;

  const updatedCount = db.update('alerts', a => a.id === req.params.id || a.alert_id === req.params.id, updates);
  if (updatedCount === 0) return res.status(404).json({ error: 'Alert not found' });

  const alert = db.findOne('alerts', a => a.id === req.params.id || a.alert_id === req.params.id);
  res.json({ message: 'Alert updated successfully', alert });
});

export default router;
