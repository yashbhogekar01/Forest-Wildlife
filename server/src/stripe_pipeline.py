"""
Module 2: Stripe Pattern Identification Pipeline & Database Matching Engine
============================================================================
Computer vision pipeline for tiger flank isolation, stripe embedding extraction,
database schema definition, and automated individual matching/enrollment.
"""

import sqlite3
import json
import hashlib
from typing import Dict, Any, List, Tuple

# Database Schema Definition DDL
DDL_SCHEMA = """
-- 1. Individual Tigers Master Catalogue
CREATE TABLE IF NOT EXISTS tigers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    stripe_signature_hash TEXT UNIQUE NOT NULL,
    gender TEXT CHECK(gender IN ('Male', 'Female', 'Unknown')),
    age_years REAL,
    territory TEXT,
    health_status TEXT DEFAULT 'Healthy',
    enrollment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'ACTIVE'
);

-- 2. Stripe Feature Vectors / Flank Embeddings Catalogue
CREATE TABLE IF NOT EXISTS flank_signatures (
    id TEXT PRIMARY KEY,
    tiger_id TEXT NOT NULL,
    flank_side TEXT CHECK(flank_side IN ('Left', 'Right', 'Bilateral')),
    feature_vector_json TEXT NOT NULL, -- 512-dim embedding array
    quality_score REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tiger_id) REFERENCES tigers(id) ON DELETE CASCADE
);

-- 3. Camera Trap Station Nodes
CREATE TABLE IF NOT EXISTS camera_stations (
    id TEXT PRIMARY KEY,
    station_name TEXT NOT NULL,
    zone TEXT NOT NULL, -- e.g., 'Core', 'Buffer', 'Khawasa'
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    is_village_adjacent BOOLEAN DEFAULT 0,
    status TEXT DEFAULT 'ACTIVE'
);

-- 4. Camera Trap Sightings Log
CREATE TABLE IF NOT EXISTS sightings (
    id TEXT PRIMARY KEY,
    tiger_id TEXT,
    station_id TEXT NOT NULL,
    image_url TEXT NOT NULL,
    timestamp DATETIME NOT NULL,
    confidence_score REAL NOT NULL,
    flank_side TEXT,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    notes TEXT,
    FOREIGN KEY(tiger_id) REFERENCES tigers(id),
    FOREIGN KEY(station_id) REFERENCES camera_stations(id)
);

-- 5. Match Audit Queue (Human-in-the-Loop Verification)
CREATE TABLE IF NOT EXISTS match_audit_queue (
    id TEXT PRIMARY KEY,
    sighting_id TEXT NOT NULL,
    candidate_tiger_id TEXT,
    match_score REAL NOT NULL,
    decision_status TEXT CHECK(decision_status IN ('AUTO_CONFIRMED', 'NEEDS_HUMAN_REVIEW', 'ENROLLED_NEW')),
    reviewed_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(sighting_id) REFERENCES sightings(id),
    FOREIGN KEY(candidate_tiger_id) REFERENCES tigers(id)
);
"""

class StripeIdentificationEngine:
    def __init__(self, db_path: str = ":memory:"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            conn.executescript(DDL_SCHEMA)

    def extract_flank_embedding(self, image_path: str, flank_side: str) -> List[float]:
        """
        CV Pipeline Step 1-3:
        1. Detect Tiger Bounding Box
        2. Isolate & Align Flank Region
        3. Extract 512-dimensional Stripe Feature Embedding Vector
        (Simulated metric vector using SHA-256 seed for pipeline execution)
        """
        seed_bytes = hashlib.sha256(f"{image_path}_{flank_side}".encode()).digest()
        # Generate pseudo-embedding vector normalized to unit sphere
        raw_vector = [(b / 255.0) - 0.5 for b in seed_bytes[:64]]
        norm = sum(x**2 for x in raw_vector) ** 0.5
        normalized_vector = [round(x / norm, 4) for x in raw_vector]
        return normalized_vector

    def match_or_enroll(
        self,
        image_path: str,
        station_id: str,
        timestamp: str,
        lat: float,
        lng: float,
        flank_side: str = "Left"
    ) -> Dict[str, Any]:
        """
        Core Match & Auto-Enrollment Pipeline:
        - Extracts stripe vector
        - Compares against catalogue database
        - Applies decision thresholds:
            * Match Score >= 90%: AUTO_CONFIRMED
            * 70% <= Match Score < 90%: NEEDS_HUMAN_REVIEW
            * Match Score < 70%: ENROLLED_NEW (auto-creates new individual tiger entry)
        """
        new_embedding = self.extract_flank_embedding(image_path, flank_side)
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Fetch existing signatures
            cursor.execute("SELECT tiger_id, feature_vector_json FROM flank_signatures WHERE flank_side = ?", (flank_side,))
            rows = cursor.fetchall()
            
            best_tiger_id = None
            highest_score = 0.0

            for tiger_id, vec_json in rows:
                existing_vec = json.loads(vec_json)
                # Compute Cosine Similarity
                dot_product = sum(a * b for a, b in zip(new_embedding, existing_vec))
                if dot_product > highest_score:
                    highest_score = dot_product
                    best_tiger_id = tiger_id

            # Apply Configurable Decision Logic
            match_score_pct = round(highest_score * 100, 1)

            if match_score_pct >= 90.0 and best_tiger_id:
                status = "AUTO_CONFIRMED"
                assigned_tiger_id = best_tiger_id
            elif match_score_pct >= 75.0 and best_tiger_id:
                status = "NEEDS_HUMAN_REVIEW"
                assigned_tiger_id = best_tiger_id
            else:
                status = "NEW_INDIVIDUAL"
                # Auto-enroll new individual tiger
                assigned_tiger_id = f"TIGER_{int(time.time() * 1000) % 10000:04d}"
                tiger_name = f"T-{assigned_tiger_id.split('_')[1]} (Newly Enrolled)"
                stripe_hash = f"HASH-{hashlib.md5(image_path.encode()).hexdigest()[:8]}"
                
                cursor.execute("""
                    INSERT INTO tigers (id, name, stripe_signature_hash, gender, age_years, territory)
                    VALUES (?, ?, ?, 'Unknown', 4.0, 'Pench Buffer')
                """, (assigned_tiger_id, tiger_name, stripe_hash))

                # Store signature
                cursor.execute("""
                    INSERT INTO flank_signatures (id, tiger_id, flank_side, feature_vector_json, quality_score)
                    VALUES (?, ?, ?, ?, ?)
                """, (f"SIG-{assigned_tiger_id}", assigned_tiger_id, flank_side, json.dumps(new_embedding), 0.95))

            # Log Sighting
            sighting_id = f"OBS_{int(time.time() * 1000)}"
            cursor.execute("""
                INSERT INTO sightings (id, tiger_id, station_id, image_url, timestamp, confidence_score, flank_side, latitude, longitude)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (sighting_id, assigned_tiger_id, station_id, image_path, timestamp, match_score_pct, flank_side, lat, lng))

            # Log to Audit Queue
            cursor.execute("""
                INSERT INTO match_audit_queue (id, sighting_id, candidate_tiger_id, match_score, decision_status)
                VALUES (?, ?, ?, ?, ?)
            """, (f"AUDIT-{sighting_id}", sighting_id, assigned_tiger_id, match_score_pct, status))

            conn.commit()

            return {
                "observation_id": sighting_id,
                "assigned_tiger_id": assigned_tiger_id,
                "match_score_pct": match_score_pct,
                "decision_status": status,
                "location": {"latitude": lat, "longitude": lng, "station_id": station_id}
            }

if __name__ == "__main__":
    engine = StripeIdentificationEngine()
    print("StripeIdentificationEngine pipeline ready.")
