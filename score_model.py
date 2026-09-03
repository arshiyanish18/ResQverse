import pandas as pd
import numpy as np

df = pd.read_csv("backend/data/dibrugarh.csv")


# Convert Census amenity values into 0–1 scores
def amenity_score(value):
    if pd.isna(value):
        return 0.0

    value = str(value).strip().lower()

    if value == "yes":
        return 1.0
    elif value == "no":
        return 0.0
    elif value == "a":
        return 0.75       # facility < 5 km
    elif value == "b":
        return 0.50       # facility 5–10 km
    elif value == "c":
        return 0.25       # facility 10+ km

    # Numeric facility count
    try:
        number = float(value)
        return 1.0 if number > 0 else 0.0
    except ValueError:
        return 0.0


# Amenities we can reliably use from Appendix VD
amenity_columns = [
    "primary_school",
    "middle_school",
    "secondary_school",
    "senior_secondary_school",
    "phs",
    "phc",
    "hospital_allopathic",
    "tap_water",
    "tube_well",
    "mobile_coverage",
    "internet_csc",
    "bus_service",
    "pucca_roads",
    "bank",
    "pds_shop",
    "anganwadi",
    "asha",
    "electricity_all_uses"
]


# Convert each amenity column to a numeric score
for column in amenity_columns:
    df[column + "_score"] = df[column].apply(amenity_score)


# Overall amenity score
score_columns = [column + "_score" for column in amenity_columns]

df["amenity_score"] = df[score_columns].mean(axis=1)
# -----------------------------
# CAPACITY SCORE
# -----------------------------

# Census does not provide actual relocation/shelter capacity.
# Therefore, create a provisional capacity proxy from:
# population density + essential service availability.

# Space available per person (hectares/person)
df["space_per_person"] = df["area_ha"] / df["population"].replace(0, pd.NA)

# Normalize space availability using the dataset
space_score = (
    df["space_per_person"] - df["space_per_person"].min()
) / (
    df["space_per_person"].max() - df["space_per_person"].min()
)

space_score = space_score.fillna(0)

# Essential infrastructure component
essential_cols = [
    "primary_school",
    "tap_water",
    "pucca_roads",
    "bank",
    "electricity_domestic",
    "pds_shop",
    "anganwadi"
]

essential_score = 0

for col in essential_cols:
    essential_score += df[col].apply(
        lambda x: 1 if str(x).strip().lower() == "yes" or str(x).strip().isdigit()
        else 0
    )

essential_score = essential_score / len(essential_cols)

# Final provisional capacity score
df["capacity_score"] = (
    0.6 * space_score +
    0.4 * essential_score
)

df["capacity_score"] = df["capacity_score"].clip(0, 1)
# -----------------------------
# ACCESSIBILITY SCORE
# -----------------------------

# Census amenity/transport indicators.
# Yes = facility available in the village.
# a = facility available within <5 km
# b = 5–10 km
# c = 10+ km

accessibility_cols = [
    "bus_service",
    "railway_station",
    "auto",
    "taxi",
    "national_highway",
    "state_highway",
    "major_district_road",
    "other_district_road",
    "pucca_roads",
    "footpaths"
]

def accessibility_value(x):
    x = str(x).strip().lower()

    if x == "yes":
        return 1.0
    elif x == "a":
        return 0.75
    elif x == "b":
        return 0.50
    elif x == "c":
        return 0.25
    else:
        return 0.0


# Convert each transport/accessibility field to a score
for col in accessibility_cols:
    df[col + "_score"] = df[col].apply(accessibility_value)


# Average all accessibility indicators
df["accessibility_score"] = df[
    [col + "_score" for col in accessibility_cols]
].mean(axis=1)

# Keep score between 0 and 1
df["accessibility_score"] = df["accessibility_score"].clip(0, 1)
# -----------------------------
# ENVIRONMENT SCORE
# -----------------------------

# Land-use indicators available in the Census dataset.
# Higher suitable/open land = better suitability.
# Forest and barren land are treated as less suitable for relocation.

land_cols = [
    "area_ha",
    "forest_ha",
    "non_agricultural_ha",
    "barren_uncultivable_ha",
    "pasture_ha",
    "culturable_waste_ha",
    "fallow_ha",
    "current_fallow_ha",
    "net_area_sown_ha",
    "irrigated_ha",
    "unirrigated_ha"
]

# Prevent division by zero
safe_area = df["area_ha"].replace(0, pd.NA)

# Calculate proportions of land use
df["non_agri_ratio"] = df["non_agricultural_ha"] / safe_area
df["barren_ratio"] = df["barren_uncultivable_ha"] / safe_area
df["forest_ratio"] = df["forest_ha"] / safe_area

# Potentially usable/open land
df["usable_land_ratio"] = (
    df["culturable_waste_ha"] +
    df["fallow_ha"] +
    df["current_fallow_ha"]
) / safe_area

# Replace invalid values
df["usable_land_ratio"] = df["usable_land_ratio"].fillna(0)

# Convert land-use characteristics into suitability.
# More usable/open land improves suitability.
# More barren/non-agricultural/forest land reduces suitability.

df["environment_raw"] = (
    0.50 * df["usable_land_ratio"]
    + 0.30 * (1 - df["barren_ratio"].clip(0, 1))
    + 0.20 * (1 - df["forest_ratio"].clip(0, 1))
)

# Normalize to 0–1
minimum = df["environment_raw"].min()
maximum = df["environment_raw"].max()

if maximum > minimum:
    df["environment_score"] = (
        (df["environment_raw"] - minimum) /
        (maximum - minimum)
    )
else:
    df["environment_score"] = 0.0

df["environment_score"] = df["environment_score"].clip(0, 1)
# -----------------------------
# PROVISIONAL RELOCATION SCORE
# -----------------------------
# Replace missing factor scores with 0
score_columns = [
    "amenity_score",
    "capacity_score",
    "accessibility_score",
    "environment_score"
]

for col in score_columns:
    df[col] = df[col].fillna(0)
df["relocation_score"] = (
    0.25 * df["amenity_score"]
    + 0.25 * df["capacity_score"]
    + 0.30 * df["accessibility_score"]
    + 0.20 * df["environment_score"]
)

# Convert to 0-100
df["relocation_score_100"] = df["relocation_score"] * 100

# Rank villages
df["rank"] = (
    df["relocation_score"]
    .rank(method="min", ascending=False)
    .fillna(9999)
    .astype(int)
)

# Sort best → worst
df = df.sort_values("relocation_score", ascending=False)

print("\nTOP 20 RELOCATION SITES")
print(
    df[
        [
            "village_name",
            "amenity_score",
            "capacity_score",
            "accessibility_score",
            "environment_score",
            "relocation_score_100",
            "rank"
        ]
    ].head(20).to_string(index=False)
)

# Save final scored dataset
df.to_csv(
    "backend/data/dibrugarh_scored.csv",
    index=False
)

print("\nFinal scored dataset saved successfully.")


# Save result
df.to_csv("backend/data/dibrugarh_scored.csv", index=False)

print("Scoring completed!")
print("Rows:", len(df))
print("Columns:", len(df.columns))
print()
print(
    df[
        ["village_name", "population", "households", "amenity_score"]
    ].head(10).to_string(index=False)
)

print()
print("Saved to: data/dibrugarh_scored.csv")