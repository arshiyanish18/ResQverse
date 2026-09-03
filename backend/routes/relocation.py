from fastapi import APIRouter
import pandas as pd

router = APIRouter()

CSV_PATH = "data/dibrugarh_scored.csv"


@router.get("/villages")
def get_villages():
    df = pd.read_csv(CSV_PATH)

    villages = []

    for _, row in df.iterrows():
        villages.append({
            "village_name": row["village_name"],
            "location_code": int(row["location_code"]),
            "population": int(row["population"]),
            "safety_score": round(
                float(row["safety_score"]), 4
            ),
            "accessibility_score": round(
                float(row["accessibility_score"]), 4
            ),
        })

    return {
        "status": "SUCCESS",
        "count": len(villages),
        "villages": villages,
    }


@router.post("/recommend")
def recommend_relocation(data: dict):
    df = pd.read_csv(CSV_PATH)

    limit = int(data.get("limit", 10))
    selected_village = data.get("village")

    if selected_village:
        results = df[
            df["village_name"] != selected_village
        ].copy()
    else:
        results = df.copy()

    results = results.sort_values(
        "final_relocation_score",
        ascending=False
    ).head(limit)

    recommendations = []

    for _, row in results.iterrows():
        recommendations.append({
            "village_name": row["village_name"],
            "location_code": int(row["location_code"]),
            "relocation_score": round(
                float(row["final_relocation_score"]), 4
            ),
            "score_100": round(
                float(row["final_relocation_score_100"]), 2
            ),
            "rank": int(row["final_rank"]),
            "safety_score": round(
                float(row["safety_score"]), 4
            ),
            "capacity_score": round(
                float(row["capacity_score"]), 4
            ),
            "distance_km": round(
                float(row["hub_distance_km"]), 2
            ),
        })

    return {
        "status": "SUCCESS",
        "count": len(recommendations),
        "recommendations": recommendations,
    }