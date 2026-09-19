import pandas as pd

SCORED = "data/dibrugarh_scored.csv"
COORDS = "../data/village_coordinates.csv"
OUTPUT = "data/dibrugarh_scored_with_coordinates.csv"

# Load files
df = pd.read_csv(SCORED)
coords = pd.read_csv(COORDS)

# Use the existing census code from the scored dataset.
# Prefer censuscode2011_x, otherwise censuscode2011_y.
if "censuscode2011_x" in df.columns:
    df["join_code"] = pd.to_numeric(
        df["censuscode2011_x"], errors="coerce"
    )
elif "censuscode2011_y" in df.columns:
    df["join_code"] = pd.to_numeric(
        df["censuscode2011_y"], errors="coerce"
    )
else:
    raise ValueError("No censuscode2011_x or censuscode2011_y found.")

# Clean coordinate table
coords["join_code"] = pd.to_numeric(
    coords["censuscode2011"], errors="coerce"
)

coords["longitude"] = pd.to_numeric(
    coords["xcoord_2"], errors="coerce"
)

coords["latitude"] = pd.to_numeric(
    coords["ycoord_2"], errors="coerce"
)

# Keep only what we need
coords = coords[
    ["join_code", "longitude", "latitude"]
].dropna(subset=["join_code"])

# Remove duplicate census codes if any
coords = coords.drop_duplicates(
    subset=["join_code"]
)

# Remove old coordinate columns if they somehow exist
df = df.drop(
    columns=["longitude", "latitude"],
    errors="ignore"
)

# Merge coordinates
df = df.merge(
    coords,
    on="join_code",
    how="left"
)

# Remove temporary join column
df = df.drop(columns=["join_code"])

# Save
df.to_csv(OUTPUT, index=False)

print("DONE")
print("Rows:", len(df))
print("Longitude available:", df["longitude"].notna().sum())
print("Latitude available:", df["latitude"].notna().sum())
print("Missing coordinates:", df["longitude"].isna().sum())
print("Saved:", OUTPUT)