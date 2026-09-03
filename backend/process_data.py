import pandas as pd
from pathlib import Path

INPUT_FILE = Path("data/Appendix_VD_1811.xls")
OUTPUT_FILE = Path("data/dibrugarh.csv")


# Read the Census Excel file
df = pd.read_excel(
    INPUT_FILE,
    sheet_name="Sheet1",
    header=None
)

# Actual village data begins at row 8
data = df.iloc[8:].copy()

# Keep only the useful columns
columns = {
    1: "village_name",
    2: "location_code",
    3: "area_ha",
    4: "population",
    5: "households",

    # Education
    7: "primary_school",
    8: "middle_school",
    9: "secondary_school",
    10: "senior_secondary_school",

    # Medical
    20: "chc",
    21: "phc",
    22: "phs",
    25: "hospital_allopathic",
    27: "dispensary",
    36: "medicine_shop",

    # Water
    38: "tap_water",
    39: "well_water",
    40: "hand_pump",
    41: "tube_well",
    43: "river_canal",
    44: "pond_lake",

    # Sanitation
    46: "community_toilet_bath",
    47: "community_toilet",

    # Communication / transport
    56: "mobile_coverage",
    57: "internet_csc",
    59: "bus_service",
    60: "railway_station",
    61: "auto",
    62: "taxi",

    # Roads
    67: "national_highway",
    68: "state_highway",
    69: "major_district_road",
    70: "other_district_road",
    71: "pucca_roads",
    72: "kutcha_roads",
    75: "footpaths",

    # Banking / essential facilities
    76: "bank",
    77: "atm",
    78: "agricultural_credit_society",
    80: "pds_shop",
    84: "icds",
    85: "anganwadi",
    87: "asha",

    # Electricity
    97: "electricity_domestic",
    98: "electricity_agricultural",
    99: "electricity_commercial",
    100: "electricity_all_uses",

    # Land use
    103: "forest_ha",
    104: "non_agricultural_ha",
    105: "barren_uncultivable_ha",
    106: "pasture_ha",
    108: "culturable_waste_ha",
    109: "fallow_ha",
    110: "current_fallow_ha",
    111: "net_area_sown_ha",
    112: "irrigated_ha",
    113: "unirrigated_ha",
}

data = data.rename(columns=columns)

# Keep only columns we selected
data = data[list(columns.values())]

# Remove completely empty village names
data = data[data["village_name"].notna()]

# Remove rows that are not actual villages
data["village_name"] = data["village_name"].astype(str).str.strip()

# Convert numeric columns
numeric_columns = [
    "location_code",
    "area_ha",
    "population",
    "households",
    "chc",
    "phc",
    "phs",
    "hospital_allopathic",
    "dispensary",
    "medicine_shop",
    "forest_ha",
    "non_agricultural_ha",
    "barren_uncultivable_ha",
    "pasture_ha",
    "culturable_waste_ha",
    "fallow_ha",
    "current_fallow_ha",
    "net_area_sown_ha",
    "irrigated_ha",
    "unirrigated_ha",
]

for column in numeric_columns:
    data[column] = pd.to_numeric(data[column], errors="coerce")

# Remove rows with no population and no households
data = data[
    ~(
        (data["population"].fillna(0) == 0)
        & (data["households"].fillna(0) == 0)
    )
]

# Save
data.to_csv(OUTPUT_FILE, index=False)

print("Dataset created successfully.")
print(f"Rows: {len(data)}")
print(f"Columns: {len(data.columns)}")
print(f"Saved to: {OUTPUT_FILE}")