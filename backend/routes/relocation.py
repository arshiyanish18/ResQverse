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

    limit = int(data.get("limit", 3))
    selected_village = data.get("village")

    # ==================================================
    # NO VILLAGE SELECTED
    # Return the overall best relocation sites
    # ==================================================

    if not selected_village:

        results = (
            df.sort_values(
                "final_relocation_score",
                ascending=False
            )
            .head(limit)
            .copy()
        )

        # Use the existing overall relocation score
        results["recommendation_score"] = (
            results["final_relocation_score"]
        )

    # ==================================================
    # VILLAGE SELECTED
    # Create personalized recommendations
    # ==================================================

    else:

        # Find selected village
        selected_rows = df[
            df["village_name"].astype(str).str.strip()
            == str(selected_village).strip()
        ]

        if selected_rows.empty:
            return {
                "status": "ERROR",
                "message": "Selected village not found.",
                "count": 0,
                "recommendations": [],
            }

        selected = selected_rows.iloc[0]

        # Remove the selected village itself
        results = df[
            df["village_name"].astype(str).str.strip()
            != str(selected_village).strip()
        ].copy()

        # --------------------------------------------------
        # Calculate distance difference from selected village
        # --------------------------------------------------

        selected_hub_distance = float(
            selected["hub_distance_km"]
        )

        results["distance_from_selected"] = (
            results["hub_distance_km"]
            - selected_hub_distance
        ).abs()

        # --------------------------------------------------
        # Convert distance into a proximity score
        # Closer = higher score
        # --------------------------------------------------

        max_distance = results[
            "distance_from_selected"
        ].max()

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

        # --------------------------------------------------
        # Personalized recommendation score
        #
        # Safety       = 45%
        # Capacity     = 25%
        # Accessibility= 15%
        # Proximity    = 15%
        # --------------------------------------------------

        results["recommendation_score"] = (
            0.45 * results["safety_score"]
            + 0.25 * results["capacity_score"]
            + 0.15 * results["accessibility_score"]
            + 0.15 * results["proximity_score"]
        )

        # --------------------------------------------------
        # IMPORTANT:
        # Sort using the SAME score we display
        # --------------------------------------------------

        results = (
            results.sort_values(
                "recommendation_score",
                ascending=False
            )
            .head(limit)
            .copy()
        )

    # ==================================================
    # BUILD RESPONSE
    # ==================================================

    recommendations = []

    for recommendation_rank, (_, row) in enumerate(
        results.iterrows(),
        start=1
    ):

        actual_score = float(
            row["recommendation_score"]
        )

        recommendations.append({

            "village_name": row["village_name"],

            "location_code": int(
                row["location_code"]
            ),

            # Personalized / actual recommendation score
            "relocation_score": round(
                actual_score,
                4
            ),

            # Same score expressed out of 100
            "score_100": round(
                actual_score * 100,
                2
            ),

            # Rank within THIS recommendation result
            "rank": recommendation_rank,

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