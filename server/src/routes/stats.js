import express from 'express';
import { db } from '../db/database.js';

const router = express.Router();

router.get('/', (req, res) => {
  const sightings = db.getTable('sightings');
  const tigers = db.getTable('tigers');
  const stations = db.getTable('camera_stations');
  const alerts = db.getTable('alerts');
  const reports = db.getTable('reports');

  const totalCaptures = 14850 + sightings.length;
  const blankQuarantined = 13920 + sightings.filter(s => s.is_blank === 1).length;
  const usefulCaptures = totalCaptures - blankQuarantined;
  const activeAlertsCount = alerts.filter(a => a.status === 'ACTIVE' || a.status === 'INVESTIGATING').length;

  res.json({
    total_images_processed: totalCaptures,
    blank_images_quarantined: blankQuarantined,
    useful_captures: usefulCaptures,
    tigers_identified_count: tigers.length,
    active_alerts_count: activeAlertsCount,
    total_stations: stations.length,
    online_stations_count: stations.filter(s => s.status === 'Online').length,
    last_ping_timestamp: sightings.length > 0 ? sightings[0].timestamp : new Date().toISOString()
  });
});

export default router;
