import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'tiger_intel_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class RelationalDatabase {
  constructor() {
    this.data = {
      tigers: [],
      camera_stations: [],
      sightings: [],
      alerts: [],
      reports: [],
      processing_runs: [],
      tiger_spatial_summary: [],
      tiger_capture_locations: [],
      tiger_overlap: [],
      reserve_boundaries: []
    };
    this.load();
  }

  load() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } catch (err) {
        console.error('Error loading DB file, initializing empty:', err);
      }
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving DB file:', err);
    }
  }

  // Table accessors
  getTable(tableName) {
    return this.data[tableName] || [];
  }

  setTable(tableName, items) {
    this.data[tableName] = items;
    this.save();
  }

  find(tableName, predicate) {
    const table = this.getTable(tableName);
    if (!predicate) return table;
    return table.filter(predicate);
  }

  findOne(tableName, predicate) {
    const table = this.getTable(tableName);
    return table.find(predicate);
  }

  insert(tableName, item) {
    const table = this.getTable(tableName);
    table.push(item);
    this.save();
    return item;
  }

  update(tableName, predicate, updates) {
    const table = this.getTable(tableName);
    let updatedCount = 0;
    this.data[tableName] = table.map(item => {
      if (predicate(item)) {
        updatedCount++;
        return { ...item, ...updates };
      }
      return item;
    });
    if (updatedCount > 0) this.save();
    return updatedCount;
  }

  delete(tableName, predicate) {
    const table = this.getTable(tableName);
    const initialLength = table.length;
    this.data[tableName] = table.filter(item => !predicate(item));
    if (table.length !== initialLength) this.save();
    return initialLength - table.length;
  }
}

export const db = new RelationalDatabase();
