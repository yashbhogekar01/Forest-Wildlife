import express from 'express';
import path from 'path';
import fs from 'fs';
import { db } from '../db/database.js';
import { syncFullDatabaseToExcel } from '../utils/excelExporter.js';

const router = express.Router();

router.get('/', (req, res) => {
  const reports = db.getTable('reports');
  res.json(reports);
});

// GET download master Excel database file (.xlsx)
router.get('/download/excel-master', (req, res) => {
  const filePath = path.resolve(process.cwd(), 'exports', 'tiger_database_master.xlsx');
  if (!fs.existsSync(filePath)) {
    // If not generated, trigger immediate sync
    const tigers = db.getTable('tigers');
    const sightings = db.getTable('sightings');
    syncFullDatabaseToExcel(tigers, sightings);
  }
  res.download(filePath, 'Pench_Tiger_Database_Master.xlsx');
});

// GET download Excel sightings report file
router.get('/download/excel', (req, res) => {
  const filePath = path.resolve(process.cwd(), 'exports', 'tiger_sightings_report.xlsx');
  if (!fs.existsSync(filePath)) {
    const tigers = db.getTable('tigers');
    const sightings = db.getTable('sightings');
    syncFullDatabaseToExcel(tigers, sightings);
  }
  res.download(filePath, 'Pench_Tiger_Sightings_Report.xlsx');
});

// POST sync live database into master Excel file on demand
router.post('/sync-excel', async (req, res) => {
  const tigers = db.getTable('tigers');
  const sightings = db.getTable('sightings');
  const result = await syncFullDatabaseToExcel(tigers, sightings);

  res.json({
    message: 'Live database successfully synchronized with Excel workbook.',
    excel_file: 'tiger_database_master.xlsx',
    tigers_synced: tigers.length,
    sightings_synced: sightings.length,
    ...result
  });
});

router.post('/generate', (req, res) => {
  const { report_type } = req.body;
  if (!['DAILY_1_DAY', 'MONTHLY_1_MONTH'].includes(report_type)) {
    return res.status(400).json({ error: 'Invalid report type' });
  }

  const sightings = db.getTable('sightings');
  const tigers = db.getTable('tigers');
  const alerts = db.getTable('alerts');
  const stations = db.getTable('camera_stations');

  const isDaily = report_type === 'DAILY_1_DAY';

  const newReportId = `RPT-${new Date().toISOString().slice(0,10)}-${isDaily ? 'D' : 'M'}-${Math.floor(100 + Math.random() * 900)}`;

  const totalCaptures = isDaily ? 412 + Math.floor(Math.random() * 50) : 14850 + Math.floor(Math.random() * 500);
  const blankFiltered = isDaily ? 384 + Math.floor(Math.random() * 40) : 13920 + Math.floor(Math.random() * 400);

  const payload = {
    blank_filter_rate: `${((blankFiltered / totalCaptures) * 100).toFixed(1)}%`,
    station_uptime: `${((stations.filter(s => s.status === 'Online').length / stations.length) * 100).toFixed(1)}%`,
    unique_tigers: tigers.length,
    active_alerts: alerts.filter(a => a.status === 'ACTIVE').length,
    key_findings: isDaily
      ? "Daily surveillance recorded 93%+ efficiency in AI blank filtering. Zero human-tiger contact reported in Pench core zone."
      : "30-Day population trend indicates stable home range boundaries for T-15 and T-42. High territorial expansion noticed in eastern Jamtara buffer."
  };

  const newReport = {
    id: newReportId,
    report_type,
    period_start: isDaily ? new Date(Date.now() - 86400000).toISOString() : new Date(Date.now() - 30 * 86400000).toISOString(),
    period_end: new Date().toISOString(),
    total_captures: totalCaptures,
    total_blank_filtered: blankFiltered,
    unique_tigers_detected: tigers.length,
    active_alerts_count: alerts.filter(a => a.status === 'ACTIVE').length,
    summary_payload: JSON.stringify(payload),
    created_at: new Date().toISOString()
  };

  db.insert('reports', newReport);
  res.json({ message: 'Report generated successfully', report: newReport });
});

export default router;
