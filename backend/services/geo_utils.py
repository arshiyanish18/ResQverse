"""
Geo utilities for the Dibrugarh hazard grid: loading the real district
boundary (see backend/data/SOURCES.md) and generating an evenly spaced grid
of points that fall inside it.
"""
from __future__ import annotations

import json
import math
from pathlib import Path

from shapely.geometry import Point, shape

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
BOUNDARY_PATH = DATA_DIR / "dibrugarh_boundary.geojson"

# ~0.07 degrees is roughly 7-8km at this latitude - dense enough to look like
# a real risk-grid on the map without generating an unreasonable number of
# outbound API calls per refresh.
GRID_SPACING_DEG = 0.07

EARTH_RADIUS_KM = 6371.0088


def load_boundary() -> dict:
    with open(BOUNDARY_PATH, encoding="utf-8") as f:
        return json.load(f)


def load_polygon():
    boundary = load_boundary()
    return shape(boundary["features"][0]["geometry"])


def district_bbox(polygon=None) -> dict:
    polygon = polygon or load_polygon()
    min_lon, min_lat, max_lon, max_lat = polygon.bounds
    return {
        "min_lon": min_lon,
        "min_lat": min_lat,
        "max_lon": max_lon,
        "max_lat": max_lat,
    }


def district_center(polygon=None) -> dict:
    polygon = polygon or load_polygon()
    centroid = polygon.centroid
    return {"lat": centroid.y, "lon": centroid.x}


def generate_grid_points(spacing_deg: float = GRID_SPACING_DEG) -> list[tuple[float, float]]:
    """Return [(lat, lon), ...] for every point of a regular lat/lon grid
    that falls inside the Dibrugarh district polygon."""
    polygon = load_polygon()
    bbox = district_bbox(polygon)

    points: list[tuple[float, float]] = []
    lat = bbox["min_lat"]
    while lat <= bbox["max_lat"]:
        lon = bbox["min_lon"]
        while lon <= bbox["max_lon"]:
            if polygon.contains(Point(lon, lat)):
                points.append((round(lat, 5), round(lon, 5)))
            lon += spacing_deg
        lat += spacing_deg
    return points


def is_near_district(lat: float, lon: float, buffer_deg: float = 0.1) -> bool:
    polygon = load_polygon()
    return polygon.buffer(buffer_deg).contains(Point(lon, lat))


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlambda / 2) ** 2
    return 2 * EARTH_RADIUS_KM * math.asin(math.sqrt(a))
