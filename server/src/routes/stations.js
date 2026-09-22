import express from 'express';
import { db } from '../db/database.js';

const router = express.Router();

router.get('/', (req, res) => {
  const stations = db.getTable('camera_stations');
  const sightings = db.getTable('sightings');
  const alerts = db.getTable('alerts');

  const enrichedStations = stations.map(st => {
    const stSightings = sightings.filter(s => s.station_id === st.id);
    const activeAlerts = alerts.filter(a => a.station_id === st.id && (a.status === 'ACTIVE' || a.status === 'INVESTIGATING'));
    return {
      ...st,
      total_captures: stSightings.length,
      last_capture_at: stSightings.length > 0 ? stSightings[0].timestamp : null,
      active_alerts_count: activeAlerts.length,
      has_alert: activeAlerts.length > 0
    };
  });

  res.json(enrichedStations);
});

router.patch('/:id/status', (req, res) => {
  const { status } = req.body;
  if (!['Online', 'Offline', 'Maintenance'].includes(status)) {
    return res.status(400).json({ error: 'Invalid station status' });
  }

  const updatedCount = db.update('camera_stations', s => s.id === req.params.id, { status });
  if (updatedCount === 0) {
    return res.status(404).json({ error: 'Station not found' });
  }

  const station = db.findOne('camera_stations', s => s.id === req.params.id);
  res.json({ message: 'Station status updated', station });
});

export default router;
