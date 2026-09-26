import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Circle,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

const API_BASE_URL = "https://resqverse-sgqz.onrender.com";

const DEFAULT_CENTER = [27.4728, 94.912];

function MapUpdater({ center }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, map.getZoom(), {
      duration: 0.8,
    });
  }, [center, map]);

  return null;
}

function getLatitude(item) {
  const value =
    item.latitude ??
    item.lat ??
    item.coordinates?.latitude ??
    item.coordinates?.lat;

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

function getLongitude(item) {
  const value =
    item.longitude ??
    item.lng ??
    item.lon ??
    item.coordinates?.longitude ??
    item.coordinates?.lng ??
    item.coordinates?.lon;

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

function getRisk(item) {
  if (
    item.risk_score !== undefined &&
    item.risk_score !== null
  ) {
    return Number(item.risk_score);
  }

  if (
    item.risk !== undefined &&
    item.risk !== null
  ) {
    return Number(item.risk);
  }

  if (
    item.safety_score !== undefined &&
    item.safety_score !== null
  ) {
    return (
      (1 - Number(item.safety_score)) * 100
    );
  }

  return 0;
}

function getRiskLevel(risk) {
  if (risk >= 85) return "CRITICAL";
  if (risk >= 70) return "HIGH";
  if (risk >= 50) return "MODERATE";
  return "LOW";
}

function getRiskColor(risk) {
  if (risk >= 85) return "#dc2626";
  if (risk >= 70) return "#ea580c";
  if (risk >= 50) return "#ca8a04";
  return "#16a34a";
}

function RedZoneMap() {
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [satellite, setSatellite] = useState(true);
  const [selectedVillage, setSelectedVillage] =
    useState(null);

  useEffect(() => {
    const loadVillages = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_BASE_URL}/api/relocation/villages`
        );

        if (!response.ok) {
          throw new Error("Failed to load village data.");
        }

        const data = await response.json();

        setVillages(data.villages || []);
        setError("");
      } catch (err) {
        console.error(err);
        setError(
          "Unable to load live habitation data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadVillages();
  }, []);

  const mappedVillages = useMemo(() => {
    return villages
      .map((village) => ({
        ...village,
        latitude: getLatitude(village),
        longitude: getLongitude(village),
        risk: getRisk(village),
      }))
      .filter(
        (village) =>
          village.latitude !== null &&
          village.longitude !== null
      );
  }, [villages]);

  const criticalCount = mappedVillages.filter(
    (village) => village.risk >= 85
  ).length;

  const highCount = mappedVillages.filter(
    (village) =>
      village.risk >= 70 &&
      village.risk < 85
  ).length;

  const center = selectedVillage
    ? [
        selectedVillage.latitude,
        selectedVillage.longitude,
      ]
    : DEFAULT_CENTER;

  return (
    <div className="gov-redzone-page">

      {/* HEADER */}
      <header className="gov-page-header">

        <div>
          <div className="gov-eyebrow">
            NATIONAL DISASTER RISK MONITORING
          </div>

          <h1>
            Multi-Hazard Red-Zone Map
          </h1>

          <p>
            Spatial identification of vulnerable habitations
            based on available hazard and safety indicators.
          </p>
        </div>

        <div className="gov-live-status">
          <span></span>
          LIVE DATA
        </div>

      </header>


      {/* SUMMARY */}
      <section className="gov-stat-grid">

        <div className="gov-stat-card">
          <span>MONITORED LOCATIONS</span>
          <strong>{villages.length}</strong>
          <small>Backend records</small>
        </div>

        <div className="gov-stat-card critical">
          <span>CRITICAL</span>
          <strong>{criticalCount}</strong>
          <small>Risk score ≥ 85</small>
        </div>

        <div className="gov-stat-card high">
          <span>HIGH RISK</span>
          <strong>{highCount}</strong>
          <small>Risk score 70–84</small>
        </div>

        <div className="gov-stat-card">
          <span>MAPPED LOCATIONS</span>
          <strong>{mappedVillages.length}</strong>
          <small>With coordinates</small>
        </div>

      </section>


      {/* MAP */}
      <section className="gov-map-panel">

        <div className="gov-map-toolbar">

          <div>
            <span className="gov-section-label">
              GIS SPATIAL VIEW
            </span>

            <h2>
              Dibrugarh District Risk Assessment
            </h2>

            <p>
              Click a mapped habitation to inspect its
              available risk information.
            </p>
          </div>

          <div className="gov-map-switch">

            <button
              className={
                satellite
                  ? "active"
                  : ""
              }
              onClick={() =>
                setSatellite(true)
              }
            >
              Satellite
            </button>

            <button
              className={
                !satellite
                  ? "active"
                  : ""
              }
              onClick={() =>
                setSatellite(false)
              }
            >
              Street
            </button>

          </div>

        </div>


        {error && (
          <div className="gov-map-error">
            {error}
          </div>
        )}


        <div className="gov-real-map">

          <MapContainer
            center={DEFAULT_CENTER}
            zoom={10}
            scrollWheelZoom={true}
            style={{
              width: "100%",
              height: "100%",
            }}
          >

            <MapUpdater center={center} />

            {satellite ? (
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles © Esri"
              />
            ) : (
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="© OpenStreetMap contributors"
              />
            )}


            {mappedVillages.map(
              (village, index) => {

                const color =
                  getRiskColor(
                    village.risk
                  );

                return (
                  <div
                    key={
                      village.village_name ||
                      index
                    }
                  >

                    <Circle
                      center={[
                        village.latitude,
                        village.longitude,
                      ]}
                      radius={
                        500 +
                        Math.max(
                          village.risk,
                          20
                        ) *
                          8
                      }
                      pathOptions={{
                        color,
                        fillColor: color,
                        fillOpacity: 0.16,
                        weight: 2,
                      }}
                    />

                    <CircleMarker
                      center={[
                        village.latitude,
                        village.longitude,
                      ]}
                      radius={
                        selectedVillage?.village_name ===
                        village.village_name
                          ? 10
                          : 7
                      }
                      pathOptions={{
                        color: "#ffffff",
                        weight: 2,
                        fillColor: color,
                        fillOpacity: 1,
                      }}
                      eventHandlers={{
                        click: () =>
                          setSelectedVillage(
                            village
                          ),
                      }}
                    >

                      <Popup>

                        <div className="gov-popup">

                          <strong>
                            {village.village_name ||
                              "Unnamed Habitation"}
                          </strong>

                          <span>
                            Risk:
                            {" "}
                            {Math.round(
                              village.risk
                            )}
                            /100
                          </span>

                          <span>
                            Status:
                            {" "}
                            {getRiskLevel(
                              village.risk
                            )}
                          </span>

                          {village.population && (
                            <span>
                              Population:
                              {" "}
                              {Number(
                                village.population
                              ).toLocaleString()}
                            </span>
                          )}

                        </div>

                      </Popup>

                    </CircleMarker>

                  </div>
                );
              }
            )}

          </MapContainer>


          {/* LEGEND */}
          <div className="gov-map-legend">

            <strong>
              RISK LEVEL
            </strong>

            <div>
              <i className="legend-critical"></i>
              Critical
            </div>

            <div>
              <i className="legend-high"></i>
              High
            </div>

            <div>
              <i className="legend-moderate"></i>
              Moderate
            </div>

            <div>
              <i className="legend-low"></i>
              Low
            </div>

          </div>


          {loading && (
            <div className="gov-map-loading">
              Loading spatial data...
            </div>
          )}

        </div>

      </section>


      {/* LOCATION LIST */}
      <section className="gov-location-section">

        <div className="gov-section-heading">

          <div>
            <span className="gov-section-label">
              IDENTIFIED LOCATIONS
            </span>

            <h2>
              Vulnerability Overview
            </h2>
          </div>

          <span className="gov-record-count">
            {mappedVillages.length} mapped
          </span>

        </div>


        <div className="gov-location-grid">

          {mappedVillages
            .slice(0, 8)
            .map((village, index) => {

              const risk =
                Math.round(
                  village.risk
                );

              return (
                <button
                  className={`gov-location-card ${
                    selectedVillage?.village_name ===
                    village.village_name
                      ? "selected"
                      : ""
                  }`}
                  key={
                    village.village_name ||
                    index
                  }
                  onClick={() =>
                    setSelectedVillage(
                      village
                    )
                  }
                >

                  <div className="gov-location-top">

                    <div>
                      <strong>
                        {village.village_name ||
                          "Unnamed Habitation"}
                      </strong>

                      <small>
                        Dibrugarh District
                      </small>
                    </div>

                    <span
                      style={{
                        color:
                          getRiskColor(
                            risk
                          ),
                      }}
                    >
                      {risk}
                    </span>

                  </div>

                  <div className="gov-location-bottom">

                    <span>
                      Risk Score
                    </span>

                    <span>
                      {getRiskLevel(
                        risk
                      )}
                    </span>

                  </div>

                </button>
              );
            })}

        </div>

      </section>

    </div>
  );
}

export default RedZoneMap;