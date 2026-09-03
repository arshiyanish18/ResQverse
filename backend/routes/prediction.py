"""
Flood & landslide risk endpoints for Dibrugarh district. Live features are
pulled from Open-Meteo (real SRTM elevation/derived slope from
backend/data/grid_terrain.json, plus live rainfall/soil-moisture/river-
discharge - see backend/data/SOURCES.md), then scored by the XGBoost models
trained in ml/train.py.
"""
from __future__ import annotations

import json
import time
from pathlib import Path

from fastapi import APIRouter, HTTPException, Query

from ml import predict as predict_lib
from ml.schema import risk_category
from services import geo_utils, satellite_data

router = APIRouter()

GRID_PATH = geo_utils.DATA_DIR / "grid_terrain.json"

_grid_cache: dict | None = None
_response_cache: dict[str, tuple[float, dict]] = {}
RESPONSE_CACHE_TTL_SECONDS = 30 * 60


def _load_grid() -> dict:
    global _grid_cache
    if _grid_cache is None:
        if not GRID_PATH.exists():
            raise HTTPException(
                status_code=503,
                detail=(
                    "grid_terrain.json not found. Run `python -m ml.build_grid` "
                    "(and `python -m ml.train`) from the backend/ directory first."
                ),
            )
        _grid_cache = json.loads(GRID_PATH.read_text(encoding="utf-8"))
    return _grid_cache


def _require_models() -> None:
    if not predict_lib.models_available():
        raise HTTPException(
            status_code=503,
            detail="XGBoost models not found. Run `python -m ml.train` from the backend/ directory first.",
        )


def _combine_risk(flood_pct: float, landslide_pct: float) -> float:
    pf, pl = flood_pct / 100, landslide_pct / 100
    return round((1 - (1 - pf) * (1 - pl)) * 100, 1)


def _score_points(points: list[dict]) -> list[dict]:
    """points: list of dicts with lat, lon, elevation_m, slope_deg,
    dist_to_river_km. Pulls live weather features and scores them."""
    _require_models()
    coords = [(p["lat"], p["lon"]) for p in points]

    rainfall = satellite_data.get_current_rainfall_batch(coords)
    soil = satellite_data.get_soil_moisture_batch(coords)
    discharge = satellite_data.get_river_discharge_batch(coords)

    feature_rows = []
    for i, p in enumerate(points):
        soil_moisture = soil[i].get("soil_moisture_subsurface")
        if soil_moisture is None:
            soil_moisture = 0.2
        discharge_anomaly = discharge[i].get("river_discharge_anomaly")
        if discharge_anomaly is None:
            discharge_anomaly = 1.0
        feature_rows.append(
            {
                "elevation_m": p["elevation_m"],
                "slope_deg": p["slope_deg"],
                "dist_to_river_km": p["dist_to_river_km"],
                "rainfall_24h_mm": rainfall[i]["rainfall_24h_mm"],
                "rainfall_7d_mm": rainfall[i]["rainfall_7d_mm"],
                "rainfall_30d_mm": rainfall[i]["rainfall_30d_mm"],
                "soil_moisture_subsurface": soil_moisture,
                "river_discharge_anomaly": discharge_anomaly,
            }
        )

    flood_pct, landslide_pct = predict_lib.predict(feature_rows)

    results = []
    for i, p in enumerate(points):
        combined = _combine_risk(flood_pct[i], landslide_pct[i])
        results.append(
            {
                "lat": p["lat"],
                "lon": p["lon"],
                "elevation_m": p["elevation_m"],
                "slope_deg": p["slope_deg"],
                "dist_to_river_km": p["dist_to_river_km"],
                "rainfall_24h_mm": feature_rows[i]["rainfall_24h_mm"],
                "rainfall_7d_mm": feature_rows[i]["rainfall_7d_mm"],
                "rainfall_30d_mm": feature_rows[i]["rainfall_30d_mm"],
                "soil_moisture_subsurface": feature_rows[i]["soil_moisture_subsurface"],
                "river_discharge_m3s": discharge[i].get("river_discharge_m3s"),
                "river_discharge_anomaly": feature_rows[i]["river_discharge_anomaly"],
                "flood_risk_pct": flood_pct[i],
                "landslide_risk_pct": landslide_pct[i],
                "combined_risk_pct": combined,
                "risk_category": risk_category(combined),
            }
        )
    return results


@router.get("/district")
def get_district():
    boundary = geo_utils.load_boundary()
    polygon = geo_utils.load_polygon()
    return {
        "name": "Dibrugarh",
        "state": "Assam, India",
        "boundary": boundary,
        "bbox": geo_utils.district_bbox(polygon),
        "center": geo_utils.district_center(polygon),
    }


@router.get("/grid")
def get_grid():
    cached = _response_cache.get("grid")
    if cached and (time.time() - cached[0] < RESPONSE_CACHE_TTL_SECONDS):
        return cached[1]

    grid = _load_grid()
    results = _score_points(grid["points"])
    model_metrics = predict_lib.get_metrics()

    response = {
        "district": "Dibrugarh",
        "point_count": len(results),
        "points": results,
        "model": {
            "type": "XGBoost (gradient-boosted trees), 2 binary classifiers (flood, landslide)",
            "trained_at": model_metrics.get("trained_at"),
            "flood_auc": model_metrics.get("flood", {}).get("auc"),
            "landslide_auc": model_metrics.get("landslide", {}).get("auc"),
            "label_methodology": model_metrics.get("label_methodology"),
        },
    }
    _response_cache["grid"] = (time.time(), response)
    return response


@router.get("/point")
def get_point(lat: float = Query(...), lon: float = Query(...)):
    if not geo_utils.is_near_district(lat, lon):
        raise HTTPException(status_code=400, detail="Point is too far from Dibrugarh district to score.")

    from services import overpass_rivers

    elevation = satellite_data.get_elevation_batch([(lat, lon)])[0]
    dist_to_river = overpass_rivers.distance_to_nearest_river_km(lat, lon)

    # Slope isn't well-defined for a single ad-hoc point without neighbors;
    # approximate it from the nearest grid cell's slope.
    grid = _load_grid()
    nearest = min(
        grid["points"],
        key=lambda p: geo_utils.haversine_km(lat, lon, p["lat"], p["lon"]),
    )

    point = {
        "lat": lat,
        "lon": lon,
        "elevation_m": elevation,
        "slope_deg": nearest["slope_deg"],
        "dist_to_river_km": dist_to_river,
    }
    return _score_points([point])[0]
