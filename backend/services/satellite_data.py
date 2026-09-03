"""
Client for Open-Meteo's free, keyless weather/hydrology/elevation APIs.

This is real pulled data, not fabricated: SRTM-derived elevation, ECMWF/ERA5
reanalysis rainfall (forecast API's `past_days` and the dedicated archive
API), GLDAS/ERA5-based soil moisture, and GloFAS-modelled river discharge.
See backend/data/SOURCES.md for the full provenance notes.

The `get_*_batch` functions take a list of (lat, lon) points and return a
list of per-point dicts in the same order, batching many points into a
handful of HTTP requests (Open-Meteo accepts comma-separated lat/lon lists)
and caching responses briefly so a map refresh doesn't hammer the free
service on every page load.
"""
from __future__ import annotations

import time
from typing import Any

import requests

FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive"
ELEVATION_URL = "https://api.open-meteo.com/v1/elevation"
FLOOD_URL = "https://flood-api.open-meteo.com/v1/flood"

# Open-Meteo doesn't publish a hard per-request location cap, but batching
# too many points into one call risks slow/huge responses - chunk
# defensively.
CHUNK_SIZE = 75
REQUEST_TIMEOUT = 30
CACHE_TTL_SECONDS = 30 * 60

_cache: dict[str, tuple[float, Any]] = {}


def _cache_get(key: str):
    entry = _cache.get(key)
    if not entry:
        return None
    timestamp, value = entry
    if time.time() - timestamp > CACHE_TTL_SECONDS:
        _cache.pop(key, None)
        return None
    return value


def _cache_set(key: str, value: Any) -> None:
    _cache[key] = (time.time(), value)


def _chunks(seq: list, size: int):
    for i in range(0, len(seq), size):
        yield i, seq[i : i + size]


def _as_list(data):
    """Open-Meteo returns a single object for one location and a list for
    multiple - normalize to a list either way."""
    return data if isinstance(data, list) else [data]


def get_elevation_batch(points: list[tuple[float, float]]) -> list[float]:
    cache_key = f"elev:{points}"
    cached = _cache_get(cache_key)
    if cached is not None:
        return cached

    elevations: list[float] = []
    for _, chunk in _chunks(points, CHUNK_SIZE):
        params = {
            "latitude": ",".join(str(p[0]) for p in chunk),
            "longitude": ",".join(str(p[1]) for p in chunk),
        }
        resp = requests.get(ELEVATION_URL, params=params, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        elevations.extend(resp.json()["elevation"])

    _cache_set(cache_key, elevations)
    return elevations


def get_current_rainfall_batch(points: list[tuple[float, float]]) -> list[dict]:
    """24h/7d/30d accumulated rainfall for each point, from the forecast
    API's `past_days` window - real observed/reanalysis daily totals, not a
    forecast."""
    cache_key = f"rain_now:{points}"
    cached = _cache_get(cache_key)
    if cached is not None:
        return cached

    results: list[dict | None] = [None] * len(points)
    for start, chunk in _chunks(points, CHUNK_SIZE):
        params = {
            "latitude": ",".join(str(p[0]) for p in chunk),
            "longitude": ",".join(str(p[1]) for p in chunk),
            "daily": "precipitation_sum",
            "past_days": 30,
            "forecast_days": 1,
            "timezone": "auto",
        }
        resp = requests.get(FORECAST_URL, params=params, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        for i, entry in enumerate(_as_list(resp.json())):
            values = [v for v in entry.get("daily", {}).get("precipitation_sum", []) if v is not None]
            results[start + i] = {
                "rainfall_24h_mm": round(values[-1], 2) if values else 0.0,
                "rainfall_7d_mm": round(sum(values[-7:]), 2) if values else 0.0,
                "rainfall_30d_mm": round(sum(values), 2) if values else 0.0,
            }

    _cache_set(cache_key, results)
    return results


def get_soil_moisture_batch(points: list[tuple[float, float]]) -> list[dict]:
    cache_key = f"soil:{points}"
    cached = _cache_get(cache_key)
    if cached is not None:
        return cached

    results: list[dict | None] = [None] * len(points)
    for start, chunk in _chunks(points, CHUNK_SIZE):
        params = {
            "latitude": ",".join(str(p[0]) for p in chunk),
            "longitude": ",".join(str(p[1]) for p in chunk),
            "hourly": "soil_moisture_0_to_1cm,soil_moisture_1_to_3cm",
            "forecast_days": 1,
            "timezone": "auto",
        }
        resp = requests.get(FORECAST_URL, params=params, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        for i, entry in enumerate(_as_list(resp.json())):
            hourly = entry.get("hourly", {})
            surface = [v for v in hourly.get("soil_moisture_0_to_1cm", []) if v is not None]
            subsurface = [v for v in hourly.get("soil_moisture_1_to_3cm", []) if v is not None]
            results[start + i] = {
                "soil_moisture_surface": round(surface[-1], 3) if surface else None,
                "soil_moisture_subsurface": round(subsurface[-1], 3) if subsurface else None,
            }

    _cache_set(cache_key, results)
    return results


def get_river_discharge_batch(points: list[tuple[float, float]]) -> list[dict]:
    """Current GloFAS-modelled river discharge plus its long-run mean for
    that calendar day, for each point."""
    cache_key = f"discharge:{points}"
    cached = _cache_get(cache_key)
    if cached is not None:
        return cached

    results: list[dict | None] = [None] * len(points)
    for start, chunk in _chunks(points, CHUNK_SIZE):
        params = {
            "latitude": ",".join(str(p[0]) for p in chunk),
            "longitude": ",".join(str(p[1]) for p in chunk),
            "daily": "river_discharge,river_discharge_mean",
            "forecast_days": 1,
        }
        resp = requests.get(FLOOD_URL, params=params, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        for i, entry in enumerate(_as_list(resp.json())):
            daily = entry.get("daily", {})
            discharge = [v for v in daily.get("river_discharge", []) if v is not None]
            mean = [v for v in daily.get("river_discharge_mean", []) if v is not None]
            current = discharge[-1] if discharge else None
            average = mean[-1] if mean else None
            anomaly = (current / average) if (current is not None and average) else None
            results[start + i] = {
                "river_discharge_m3s": round(current, 3) if current is not None else None,
                "river_discharge_anomaly": round(anomaly, 3) if anomaly is not None else None,
            }

    _cache_set(cache_key, results)
    return results


def get_archive_rainfall(lat: float, lon: float, start_date: str, end_date: str) -> list[tuple[str, float]]:
    """Historical daily rainfall for ONE point over a date range - used by
    the training script to build real historical features (not cached; each
    call covers a distinct date range)."""
    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": start_date,
        "end_date": end_date,
        "daily": "precipitation_sum",
        "timezone": "auto",
    }
    resp = requests.get(ARCHIVE_URL, params=params, timeout=REQUEST_TIMEOUT)
    resp.raise_for_status()
    daily = resp.json().get("daily", {})
    times = daily.get("time", [])
    values = daily.get("precipitation_sum", [])
    return list(zip(times, [v if v is not None else 0.0 for v in values]))


def get_archive_soil_moisture(lat: float, lon: float, start_date: str, end_date: str) -> list[tuple[str, float]]:
    """Historical daily-mean subsurface soil moisture for ONE point. Used
    only by the training script; raises on failure so the caller can decide
    on a fallback (see ml/train.py)."""
    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": start_date,
        "end_date": end_date,
        "hourly": "soil_moisture_1_to_3cm",
        "timezone": "auto",
    }
    resp = requests.get(ARCHIVE_URL, params=params, timeout=REQUEST_TIMEOUT)
    resp.raise_for_status()
    hourly = resp.json().get("hourly", {})
    times = hourly.get("time", [])
    values = hourly.get("soil_moisture_1_to_3cm", [])
    # collapse hourly -> daily by averaging each day's readings
    daily: dict[str, list[float]] = {}
    for t, v in zip(times, values):
        if v is None:
            continue
        day = t.split("T")[0]
        daily.setdefault(day, []).append(v)
    return [(day, sum(vals) / len(vals)) for day, vals in daily.items()]


def get_archive_river_discharge(lat: float, lon: float, start_date: str, end_date: str) -> list[tuple[str, float]]:
    """Historical daily GloFAS river discharge for ONE point. Used only by
    the training script; raises on failure so the caller can decide on a
    fallback (see ml/train.py)."""
    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": start_date,
        "end_date": end_date,
        "daily": "river_discharge",
    }
    resp = requests.get(FLOOD_URL, params=params, timeout=REQUEST_TIMEOUT)
    resp.raise_for_status()
    daily = resp.json().get("daily", {})
    times = daily.get("time", [])
    values = daily.get("river_discharge", [])
    return [(t, v) for t, v in zip(times, values) if v is not None]
