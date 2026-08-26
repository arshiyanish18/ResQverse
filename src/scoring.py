def calculate_score(site):
    safety_score = (
        (1 - site["flood_risk"]) * 40
        + (1 - site["landslide_risk"]) * 30
    )

    distance_score = max(0, 30 - site["distance"] * 3)

    total_score = safety_score + distance_score

    return round(total_score, 2)
