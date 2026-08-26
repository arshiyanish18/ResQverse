def check_hazard(site):
    if site["flood_risk"] > 0.5:
        return False

    if site["landslide_risk"] > 0.5:
        return False

    return True
