"""Shared feature schema used identically at training time (ml/train.py) and
serving time (routes/prediction.py) - the column order the XGBoost models
were fit on must match exactly."""

FEATURE_COLUMNS = [
    "elevation_m",
    "slope_deg",
    "dist_to_river_km",
    "rainfall_24h_mm",
    "rainfall_7d_mm",
    "rainfall_30d_mm",
    "soil_moisture_subsurface",
    "river_discharge_anomaly",
]

RISK_THRESHOLDS = [
    (75, "CRITICAL"),
    (50, "HIGH"),
    (25, "MODERATE"),
    (0, "LOW"),
]


def risk_category(pct: float) -> str:
    for threshold, label in RISK_THRESHOLDS:
        if pct >= threshold:
            return label
    return "LOW"
