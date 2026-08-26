from data_loader import load_sites
from relocation import recommend_site


def main():
    affected_population = 250

    sites = load_sites()

    recommendations = recommend_site(
        sites,
        affected_population
    )

    print("\nRecommended Relocation Sites")
    print("-----------------------------")

    for site in recommendations:
        print(f"{site['name']} - Score: {site['score']}")


if __name__ == "__main__":
    main()
