# Data sources

Every file in this directory (and every feature the backend computes at
request time) comes from a real, freely accessible dataset. Nothing here is
fabricated. This file records provenance, access method, and license/citation
requirements for each.

## `dibrugarh_boundary.geojson`
District polygon for Dibrugarh, Assam (339 vertices).

- **Source**: geoBoundaries, India ADM2 (district) layer, 2023 build.
- **Original authority**: Pathways Data Pvt. Ltd. / lgdirectory.gov.in, via
  geoBoundaries (Runfola et al., 2020, "geoBoundaries: A global database of
  political administrative boundaries", *PLoS ONE*).
- **Fetched from**:
  `https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/IND/ADM2/geoBoundaries-IND-ADM2_simplified.geojson`,
  the `Dibrugarh` feature extracted and saved standalone.
- **License**: Open Data Commons Open Database License (ODbL) 1.0.

## `flood_events_assam.csv`
14 real historical flood events (1985-2019) with centroid coordinates falling
in/near the Assam / Brahmaputra region (bbox lat 23.5-29.0, lon 88.5-97.5).

- **Source**: Dartmouth Flood Observatory, "Global Active Archive of Large
  Flood Events" (Brakenridge, G.R., 1985-2019).
- **Fetched from**: HDX (Humanitarian Data Exchange) mirror,
  `wlf_nhr_fl_dfomasterlist_20190418.zip`
  (`https://data.humdata.org/dataset/global-active-archive-of-large-flood-events-dfo`).
- **Fields kept**: began/ended dates, centroid lat/lon, location description,
  named rivers, dead, displaced, severity, magnitude. Full DFO record set has
  more columns; trimmed here to what feeds the label-anchoring logic in
  `backend/ml/labels.py`.
- **Note**: centroids are event-level (often "Assam" region-wide, not
  Dibrugarh-specific) — used as soft positive anchors, not per-point ground
  truth. Cite Brakenridge (2016) if republishing.

## `landslide_events_ne_india.csv`
53 real historical landslide events from NASA's Global Landslide Catalog,
filtered to a box around Dibrugarh (lat 26.2-28.5, lon 93.7-96.5). Notably
**zero** of these fall strictly inside the Dibrugarh district polygon itself —
they cluster in the neighboring hill districts of Nagaland/Arunachal Pradesh.
That is a genuine finding, not a filtering artifact: Dibrugarh is Brahmaputra
floodplain, and its own landslide exposure is confined to a narrow NE fringe
bordering Arunachal Pradesh (matching 2026 news reports of landslides on
NH-315(A) near the Jeypore forest range). The nearest events (within ~35km of
the district boundary) are used as soft positive anchors for that fringe.

- **Source**: NASA Global Landslide Catalog / COOLR (Cooperative Open Online
  Landslide Repository), Kirschbaum et al.
- **Fetched from**:
  `https://data.nasa.gov/docs/legacy/Global_Landslide_Catalog_Export/Global_Landslide_Catalog_Export_rows.csv`
  (static export, current as of March 2016; COOLR itself is updated
  continuously but its live FeatureServer wasn't reachable from this
  environment).
- **License**: NASA GLC "Permission to Use, Reproduce, and Distribute" —
  citation required for research use.

## `grid_terrain.json` (generated, not committed by hand)
Produced once by `backend/ml/build_grid.py` from:
- **Elevation**: Open-Meteo Elevation API (`api.open-meteo.com/v1/elevation`),
  SRTM-derived, batched multi-point queries.
- **Slope/aspect**: finite-difference of the elevation grid itself.
- **Distance to river**: OpenStreetMap `waterway=river` ways within the
  district bbox, fetched via the Overpass API
  (`overpass-api.de` / `overpass.kumi.systems`), © OpenStreetMap contributors
  (ODbL) — nearest-line distance computed with Shapely.

## Live per-request features (not stored — pulled fresh, cached ~30 min)
All from **Open-Meteo** (`open-meteo.com`), a free, keyless API that
re-serves open institutional datasets — no API key or account required, CC-BY
4.0 attribution:
- Recent/forecast rainfall accumulation: Forecast API (ECMWF/ERA5-based).
- Historical rainfall for model training: Archive API (ERA5 reanalysis).
- Soil moisture: Forecast API hourly `soil_moisture_*` layers (GLDAS/ERA5).
- River discharge: Flood API, daily `river_discharge` (GloFAS hydrological
  model).

## What is genuinely satellite/model-derived vs. what is a documented proxy
- Terrain, rainfall, soil moisture, river discharge, river geometry, and the
  district boundary are all real pulled data — nothing about *those* is
  invented.
- The 67 historical event records above are real but sparse — not dense
  enough, alone, to train a spatial classifier with clean positive/negative
  coverage across the whole grid.
- Because of that gap, **training labels** for the full grid are produced by
  a documented physically-informed susceptibility formula (see
  `backend/ml/labels.py`), boosted near the real event anchors above. XGBoost
  is trained on real historical features against those labels — it is a
  genuine trained model, but its labels are a proxy, not a confirmed-incident
  ground truth. See the module docstring in `labels.py` and the UI's "Model"
  note for the same disclosure.
