import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { db } from './db/database.js';
import { seedDatabase } from './db/seed.js';

import statsRoutes from './routes/stats.js';
import tigersRoutes from './routes/tigers.js';
import stationsRoutes from './routes/stations.js';
import sightingsRoutes from './routes/sightings.js';
import alertsRoutes from './routes/alerts.js';
import reportsRoutes from './routes/reports.js';
import weatherRoutes from './routes/weather.js';
import aiRoutes from './routes/ai.js';
import reviewsRoutes from './routes/reviews.js';
import spatialRoutes from './routes/spatial.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Auto-seed database if empty, invalid, or containing deleted records (T-39 / T-43)
const tigersInDb = db.getTable('tigers');
const hasInvalidTigers = tigersInDb.some(t => 
  t.id === 'TGR-039' || t.id === 'TGR-043' || 
  (t.name && (t.name.includes('T-39') || t.name.includes('T-43') || t.name.includes('Sillari Male') || t.name.includes('Khawasa Tigress')))
);

if (tigersInDb.length < 123 || hasInvalidTigers) {
  console.log('Purging invalid T-39 / T-43 tiger records and re-seeding verified dataset...');
  seedDatabase();
}

// API Routes
app.use('/api/stats', statsRoutes);
app.use('/api/tigers', tigersRoutes);
app.use('/api/stations', stationsRoutes);
app.use('/api/sightings', sightingsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/spatial', spatialRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'Tiger Intel - Pench Tiger Reserve Command API',
    timestamp: new Date().toISOString()
  });
});

// Serve client production build
const clientDistPath = path.resolve(__dirname, '../../client/dist');
console.log(`Checking client dist directory at: ${clientDistPath} (exists: ${fs.existsSync(clientDistPath)})`);

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

import os from 'os';

app.listen(PORT, '0.0.0.0', () => {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const k in interfaces) {
    for (const k2 of interfaces[k]) {
      if (k2.family === 'IPv4' && !k2.internal) {
        addresses.push(k2.address);
      }
    }
  }

  console.log(`====================================================`);
  console.log(` TIGER INTEL UNIFIED COMMAND SERVER (FRONTEND + API) `);
  console.log(` Target Sector: Pench Tiger Reserve`);
  console.log(` Local URL: http://localhost:${PORT}`);
  addresses.forEach(ip => {
    console.log(` Network URL (Any Device on Wi-Fi): http://${ip}:${PORT}`);
  });
  console.log(`====================================================`);
});
