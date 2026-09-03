"""
One-time (re-runnable) script that builds backend/data/grid_terrain.json:
the static terrain layer for every grid point inside the Dibrugarh district
polygon - elevation, slope, aspect, and distance to the nearest river. These
don't change day to day, so they're computed once here instead of being
pulled on every prediction request.

Run from backend/:
    python -m ml.build_grid
"""
from __future__ import annotations

import json
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from services import geo_utils  # noqa: E402
from services import overpass_rivers  # noqa: E402
from services import satellite_data  # noqa: E402

OUTPUT_PATH = geo_utils.DATA_DIR / "grid_terrain.json"

# Meters per degree, approximated locally (fine at Dibrugarh's latitude).
METERS_PER_DEG_LAT = 110_540.0


def _meters_per_deg_lon(lat_deg: float) -> float:
    return 111_320.0 * math.cos(math.radians(lat_deg))


def build() -> dict:
    polygon = geo_utils.load_polygon()
    bbox = geo_utils.district_bbox(polygon)
    spacing = geo_utils.GRID_SPACING_DEG

    # Build a full rectangular candidate grid across the bbox (not just the
    # points inside the polygon) so every in-polygon point has real
    # elevation neighbors to compute slope from, even near the boundary.
    lats = []
    lat = bbox["min_lat"]
    while lat <= bbox["max_lat"] + 1e-9:
        lats.append(round(lat, 5))
        lat += spacing
    lons = []
    lon = bbox["min_lon"]
    while lon <= bbox["max_lon"] + 1e-9:
        lons.append(round(lon, 5))
        lon += spacing

    print(f"Fetching elevation for {len(lats) * len(lons)} candidate grid cells...")
    candidate_points = [(la, lo) for la in lats for lo in lons]
    elevations = satellite_data.get_elevation_batch(candidate_points)
    elev_grid: dict[tuple[float, float], float] = {
        pt: elevations[i] for i, pt in enumerate(candidate_points)
    }

    def elev_at(i: int, j: int) -> float:
        i = min(max(i, 0), len(lats) - 1)
        j = min(max(j, 0), len(lons) - 1)
        return elev_grid[(lats[i], lons[j])]

    print("Fetching real river geometry from OpenStreetMap (Overpass)...")
    river_lines = overpass_rivers.get_river_lines()

    print("Filtering to points inside the district polygon and computing slope/aspect...")
    points = []
    for i, la in enumerate(lats):
        for j, lo in enumerate(lons):
            from shapely.geometry import Point

            if not polygon.contains(Point(lo, la)):
                continue

            dz_dx = (elev_at(i, j + 1) - elev_at(i, j - 1)) / (2 * spacing * _meters_per_deg_lon(la))
            dz_dy = (elev_at(i + 1, j) - elev_at(i - 1, j)) / (2 * spacing * METERS_PER_DEG_LAT)
            slope_deg = math.degrees(math.atan(math.hypot(dz_dx, dz_dy)))
            aspect_deg = (math.degrees(math.atan2(dz_dy, -dz_dx)) + 360) % 360

            dist_river_km = overpass_rivers.distance_to_nearest_river_km(la, lo, river_lines)

            points.append(
                {
                    "lat": la,
                    "lon": lo,
                    "elevation_m": round(elev_grid[(la, lo)], 1),
                    "slope_deg": round(slope_deg, 2),
                    "aspect_deg": round(aspect_deg, 1),
                    "dist_to_river_km": dist_river_km,
                }
            )

    result = {
        "generated_from": "Open-Meteo elevation API (SRTM) + OSM Overpass river geometry",
        "spacing_deg": spacing,
        "point_count": len(points),
        "points": points,
    }
    geo_utils.DATA_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(f"Wrote {len(points)} grid points to {OUTPUT_PATH}")
    return result


if __name__ == "__main__":
    build()
