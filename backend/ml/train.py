"""
Trains the flood and landslide XGBoost classifiers on real historical
weather data for the Dibrugarh grid, labelled via the hybrid method
documented in ml/labels.py (physically-informed susceptibility formula,
boosted by real historical event anchors).

Requires backend/data/grid_terrain.json to exist first - run
`python -m ml.build_grid` if it doesn't.

Run from backend/:
    python -m ml.train
"""
from __future__ import annotations

import json
import random
import sys
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pandas as pd  # noqa: E402
import xgboost as xgb  # noqa: E402
from sklearn.metrics import accuracy_score, roc_auc_score  # noqa: E402
from sklearn.model_selection import train_test_split  # noqa: E402

from ml import labels as label_lib  # noqa: E402
from ml.schema import FEATURE_COLUMNS  # noqa: E402
from services import geo_utils, satellite_data  # noqa: E402

MODELS_DIR = Path(__file__).resolve().parent / "models"
GRID_PATH = geo_utils.DATA_DIR / "grid_terrain.json"

TRAIN_YEARS = 2
SAMPLE_STRIDE_DAYS = 5
ROLLING_WARMUP_DAYS = 30  # need 30 days of rainfall history before the first sample
RANDOM_SEED = 42


def _rolling_sums(daily_series: list[tuple[str, float]]) -> pd.DataFrame:
    df = pd.DataFrame(daily_series, columns=["date", "rain_mm"])
    df["date"] = pd.to_datetime(df["date"])
    df = df.set_index("date").sort_index()
    df["rain_7d"] = df["rain_mm"].rolling(7, min_periods=1).sum()
    df["rain_30d"] = df["rain_mm"].rolling(30, min_periods=1).sum()
    return df


def build_training_frame(grid_points: list[dict]) -> tuple[pd.DataFrame, dict]:
    end = date.today() - timedelta(days=5)
    start = end - timedelta(days=365 * TRAIN_YEARS)
    start_str, end_str = start.isoformat(), end.isoformat()

    anchors = label_lib.EventAnchors()
    elevations = [p["elevation_m"] for p in grid_points]
    elevation_range = (min(elevations), max(elevations))

    soil_fallback_used = False
    discharge_fallback_used = False
    rng = random.Random(RANDOM_SEED)

    rows: list[dict] = []
    for idx, point in enumerate(grid_points):
        lat, lon = point["lat"], point["lon"]
        print(f"  [{idx + 1}/{len(grid_points)}] pulling history for ({lat}, {lon})...")

        rainfall = _rolling_sums(satellite_data.get_archive_rainfall(lat, lon, start_str, end_str))

        try:
            soil_series = satellite_data.get_archive_soil_moisture(lat, lon, start_str, end_str)
            soil_df = pd.DataFrame(soil_series, columns=["date", "soil"])
            soil_df["date"] = pd.to_datetime(soil_df["date"])
            soil_df = soil_df.set_index("date")
        except Exception:  # noqa: BLE001 - documented fallback below
            soil_fallback_used = True
            soil_df = None

        try:
            discharge_series = satellite_data.get_archive_river_discharge(lat, lon, start_str, end_str)
            disch_df = pd.DataFrame(discharge_series, columns=["date", "discharge"])
            disch_df["date"] = pd.to_datetime(disch_df["date"])
            disch_df = disch_df.set_index("date")
            discharge_mean = disch_df["discharge"].mean() or 1.0
        except Exception:  # noqa: BLE001 - documented fallback below
            discharge_fallback_used = True
            disch_df = None
            discharge_mean = None

        dates = list(rainfall.index)
        for i in range(ROLLING_WARMUP_DAYS, len(dates), SAMPLE_STRIDE_DAYS):
            d = dates[i]
            on_date = d.date()

            rainfall_24h = float(rainfall["rain_mm"].iloc[i])
            rainfall_7d = float(rainfall["rain_7d"].iloc[i])
            rainfall_30d = float(rainfall["rain_30d"].iloc[i])

            if soil_df is not None and d in soil_df.index:
                soil_moisture = float(soil_df.loc[d, "soil"])
            else:
                # Documented fallback (see ml/train.py module docstring /
                # SOURCES.md): approximate subsurface saturation from
                # recent real rainfall when the historical soil-moisture
                # archive call isn't available for this point/date.
                soil_moisture = max(0.10, min(0.45, 0.15 + rainfall_7d / 300.0))

            if disch_df is not None and d in disch_df.index and discharge_mean:
                discharge_anomaly = float(disch_df.loc[d, "discharge"]) / discharge_mean
            else:
                # Documented fallback: approximate discharge anomaly from
                # real recent rainfall relative to a typical Brahmaputra
                # basin weekly monsoon accumulation (~70mm).
                discharge_anomaly = max(0.2, min(3.5, rainfall_7d / 70.0))

            flood_susc = label_lib.flood_susceptibility(
                point["dist_to_river_km"], discharge_anomaly, rainfall_30d, point["elevation_m"], elevation_range
            )
            landslide_susc = label_lib.landslide_susceptibility(
                point["slope_deg"], rainfall_7d, soil_moisture, point["elevation_m"]
            )

            flood_anchor = anchors.near_flood_event(lat, lon, on_date)
            landslide_anchor = anchors.near_landslide_event(lat, lon, on_date)

            rows.append(
                {
                    "elevation_m": point["elevation_m"],
                    "slope_deg": point["slope_deg"],
                    "dist_to_river_km": point["dist_to_river_km"],
                    "rainfall_24h_mm": rainfall_24h,
                    "rainfall_7d_mm": rainfall_7d,
                    "rainfall_30d_mm": rainfall_30d,
                    "soil_moisture_subsurface": soil_moisture,
                    "river_discharge_anomaly": discharge_anomaly,
                    "flood_label": label_lib.sample_label(flood_susc, flood_anchor, rng),
                    "landslide_label": label_lib.sample_label(landslide_susc, landslide_anchor, rng),
                }
            )

    frame = pd.DataFrame(rows)
    meta = {
        "soil_moisture_fallback_used": soil_fallback_used,
        "discharge_fallback_used": discharge_fallback_used,
        "train_start": start_str,
        "train_end": end_str,
        "sample_stride_days": SAMPLE_STRIDE_DAYS,
    }
    return frame, meta


def _train_one(frame: pd.DataFrame, label_col: str) -> tuple[xgb.XGBClassifier, dict]:
    X = frame[FEATURE_COLUMNS]
    y = frame[label_col]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_SEED, stratify=y
    )
    model = xgb.XGBClassifier(
        n_estimators=200,
        max_depth=4,
        learning_rate=0.08,
        subsample=0.85,
        colsample_bytree=0.85,
        eval_metric="logloss",
        random_state=RANDOM_SEED,
    )
    model.fit(X_train, y_train)
    proba = model.predict_proba(X_test)[:, 1]
    preds = (proba >= 0.5).astype(int)
    metrics = {
        "auc": round(float(roc_auc_score(y_test, proba)), 4),
        "accuracy": round(float(accuracy_score(y_test, preds)), 4),
        "positive_rate": round(float(y.mean()), 4),
        "n_train": len(X_train),
        "n_test": len(X_test),
        "feature_importance": {
            col: round(float(imp), 4) for col, imp in zip(FEATURE_COLUMNS, model.feature_importances_)
        },
    }
    return model, metrics


def main() -> None:
    if not GRID_PATH.exists():
        print("grid_terrain.json not found - building it first...")
        from ml import build_grid

        build_grid.build()

    grid = json.loads(GRID_PATH.read_text(encoding="utf-8"))
    grid_points = grid["points"]
    print(f"Loaded {len(grid_points)} grid points. Pulling real historical weather data...")

    frame, pull_meta = build_training_frame(grid_points)
    print(f"Built training frame: {len(frame)} rows.")

    print("Training flood model...")
    flood_model, flood_metrics = _train_one(frame, "flood_label")
    print(f"  flood AUC={flood_metrics['auc']} accuracy={flood_metrics['accuracy']}")

    print("Training landslide model...")
    landslide_model, landslide_metrics = _train_one(frame, "landslide_label")
    print(f"  landslide AUC={landslide_metrics['auc']} accuracy={landslide_metrics['accuracy']}")

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    flood_model.save_model(str(MODELS_DIR / "flood_xgb.json"))
    landslide_model.save_model(str(MODELS_DIR / "landslide_xgb.json"))

    metrics = {
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "feature_columns": FEATURE_COLUMNS,
        "n_grid_points": len(grid_points),
        "n_training_rows": len(frame),
        **pull_meta,
        "flood": flood_metrics,
        "landslide": landslide_metrics,
        "label_methodology": (
            "Hybrid: physically-informed susceptibility formula (see ml/labels.py) "
            "boosted by real historical event anchors (DFO floods, NASA GLC "
            "landslides). Not trained on a dense confirmed-incident ground truth - "
            "see backend/data/SOURCES.md."
        ),
    }
    (MODELS_DIR / "metrics.json").write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    print(f"Saved models and metrics to {MODELS_DIR}")


if __name__ == "__main__":
    main()
