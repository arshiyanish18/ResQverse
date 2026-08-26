from hazard import check_hazard
from capacity import check_capacity
from scoring import calculate_score


def recommend_site(sites, affected_population):
    suitable_sites = []

    for site in sites:
        if not check_hazard(site):
            continue

        if not check_capacity(site, affected_population):
            continue

        score = calculate_score(site)

        suitable_sites.append({
            "name": site["name"],
            "score": score
        })

    suitable_sites.sort(key=lambda x: x["score"], reverse=True)

    return suitable_sites
