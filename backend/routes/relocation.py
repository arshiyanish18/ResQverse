from fastapi import APIRouter
import pandas as pd
import math

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

    limit = int(data.get("limit", 3))
    selected_village = data.get("village")

    # --------------------------------------------------
    # If no village is selected, return overall best sites
    # --------------------------------------------------
    if not selected_village:
        results = (
            df.sort_values(
                "final_relocation_score",
                ascending=False
            )
            .head(limit)
            .copy()
        )

    else:
        # --------------------------------------------------
        # Find the selected village
        # --------------------------------------------------
        selected_rows = df[
            df["village_name"].astype(str).str.strip()
            == str(selected_village).strip()
        ]

        if selected_rows.empty:
            return {
                "status": "ERROR",
                "message": "Selected village not found.",
                "recommendations": [],
            }

        selected = selected_rows.iloc[0]

        # --------------------------------------------------
        # Create candidate villages
        # --------------------------------------------------
        results = df[
            df["village_name"].astype(str).str.strip()
            != str(selected_village).strip()
        ].copy()

        # --------------------------------------------------
        # Personalized recommendation score
        #
        # Higher:
        #   safety
        #   capacity
        #   accessibility
        #
        # Better:
        #   closer to selected village
        # --------------------------------------------------

        selected_hub_distance = float(
            selected["hub_distance_km"]
        )

        results["distance_from_selected"] = (
            results["hub_distance_km"]
            - selected_hub_distance
        ).abs()

        # Normalize distance.
        # Closer = higher score.
        max_distance = results["distance_from_selected"].max()

        if max_distance > 0:
            results["proximity_score"] = (
                1
                - (
                    results["distance_from_selected"]
                    / max_distance
                )
            )
        else:
            results["proximity_score"] = 1.0

        # Personalized score
        results["personalized_score"] = (
            0.45 * results["safety_score"]
            + 0.25 * results["capacity_score"]
            + 0.15 * results["accessibility_score"]
            + 0.15 * results["proximity_score"]
        )

        results = (
            results.sort_values(
                "personalized_score",
                ascending=False
            )
            .head(limit)
            .copy()
        )

    # --------------------------------------------------
    # Build API response
    # --------------------------------------------------

    recommendations = []

    for _, row in results.iterrows():

        recommendations.append({
            "village_name": row["village_name"],
            "location_code": int(row["location_code"]),

            "relocation_score": round(
                float(row["final_relocation_score"]),
                4
            ),

            "score_100": round(
                float(row["final_relocation_score_100"]),
                2
            ),

            "rank": int(row["final_rank"]),

            "safety_score": round(
                float(row["safety_score"]),
                4
            ),

            "capacity_score": round(
                float(row["capacity_score"]),
                4
            ),

            "distance_km": round(
                float(row["hub_distance_km"]),
                2
            ),
        })

    return {
        "status": "SUCCESS",
        "count": len(recommendations),
        "recommendations": recommendations,
    }