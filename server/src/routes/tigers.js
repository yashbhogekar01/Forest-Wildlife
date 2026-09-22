import express from 'express';
import { db } from '../db/database.js';
import { seedDatabase } from '../db/seed.js';
import { appendTigerToExcel } from '../utils/excelExporter.js';

const router = express.Router();

// GET all tigers with detailed sightings & territory calculation
router.get('/', (req, res) => {
  const tigers = db.getTable('tigers');
  const sightings = db.getTable('sightings');

  const enrichedTigers = tigers.map(t => {
    const tigerSightings = sightings.filter(s => s.tiger_id === t.id);
    return {
      ...t,
      sightings: tigerSightings,
      sighting_pings_count: tigerSightings.length,
      has_territory_cluster: tigerSightings.length >= 3
    };
  });

  res.json(enrichedTigers);
});

// GET single tiger by ID
router.get('/:id', (req, res) => {
  const tiger = db.findOne('tigers', t => t.id === req.params.id);
  if (!tiger) {
    return res.status(404).json({ error: 'Tiger not found' });
  }

  const sightings = db.find('sightings', s => s.tiger_id === tiger.id);
  const alerts = db.find('alerts', a => a.tiger_id === tiger.id);

  res.json({
    ...tiger,
    sightings,
    alerts
  });
});

// POST create new tiger profile
router.post('/', (req, res) => {
  const { 
    name, gender, age_years, health_status, territory, 
    stripe_signature_hash, estimated_home_center_lat, 
    estimated_home_center_lng, image_url 
  } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Tiger name is required.' });
  }

  const existingTigers = db.getTable('tigers');
  const nextNumber = existingTigers.length + 1;
  const generatedId = `TGR-${String(nextNumber).padStart(3, '0')}`;

  const newTiger = {
    id: generatedId,
    name: name.trim(),
    stripe_signature_hash: stripe_signature_hash || `SHA256-FLANK-${gender === 'Male' ? 'R' : 'L'}-${Math.floor(Math.random()*16777215).toString(16).toUpperCase()}`,
    gender: gender || 'Female',
    age_years: parseFloat(age_years) || 4.5,
    health_status: health_status || 'Healthy',
    total_sightings_count: 1,
    estimated_home_center_lat: parseFloat(estimated_home_center_lat) || 21.7500,
    estimated_home_center_lng: parseFloat(estimated_home_center_lng) || 79.3300,
    territory_radius_meters: 3500,
    territory_color: '#10b981',
    image_url: image_url || '/images/tiger_trap_1.jpg',
    species_label: 'Panthera tigris',
    is_verified_tiger: true,
    created_at: new Date().toISOString()
  };

  db.insert('tigers', newTiger);

  const initialSighting = {
    id: `SGT-${Date.now()}`,
    tiger_id: newTiger.id,
    tiger_name: newTiger.name,
    station_id: 'CS-101',
    station_name: 'Karmajhiri Core Gate',
    latitude: newTiger.estimated_home_center_lat,
    longitude: newTiger.estimated_home_center_lng,
    timestamp: new Date().toISOString(),
    confidence_score: 98.6,
    image_url: newTiger.image_url,
    flank_side: 'Right',
    is_blank: 0,
    notes: `Initial catalog registration capture for ${newTiger.name}.`
  };

  // Insert initial camera sighting ping for new tiger
  db.insert('sightings', initialSighting);

  // Excel Integration: Append sighting to ongoing Excel report (runs after DB commit)
  appendTigerToExcel({
    ...initialSighting,
    ai_status: '✓ Verified Tiger'
  });

  res.status(201).json({
    message: `Tiger profile for ${newTiger.name} (${newTiger.id}) created successfully.`,
    tiger: newTiger
  });
});

// DELETE single tiger by ID
router.delete('/:id', (req, res) => {
  const targetId = req.params.id;
  const deletedCount = db.delete('tigers', t => t.id === targetId);

  if (deletedCount === 0) {
    return res.status(404).json({ error: 'Tiger record not found' });
  }

  db.delete('sightings', s => s.tiger_id === targetId);
  db.delete('alerts', a => a.tiger_id === targetId);

  res.json({
    message: `Successfully deleted tiger ${targetId} and related telemetry records.`,
    remainingCount: db.getTable('tigers').length
  });
});

// POST bulk delete tigers by array of IDs
router.post('/bulk-delete', (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Please provide an array of tiger IDs to delete.' });
  }

  const idSet = new Set(ids);
  const initialCount = db.getTable('tigers').length;

  db.delete('tigers', t => idSet.has(t.id));
  db.delete('sightings', s => idSet.has(s.tiger_id));
  db.delete('alerts', a => idSet.has(a.tiger_id));

  const deletedCount = initialCount - db.getTable('tigers').length;

  res.json({
    message: `Successfully bulk deleted ${deletedCount} tiger records.`,
    deletedCount,
    remainingCount: db.getTable('tigers').length
  });
});

// POST reset database to seed defaults
router.post('/reset', (req, res) => {
  seedDatabase();
  res.json({
    message: 'Database reset to default verified seed dataset.',
    tigerCount: db.getTable('tigers').length
  });
});

export default router;
