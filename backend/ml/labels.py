"""
Training-label construction for the flood and landslide XGBoost models.

There is no free, dense, point-level ground-truth inventory of historical
flood/landslide occurrences for Dibrugarh district specifically (see
backend/data/SOURCES.md). What IS available is:

  1. Real physical drivers, pulled live: slope, elevation, distance to
     river, rainfall accumulation, soil moisture, river discharge.
  2. A sparse set of real historical events (14 regional floods from the
     Dartmouth Flood Observatory, 53 landslides from NASA's Global Landslide
     Catalog within ~100km of the district, concentrated in the
     neighbouring hill districts).

So labels are built with a documented, literature-informed susceptibility
formula (weights below), with any grid point/date that falls near a real
historical event forced to a positive label ("anchor boosting"). This is a
standard bootstrapping technique in hazard-susceptibility mapping when
incident inventories are thin - it is NOT the same as training on confirmed
per-point ground truth, and that distinction is surfaced in the UI and
README, not just here.
"""
from __future__ import annotations

import csv
import random
from datetime import date, timedelta
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

FLOOD_ANCHOR_RADIUS_KM = 25.0
FLOOD_ANCHOR_DAY_WINDOW = 30
LANDSLIDE_ANCHOR_RADIUS_KM = 35.0
LANDSLIDE_ANCHOR_DAY_WINDOW = 45

# --- physically-informed susceptibility weights -----------------------
# Landslide: slope is the dominant causal factor in the geomorphology
# literature (e.g. Dai & Lee 2002; Pourghasemi et al. 2012), with rainfall
# as the short-term trigger and antecedent soil saturation compounding it.
LANDSLIDE_WEIGHTS = {
    "slope": 0.50,
    "rainfall": 0.25,
    "soil_moisture": 0.20,
    "relief": 0.05,
}

# Flood: proximity to a channel and its current discharge anomaly dominate
# in floodplain hydrology, with accumulated rainfall and low relative
# elevation compounding it.
FLOOD_WEIGHTS = {
    "river_proximity": 0.35,
    "discharge_anomaly": 0.30,
    "rainfall": 0.20,
    "low_elevation": 0.15,
}


def _load_events(filename: str) -> list[dict]:
    path = DATA_DIR / filename
    if not path.exists():
        return []
    with open(path, encoding="utf-8") as f:
        return list(csv.DictReader(f))


def _parse_date(value: str) -> date | None:
    for fmt in ("%Y-%m-%d", "%m/%d/%Y %I:%M:%S %p", "%m/%d/%Y"):
        try:
            from datetime import datetime

            return datetime.strptime(value.strip(), fmt).date()
        except (ValueError, AttributeError):
            continue
    return None


def _haversine_km(lat1, lon1, lat2, lon2) -> float:
    import math

    r = 6371.0088
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlambda / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


class EventAnchors:
    """Loads the real historical event CSVs once and answers "is this
    (point, date) near a real recorded event?" for label boosting."""

    def __init__(self) -> None:
        self.flood_events = []
        for row in _load_events("flood_events_assam.csv"):
            d = _parse_date(row.get("began", ""))
            try:
                lat, lon = float(row["latitude"]), float(row["longitude"])
            except (KeyError, ValueError):
                continue
            if d:
                self.flood_events.append((d, lat, lon))

        self.landslide_events = []
        for row in _load_events("landslide_events_ne_india.csv"):
            d = _parse_date(row.get("event_date", ""))
            try:
                lat, lon = float(row["latitude"]), float(row["longitude"])
            except (KeyError, ValueError):
                continue
            if d:
                self.landslide_events.append((d, lat, lon))

    def near_flood_event(self, lat: float, lon: float, on_date: date) -> bool:
        for d, elat, elon in self.flood_events:
            if abs((d - on_date).days) > FLOOD_ANCHOR_DAY_WINDOW:
                continue
            if _haversine_km(lat, lon, elat, elon) <= FLOOD_ANCHOR_RADIUS_KM:
                return True
        return False

    def near_landslide_event(self, lat: float, lon: float, on_date: date) -> bool:
        for d, elat, elon in self.landslide_events:
            if abs((d - on_date).days) > LANDSLIDE_ANCHOR_DAY_WINDOW:
                continue
            if _haversine_km(lat, lon, elat, elon) <= LANDSLIDE_ANCHOR_RADIUS_KM:
                return True
        return False


def _clip01(x: float) -> float:
    return max(0.0, min(1.0, x))


def landslide_susceptibility(
    slope_deg: float, rainfall_7d_mm: float, soil_moisture_subsurface: float | None, elevation_m: float
) -> float:
    slope_factor = _clip01(slope_deg / 40.0)
    rainfall_factor = _clip01(rainfall_7d_mm / 180.0)
    soil_factor = _clip01(((soil_moisture_subsurface or 0.2) - 0.10) / 0.35)
    relief_factor = _clip01((elevation_m - 100) / 400)
    w = LANDSLIDE_WEIGHTS
    return (
        w["slope"] * slope_factor
        + w["rainfall"] * rainfall_factor
        + w["soil_moisture"] * soil_factor
        + w["relief"] * relief_factor
    )


def flood_susceptibility(
    dist_to_river_km: float,
    discharge_anomaly: float | None,
    rainfall_30d_mm: float,
    elevation_m: float,
    elevation_range: tuple[float, float],
) -> float:
    river_factor = _clip01(1 - (dist_to_river_km / 12.0)) if dist_to_river_km >= 0 else 0.0
    discharge_factor = _clip01(((discharge_anomaly or 1.0) - 0.8) / 1.2)
    rainfall_factor = _clip01(rainfall_30d_mm / 500.0)
    lo, hi = elevation_range
    span = max(hi - lo, 1.0)
    low_elev_factor = _clip01(1 - (elevation_m - lo) / span)
    w = FLOOD_WEIGHTS
    return (
        w["river_proximity"] * river_factor
        + w["discharge_anomaly"] * discharge_factor
        + w["rainfall"] * rainfall_factor
        + w["low_elevation"] * low_elev_factor
    )


def sample_label(susceptibility: float, forced_positive: bool, rng: random.Random) -> int:
    """Bernoulli-sample a binary label from the susceptibility score (so the
    model isn't trained on a perfectly deterministic threshold), with real
    event anchors forcing a positive label regardless of the formula."""
    if forced_positive:
        return 1
    return 1 if rng.random() < susceptibility else 0
