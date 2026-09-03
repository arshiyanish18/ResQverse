"""
Real river geometry for Dibrugarh district, from OpenStreetMap via the
public Overpass API (c) OpenStreetMap contributors, ODbL - see
backend/data/SOURCES.md. Queried live once, then cached to
backend/data/rivers_cache.geojson so later runs (and the training script)
don't need to hit Overpass every time.
"""
from __future__ import annotations

import json

import requests
from shapely.geometry import LineString, Point
from shapely.ops import nearest_points

from .geo_utils import DATA_DIR, district_bbox, haversine_km

RIVERS_CACHE_PATH = DATA_DIR / "rivers_cache.geojson"

# Try a few public Overpass mirrors - the main instance occasionally times
# out under load.
OVERPASS_ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
]

REQUEST_TIMEOUT = 45


def _fetch_rivers_from_overpass(bbox: dict) -> dict:
    query = (
        "[out:json][timeout:30];"
        f'way["waterway"="river"]'
        f'({bbox["min_lat"]},{bbox["min_lon"]},{bbox["max_lat"]},{bbox["max_lon"]});'
        "out geom;"
    )
    last_error: Exception | None = None
    for url in OVERPASS_ENDPOINTS:
        try:
            resp = requests.post(url, data={"data": query}, timeout=REQUEST_TIMEOUT)
            resp.raise_for_status()
            return resp.json()
        except Exception as exc:  # noqa: BLE001 - fall through to next mirror
            last_error = exc
            continue
    raise RuntimeError(f"All Overpass endpoints failed: {last_error}")


def get_river_lines(refresh: bool = False) -> list[LineString]:
    """Real OSM waterway=river geometry as shapely LineStrings, cached
    locally after the first fetch."""
    if not refresh and RIVERS_CACHE_PATH.exists():
        raw = json.loads(RIVERS_CACHE_PATH.read_text(encoding="utf-8"))
    else:
        bbox = district_bbox()
        # Buffer the query bbox so rivers that skirt just outside the
        # district polygon (e.g. the Brahmaputra's main channel) still count.
        buffered = {
            "min_lat": bbox["min_lat"] - 0.15,
            "min_lon": bbox["min_lon"] - 0.15,
            "max_lat": bbox["max_lat"] + 0.15,
            "max_lon": bbox["max_lon"] + 0.15,
        }
        raw = _fetch_rivers_from_overpass(buffered)
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        RIVERS_CACHE_PATH.write_text(json.dumps(raw), encoding="utf-8")

    lines: list[LineString] = []
    for element in raw.get("elements", []):
        geometry = element.get("geometry")
        if not geometry or len(geometry) < 2:
            continue
        lines.append(LineString([(pt["lon"], pt["lat"]) for pt in geometry]))
    return lines


def distance_to_nearest_river_km(
    lat: float, lon: float, lines: list[LineString] | None = None
) -> float:
    if lines is None:
        lines = get_river_lines()
    if not lines:
        return -1.0

    point = Point(lon, lat)
    best_km: float | None = None
    for line in lines:
        nearest_on_line = nearest_points(point, line)[1]
        distance_km = haversine_km(lat, lon, nearest_on_line.y, nearest_on_line.x)
        if best_km is None or distance_km < best_km:
            best_km = distance_km
    return round(best_km, 3) if best_km is not None else -1.0
