import { useState } from "react";

function RedZoneMap() {
  const [selectedZone, setSelectedZone] = useState(null);

  const zones = [
    {
      name: "Zone A",
      area: "Upper Valley",
      risk: "CRITICAL",
      score: 94,
      hazards: "Flood + Landslide",
      population: 1840,
    },
    {
      name: "Zone B",
      area: "River Basin",
      risk: "HIGH",
      score: 86,
      hazards: "Flood + Cloudburst",
      population: 1260,
    },
    {
      name: "Zone C",
      area: "Mountain Belt",
      risk: "HIGH",
      score: 81,
      hazards: "Landslide",
      population: 920,
    },
    {
      name: "Zone D",
      area: "Eastern Corridor",
      risk: "MODERATE",
      score: 67,
      hazards: "Flood",
      population: 640,
    },
  ];

  return (
    <div className="red-zone-page">

      {/* PAGE HEADER */}
      <header className="red-zone-header">

        <div>
          <div className="red-title-row">
            <div className="red-title-icon">◈</div>

            <div>
              <p className="eyebrow">
                HAZARD EXPOSURE ANALYSIS
              </p>

              <h1>Red-Zone Map</h1>
            </div>
          </div>

          <p className="red-zone-description">
            Identify high-risk geographical areas based on
            combined multi-hazard exposure and population vulnerability.
          </p>
        </div>

        <div className="map-status">
          <span className="status-dot"></span>
          Live Risk Assessment
        </div>

      </header>


      {/* SUMMARY CARDS */}
      <section className="red-summary">

        <div className="red-summary-card">
          <div className="red-summary-icon critical-icon">
            ⚠
          </div>

          <div>
            <span>CRITICAL ZONES</span>
            <strong>1</strong>
            <p>Immediate attention</p>
          </div>
        </div>


        <div className="red-summary-card">
          <div className="red-summary-icon high-icon">
            ◉
          </div>

          <div>
            <span>HIGH-RISK ZONES</span>
            <strong>2</strong>
            <p>Requires monitoring</p>
          </div>
        </div>


        <div className="red-summary-card">
          <div className="red-summary-icon population-icon">
            ⌂
          </div>

          <div>
            <span>EXPOSED POPULATION</span>
            <strong>4,660</strong>
            <p>People at risk</p>
          </div>
        </div>


        <div className="red-summary-card">
          <div className="red-summary-icon score-icon">
            !
          </div>

          <div>
            <span>HIGHEST RISK SCORE</span>
            <strong>94</strong>
            <p>Zone A</p>
          </div>
        </div>

      </section>


      {/* MAP */}
      <section className="risk-map-panel">

        <div className="map-toolbar">

          <div className="map-heading">

            <div className="map-heading-icon">
              ◉
            </div>

            <div>
              <strong>North-East India</strong>
              <span>Multi-Hazard Exposure Map</span>
            </div>

          </div>


          <div className="map-controls">

            <button aria-label="Zoom out">−</button>
            <button aria-label="Zoom in">+</button>
            <button aria-label="Locate">⌖</button>

          </div>

        </div>


        <div className="fake-map">

          <div className="map-grid"></div>

          {/* MAP SHAPE */}
          <div className="map-terrain terrain-one"></div>
          <div className="map-terrain terrain-two"></div>
          <div className="map-terrain terrain-three"></div>


          {/* ZONE A */}
          <button
            className="map-zone zone-a"
            onClick={() => setSelectedZone(zones[0])}
          >
            <span className="map-zone-pulse critical-pulse"></span>
            <strong>94</strong>
            <small>ZONE A</small>
          </button>


          {/* ZONE B */}
          <button
            className="map-zone zone-b"
            onClick={() => setSelectedZone(zones[1])}
          >
            <span className="map-zone-pulse high-pulse"></span>
            <strong>86</strong>
            <small>ZONE B</small>
          </button>


          {/* ZONE C */}
          <button
            className="map-zone zone-c"
            onClick={() => setSelectedZone(zones[2])}
          >
            <span className="map-zone-pulse high-pulse"></span>
            <strong>81</strong>
            <small>ZONE C</small>
          </button>


          {/* ZONE D */}
          <button
            className="map-zone zone-d"
            onClick={() => setSelectedZone(zones[3])}
          >
            <span className="map-zone-pulse moderate-pulse"></span>
            <strong>67</strong>
            <small>ZONE D</small>
          </button>


          {/* MAP LEGEND */}
          <div className="map-legend">

            <strong>RISK LEVEL</strong>

            <div>
              <span className="legend-dot critical-dot"></span>
              Critical
            </div>

            <div>
              <span className="legend-dot high-dot"></span>
              High
            </div>

            <div>
              <span className="legend-dot moderate-dot"></span>
              Moderate
            </div>

          </div>


          <div className="map-note">
            <span>●</span>
            Click a zone to view details
          </div>

        </div>

      </section>


      {/* ZONE LIST */}
      <section className="zone-list-section">

        <div className="section-header">

          <div>
            <p className="eyebrow">
              IDENTIFIED RED ZONES
            </p>

            <h2>High-Risk Areas</h2>
          </div>

          <div className="zone-count">
            4 Zones Identified
          </div>

        </div>


        <div className="zone-list">

          {zones.map((zone) => (

            <article
              className={`zone-card ${
                selectedZone?.name === zone.name
                  ? "selected-zone"
                  : ""
              }`}
              key={zone.name}
              onClick={() => setSelectedZone(zone)}
            >

              <div className="zone-card-top">

                <div className="zone-icon">
                  ◈
                </div>

                <div className="zone-name">

                  <h3>{zone.name}</h3>

                  <p>📍 {zone.area}</p>

                </div>

                <div
                  className={`zone-risk ${zone.risk
                    .toLowerCase()
                    .replace("-", "")}`}
                >
                  {zone.risk}
                </div>

              </div>


              <div className="zone-card-details">

                <div className="zone-detail">

                  <span>RISK SCORE</span>

                  <strong className="risk-number">
                    {zone.score}
                  </strong>

                </div>


                <div className="zone-detail">

                  <span>EXPOSED POPULATION</span>

                  <strong>
                    {zone.population.toLocaleString()}
                  </strong>

                </div>


                <div className="zone-detail">

                  <span>HAZARDS</span>

                  <strong>
                    {zone.hazards}
                  </strong>

                </div>

              </div>


              <div className="zone-card-bottom">

                <div className="zone-progress">

                  <div
                    style={{
                      width: `${zone.score}%`,
                    }}
                  ></div>

                </div>

                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedZone(zone);
                  }}
                >
                  View Details →
                </button>

              </div>

            </article>

          ))}

        </div>

      </section>


      {/* DETAILS PANEL */}
      {selectedZone && (

        <div
          className="zone-overlay"
          onClick={() => setSelectedZone(null)}
        >

          <div
            className="zone-details-panel"
            onClick={(event) => event.stopPropagation()}
          >

            <button
              className="zone-close"
              onClick={() => setSelectedZone(null)}
            >
              ×
            </button>


            <p className="eyebrow">
              RISK ZONE DETAILS
            </p>

            <h2>{selectedZone.name}</h2>

            <p className="zone-detail-location">
              📍 {selectedZone.area}
            </p>


            <div className="zone-large-score">

              <span>RISK SCORE</span>

              <strong>{selectedZone.score}</strong>

              <small>{selectedZone.risk} RISK</small>

            </div>


            <div className="zone-modal-grid">

              <div>
                <span>EXPOSED POPULATION</span>
                <strong>
                  {selectedZone.population.toLocaleString()}
                </strong>
              </div>

              <div>
                <span>PRIMARY HAZARDS</span>
                <strong>{selectedZone.hazards}</strong>
              </div>

            </div>


            <button
              className="zone-modal-button"
              onClick={() => setSelectedZone(null)}
            >
              Close Assessment
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default RedZoneMap;