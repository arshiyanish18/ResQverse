import { useState } from "react";

function SafeSites() {
  const [selectedSite, setSelectedSite] = useState(null);

  const sites = [
    {
      name: "Community Relief Centre",
      location: "Upper Valley",
      capacity: 1200,
      occupied: 420,
      distance: "4.2 km",
      safety: 94,
      facilities: ["Medical", "Food", "Water"],
      status: "AVAILABLE",
    },
    {
      name: "District Emergency Shelter",
      location: "River Basin",
      capacity: 2000,
      occupied: 980,
      distance: "7.8 km",
      safety: 91,
      facilities: ["Medical", "Shelter", "Power"],
      status: "AVAILABLE",
    },
    {
      name: "Government Higher Secondary School",
      location: "Eastern Corridor",
      capacity: 850,
      occupied: 610,
      distance: "5.6 km",
      safety: 86,
      facilities: ["Shelter", "Water", "Food"],
      status: "LIMITED",
    },
    {
      name: "Community Hall",
      location: "Mountain Belt",
      capacity: 600,
      occupied: 180,
      distance: "9.4 km",
      safety: 82,
      facilities: ["Shelter", "Water", "Power"],
      status: "AVAILABLE",
    },
    {
      name: "Relief Camp North",
      location: "Northern Valley",
      capacity: 950,
      occupied: 310,
      distance: "11.2 km",
      safety: 88,
      facilities: ["Medical", "Food", "Water"],
      status: "AVAILABLE",
    },
    {
      name: "Panchayat Emergency Centre",
      location: "Central District",
      capacity: 780,
      occupied: 520,
      distance: "6.9 km",
      safety: 84,
      facilities: ["Shelter", "Food"],
      status: "LIMITED",
    },
  ];

  const getAvailable = (site) => site.capacity - site.occupied;

  const getPercentage = (site) =>
    Math.round((site.occupied / site.capacity) * 100);

  return (
    <div className="safe-sites-page">

      {/* PAGE HEADER */}
      <header className="safe-page-header">

        <div>
          <div className="safe-title-row">
            <span className="safe-title-icon">⌖</span>

            <div>
              <p className="eyebrow">RELOCATION DECISION SUPPORT</p>
              <h1>Safe Alternative Sites</h1>
            </div>
          </div>

          <p className="safe-description">
            Find suitable relocation locations based on safety,
            capacity, accessibility and available infrastructure.
          </p>
        </div>

        <div className="safe-system-badge">
          <span></span>
          SYSTEM OPERATIONAL
        </div>

      </header>


      {/* TOP STATISTICS */}
      <section className="safe-metrics">

        <div className="safe-metric">
          <span className="metric-icon">⌖</span>

          <div>
            <small>SAFE SITES</small>
            <strong>12</strong>
            <p>Identified</p>
          </div>
        </div>


        <div className="safe-metric">
          <span className="metric-icon blue">◫</span>

          <div>
            <small>TOTAL CAPACITY</small>
            <strong>8,420</strong>
            <p>People</p>
          </div>
        </div>


        <div className="safe-metric">
          <span className="metric-icon green">✓</span>

          <div>
            <small>AVAILABLE SPACE</small>
            <strong>5,930</strong>
            <p>People</p>
          </div>
        </div>


        <div className="safe-metric">
          <span className="metric-icon gold">★</span>

          <div>
            <small>AVERAGE SAFETY</small>
            <strong>88%</strong>
            <p>Excellent</p>
          </div>
        </div>

      </section>


      {/* RECOMMENDED SITE */}
      <section className="best-site">

        <div className="best-site-label">
          ★ RECOMMENDED
        </div>

        <div className="best-site-main">

          <div className="best-site-building">
            ⌂
          </div>

          <div className="best-site-info">

            <span className="best-site-eyebrow">
              BEST MATCH FOR RELOCATION
            </span>

            <h2>
              Community Relief Centre
            </h2>

            <p>
              📍 Upper Valley
            </p>

            <div className="best-site-tags">
              <span>Medical</span>
              <span>Food</span>
              <span>Water</span>
            </div>

          </div>


          <div className="best-site-score">

            <small>SAFETY SCORE</small>

            <strong>94</strong>

            <span>Excellent</span>

          </div>


          <div className="best-site-capacity">

            <small>AVAILABLE CAPACITY</small>

            <strong>780</strong>

            <span>people</span>

          </div>


          <button
            className="best-site-button"
            onClick={() => setSelectedSite(sites[0])}
          >
            View Details →
          </button>

        </div>

      </section>


      {/* SITE SECTION */}
      <section className="safe-location-section">

        <div className="safe-location-heading">

          <div>
            <p className="eyebrow">ASSESSED LOCATIONS</p>
            <h2>Available Safe Sites</h2>
          </div>

          <select>
            <option>Recommended</option>
            <option>Highest Safety</option>
            <option>Highest Capacity</option>
            <option>Closest</option>
          </select>

        </div>


        {/* SITE CARDS */}
        <div className="safe-location-grid">

          {sites.map((site) => (

            <article
              className="location-card"
              key={site.name}
            >

              <div className="location-card-header">

                <div className="location-icon">
                  ⌂
                </div>

                <span
                  className={
                    site.status === "AVAILABLE"
                      ? "location-status available"
                      : "location-status limited"
                  }
                >
                  {site.status}
                </span>

              </div>


              <h3>
                {site.name}
              </h3>

              <p className="location-place">
                📍 {site.location}
              </p>


              {/* SCORE */}
              <div className="location-score">

                <div>
                  <small>SAFETY SCORE</small>
                  <strong>{site.safety}</strong>
                </div>

                <div className="score-ring">
                  {site.safety}%
                </div>

              </div>


              {/* CAPACITY */}
              <div className="location-capacity">

                <div className="capacity-top">
                  <span>CAPACITY USED</span>

                  <strong>
                    {site.occupied.toLocaleString()} /{" "}
                    {site.capacity.toLocaleString()}
                  </strong>
                </div>

                <div className="location-progress">
                  <div
                    style={{
                      width: `${getPercentage(site)}%`,
                    }}
                  ></div>
                </div>

                <small>
                  {getAvailable(site).toLocaleString()} people available
                </small>

              </div>


              {/* DETAILS */}
              <div className="location-info">

                <div>
                  <span>DISTANCE</span>
                  <strong>{site.distance}</strong>
                </div>

                <div>
                  <span>FACILITIES</span>
                  <strong>{site.facilities.length} Available</strong>
                </div>

              </div>


              {/* FACILITIES */}
              <div className="location-facilities">

                {site.facilities.map((facility) => (
                  <span key={facility}>
                    ✓ {facility}
                  </span>
                ))}

              </div>


              <button
                className="location-details-button"
                onClick={() => setSelectedSite(site)}
              >
                View Site Details
                <span>→</span>
              </button>

            </article>

          ))}

        </div>

      </section>


      {/* MODAL */}
      {selectedSite && (

        <div
          className="safe-details-overlay"
          onClick={() => setSelectedSite(null)}
        >

          <div
            className="safe-details-modal"
            onClick={(event) => event.stopPropagation()}
          >

            <button
              className="safe-modal-close"
              onClick={() => setSelectedSite(null)}
            >
              ×
            </button>

            <span className="modal-eyebrow">
              SAFE SITE DETAILS
            </span>

            <h2>
              {selectedSite.name}
            </h2>

            <p className="modal-place">
              📍 {selectedSite.location}
            </p>


            <div className="modal-grid">

              <div>
                <small>SAFETY</small>
                <strong>{selectedSite.safety}</strong>
              </div>

              <div>
                <small>TOTAL CAPACITY</small>
                <strong>
                  {selectedSite.capacity.toLocaleString()}
                </strong>
              </div>

              <div>
                <small>AVAILABLE</small>
                <strong>
                  {getAvailable(selectedSite).toLocaleString()}
                </strong>
              </div>

            </div>


            <div className="modal-facility-section">

              <small>AVAILABLE FACILITIES</small>

              <div>
                {selectedSite.facilities.map((facility) => (
                  <span key={facility}>
                    ✓ {facility}
                  </span>
                ))}
              </div>

            </div>


            <button
              className="modal-select-button"
              onClick={() => setSelectedSite(null)}
            >
              Select This Site
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default SafeSites;