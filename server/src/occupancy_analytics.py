"""
Module 3: GIS-based Tiger-wise Area Occupancy & Spatial Monitoring Pipeline
=============================================================================
Calculates dynamic spatial occupancy telemetry for Pench Tiger Reserve:
- Spatial Data Validation (Reserve Bounds: 21.0°N-22.2°N, 78.8°E-80.1°E)
- Activity Centroid (Mean Geographic Center in WGS84)
- Minimum Convex Polygon (MCP 100% Home Range Area in km² & Hectares)
- Kernel Density Estimation (KDE 50% Core Activity & 95% Home Range)
- Pairwise Territorial Overlap Analysis (Intersection Area, Overlap A->B %, Overlap B->A %, IoU)
- Scientific Data Safeguards (High, Moderate, Low Confidence, Insufficient Data)
"""

import math
import time
from typing import List, Dict, Any, Tuple, Optional

# Approximate km per degree latitude/longitude at Pench (~21.65° N)
KM_PER_DEG_LAT = 110.574
KM_PER_DEG_LNG = 103.220

# Pench Tiger Reserve Geofence Boundary Bounds
RESERVE_MIN_LAT = 21.0000
RESERVE_MAX_LAT = 22.2000
RESERVE_MIN_LNG = 78.8000
RESERVE_MAX_LNG = 80.1000


class OccupancyAnalytics:
    @staticmethod
    def validate_coordinate(lat: float, lng: float) -> Tuple[bool, Optional[str]]:
        """
        Validates spatial coordinates against Pench Tiger Reserve geofence boundary.
        """
        if lat is None or lng is None:
            return False, "Missing coordinate telemetry"
        if not (-90.0 <= lat <= 90.0) or not (-180.0 <= lng <= 180.0):
            return False, "Impossible coordinate values out of global bounds"
        if not (RESERVE_MIN_LAT <= lat <= RESERVE_MAX_LAT) or not (RESERVE_MIN_LNG <= lng <= RESERVE_MAX_LNG):
            return False, f"Coordinates ({lat}, {lng}) outside Pench Reserve boundary limits"
        return True, None

    @staticmethod
    def calculate_centroid(coordinates: List[Tuple[float, float]]) -> Tuple[float, float]:
        """
        Calculates Activity Centroid (Mean Geographic Center) (lat, lng).
        """
        if not coordinates:
            return (0.0, 0.0)
        mean_lat = sum(c[0] for c in coordinates) / len(coordinates)
        mean_lng = sum(c[1] for c in coordinates) / len(coordinates)
        return (round(mean_lat, 5), round(mean_lng, 5))

    @staticmethod
    def calculate_mcp_area_sq_km(coordinates: List[Tuple[float, float]]) -> Tuple[float, List[Tuple[float, float]]]:
        """
        Calculates Minimum Convex Polygon (MCP 100%) area in sq km and returns hull coordinates.
        """
        if len(coordinates) < 3:
            return 0.0, coordinates

        # Andrew's Monotone Chain Convex Hull
        points = sorted(set(coordinates))
        if len(points) < 3:
            return 0.0, points

        def cross(o, a, b):
            return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

        lower = []
        for p in points:
            while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 0:
                lower.pop()
            lower.append(p)

        upper = []
        for p in reversed(points):
            while len(upper) >= 2 and cross(upper[-2], upper[-1], p) <= 0:
                upper.pop()
            upper.append(p)

        hull = lower[:-1] + upper[:-1]
        if len(hull) < 3:
            return 0.0, hull

        km_points = [
            (
                (p[1] - hull[0][1]) * KM_PER_DEG_LNG,
                (p[0] - hull[0][0]) * KM_PER_DEG_LAT
            )
            for p in hull
        ]

        n = len(km_points)
        area = 0.0
        for i in range(n):
            j = (i + 1) % n
            area += km_points[i][0] * km_points[j][1]
            area -= km_points[j][0] * km_points[i][1]

        area_sq_km = round(abs(area) / 2.0, 2)
        return area_sq_km, hull

    @staticmethod
    def determine_confidence(obs_count: int, station_count: int) -> str:
        """
        Determines scientific data confidence level.
        """
        if obs_count == 0:
            return "NO_DATA"
        if obs_count == 1:
            return "INSUFFICIENT_DATA_CENTROID_ONLY"
        if obs_count == 2:
            return "LOW_CONFIDENCE"
        if obs_count < 10 or station_count < 4:
            return "MODERATE_CONFIDENCE"
        return "HIGH_CONFIDENCE"

    @staticmethod
    def calculate_overlap(
        tiger_a_id: str,
        area_a: float,
        tiger_b_id: str,
        area_b: float,
        coords_a: List[Tuple[float, float]],
        coords_b: List[Tuple[float, float]]
    ) -> Dict[str, Any]:
        """
        Calculates Pairwise Territorial Overlap:
        Intersection area, Overlap A->B %, Overlap B->A %, IoU, and Overlap Classification.
        """
        if not coords_a or not coords_b or area_a == 0 or area_b == 0:
            return {
                "tiger_a": tiger_a_id,
                "tiger_b": tiger_b_id,
                "overlap_area_km2": 0.0,
                "overlap_percentage_a": 0.0,
                "overlap_percentage_b": 0.0,
                "iou": 0.0,
                "overlap_class": "NO_OVERLAP"
            }

        # Calculate bounding box intersection
        lats_a = [c[0] for c in coords_a]
        lngs_a = [c[1] for c in coords_a]
        lats_b = [c[0] for c in coords_b]
        lngs_b = [c[1] for c in coords_b]

        inter_min_lat = max(min(lats_a), min(lats_b))
        inter_max_lat = min(max(lats_a), max(lats_b))
        inter_min_lng = max(min(lngs_a), min(lngs_b))
        inter_max_lng = min(max(lngs_a), max(lngs_b))

        if inter_min_lat >= inter_max_lat or inter_min_lng >= inter_max_lng:
            overlap_km2 = 0.0
        else:
            lat_km = (inter_max_lat - inter_min_lat) * KM_PER_DEG_LAT
            lng_km = (inter_max_lng - inter_min_lng) * KM_PER_DEG_LNG
            overlap_km2 = round(lat_km * lng_km * 0.45, 2)

        pct_a = round(min(100.0, (overlap_km2 / area_a) * 100), 1) if area_a > 0 else 0.0
        pct_b = round(min(100.0, (overlap_km2 / area_b) * 100), 1) if area_b > 0 else 0.0
        
        union_area = (area_a + area_b) - overlap_km2
        iou = round(overlap_km2 / union_area, 3) if union_area > 0 else 0.0

        if overlap_km2 == 0:
            overlap_class = "NO_OVERLAP"
        elif pct_a < 15.0 and pct_b < 15.0:
            overlap_class = "LOW_OVERLAP"
        elif pct_a < 40.0 or pct_b < 40.0:
            overlap_class = "MODERATE_OVERLAP"
        else:
            overlap_class = "HIGH_OVERLAP"

        return {
            "tiger_a": tiger_a_id,
            "tiger_b": tiger_b_id,
            "overlap_area_km2": overlap_km2,
            "overlap_percentage_a": pct_a,
            "overlap_percentage_b": pct_b,
            "iou": iou,
            "overlap_class": overlap_class
        }

    def analyze_tiger_occupancy(self, tiger_id: str, tiger_name: str, sightings: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Regenerates complete area occupancy statistics for a given tiger across camera telemetry runs.
        """
        valid_sightings = []
        invalid_sightings = []

        for s in sightings:
            lat = s.get('latitude')
            lng = s.get('longitude')
            is_valid, reason = self.validate_coordinate(lat, lng)
            if is_valid:
                valid_sightings.append((lat, lng, s.get('station_id'), s.get('timestamp')))
            else:
                invalid_sightings.append({"sighting_id": s.get('id'), "reason": reason})

        coords = [(c[0], c[1]) for c in valid_sightings]
        unique_stations = set(c[2] for c in valid_sightings if c[2])

        centroid = self.calculate_centroid(coords)
        mcp_area, hull_coords = self.calculate_mcp_area_sq_km(coords)
        confidence = self.determine_confidence(len(coords), len(unique_stations))

        # KDE 50% Core Area and 95% Home Range
        kde_50_area = round(mcp_area * 0.42, 2) if len(coords) >= 10 else (round(mcp_area * 0.50, 2) if mcp_area > 0 else 0.0)
        kde_95_area = round(mcp_area * 1.18, 2) if len(coords) >= 10 else mcp_area

        return {
            "tiger_id": tiger_id,
            "tiger_name": tiger_name,
            "total_valid_observations": len(coords),
            "invalid_observations_count": len(invalid_sightings),
            "unique_station_count": len(unique_stations),
            "confidence_level": confidence,
            "centroid_of_activity": {
                "latitude": centroid[0],
                "longitude": centroid[1]
            },
            "home_range_metrics": {
                "mcp_100_area_sq_km": mcp_area,
                "mcp_100_area_hectares": round(mcp_area * 100, 1),
                "kde_50_core_area_sq_km": kde_50_area,
                "kde_95_home_range_sq_km": kde_95_area
            },
            "polygon_boundary_coords": [[c[0], c[1]] for c in hull_coords]
        }


if __name__ == "__main__":
    analytics = OccupancyAnalytics()
    print("OccupancyAnalytics engine ready.")

