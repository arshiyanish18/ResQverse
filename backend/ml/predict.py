"""Loads the trained XGBoost models and scores feature rows. Import this
from routes/prediction.py (which runs with backend/ as the working
directory, same as app.py's existing `from routes.vulnerability import ...`
style)."""
from __future__ import annotations

import json
from pathlib import Path

import pandas as pd
import xgboost as xgb

from ml.schema import FEATURE_COLUMNS

MODELS_DIR = Path(__file__).resolve().parent / "models"

_flood_model: xgb.XGBClassifier | None = None
_landslide_model: xgb.XGBClassifier | None = None
_metrics: dict | None = None


def _load_model(filename: str) -> xgb.XGBClassifier:
    model = xgb.XGBClassifier()
    model.load_model(str(MODELS_DIR / filename))
    return model


def _ensure_loaded() -> None:
    global _flood_model, _landslide_model, _metrics
    if _flood_model is None:
        _flood_model = _load_model("flood_xgb.json")
    if _landslide_model is None:
        _landslide_model = _load_model("landslide_xgb.json")
    if _metrics is None:
        metrics_path = MODELS_DIR / "metrics.json"
        _metrics = json.loads(metrics_path.read_text(encoding="utf-8")) if metrics_path.exists() else {}


def models_available() -> bool:
    return (MODELS_DIR / "flood_xgb.json").exists() and (MODELS_DIR / "landslide_xgb.json").exists()


def get_metrics() -> dict:
    _ensure_loaded()
    return _metrics or {}


def predict(features: list[dict]) -> tuple[list[float], list[float]]:
    """features: list of dicts with FEATURE_COLUMNS keys. Returns
    (flood_risk_pct[], landslide_risk_pct[]) in the same order."""
    _ensure_loaded()
    frame = pd.DataFrame(features)[FEATURE_COLUMNS]
    flood_proba = _flood_model.predict_proba(frame)[:, 1]
    landslide_proba = _landslide_model.predict_proba(frame)[:, 1]
    flood_pct = [round(float(p) * 100, 1) for p in flood_proba]
    landslide_pct = [round(float(p) * 100, 1) for p in landslide_proba]
    return flood_pct, landslide_pct
