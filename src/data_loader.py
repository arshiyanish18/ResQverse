import csv


def load_sites():
    sites = []

    with open("data/raw/sites.csv", "r", newline="") as file:
        reader = csv.DictReader(file)

        for row in reader:
            sites.append({
                "name": row["name"],
                "capacity": int(row["capacity"]),
                "flood_risk": float(row["flood_risk"]),
                "landslide_risk": float(row["landslide_risk"]),
                "distance": float(row["distance"])
            })

    return sites
