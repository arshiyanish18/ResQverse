import { useEffect, useState } from "react";

const API_BASE_URL = "https://resqverse-sgqz.onrender.com";

function RelocationPlanner() {
  const [recommendations, setRecommendations] = useState([]);
  const [villages, setVillages] = useState([]);
  const [selectedVillage, setSelectedVillage] = useState("");
  const [selectedData, setSelectedData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingVillages, setLoadingVillages] = useState(true);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // LOAD VILLAGES
  // --------------------------------------------------
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/relocation/villages`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load villages");
        }

        return res.json();
      })
      .then((data) => {
        setVillages(data.villages || []);
        setLoadingVillages(false);
      })
      .catch((err) => {
        console.error("Failed to load villages:", err);

        setError("Unable to load habitation data.");
        setLoadingVillages(false);
      });
  }, []);

  // --------------------------------------------------
  // LOAD DEFAULT RECOMMENDATIONS
  // --------------------------------------------------
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/relocation/recommend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        limit: 3,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load recommendations");
        }

        return res.json();
      })
      .then((data) => {
        setRecommendations(data.recommendations || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load recommendations:", err);

        setError("Unable to load relocation recommendations.");
        setLoading(false);
      });
  }, []);

  // --------------------------------------------------
  // HANDLE HABITATION SELECTION
  // --------------------------------------------------
  const handleVillageChange = (e) => {
    const villageName = e.target.value;

    setSelectedVillage(villageName);

    const village = villages.find(
      (item) => item.village_name === villageName
    );

    setSelectedData(village || null);

    // IMPORTANT:
    // Clear old recommendations when the selected
    // habitation changes so stale results aren't shown.
    setRecommendations([]);

    setError("");
  };

  // --------------------------------------------------
  // FIND RELOCATION SITES
  // --------------------------------------------------
  const handleFindSites = async () => {
    if (!selectedVillage) {
      setError("Please select a habitation first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/relocation/recommend`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            limit: 3,
            village: selectedVillage,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.message ||
            "Backend failed to generate recommendations."
        );
      }

      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error("Recommendation error:", err);

      setRecommendations([]);

      setError(
        err.message ||
          "Unable to load relocation recommendations."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // DISPLAY VALUES
  // --------------------------------------------------

  const population = selectedData?.population
    ? Number(selectedData.population).toLocaleString()
    : "--";

  const riskScore =
    selectedData?.safety_score !== undefined &&
    selectedData?.safety_score !== null
      ? Math.round(
          (1 - Number(selectedData.safety_score)) * 100
        )
      : "--";

  const safetyScore =
    selectedData?.safety_score !== undefined &&
    selectedData?.safety_score !== null
      ? Number(selectedData.safety_score) * 100
      : null;

  const accessibilityScore =
    selectedData?.accessibility_score !== undefined &&
    selectedData?.accessibility_score !== null
      ? Number(selectedData.accessibility_score) * 100
      : null;

  let accessibilityLabel = "--";

  if (accessibilityScore !== null) {
    if (accessibilityScore >= 75) {
      accessibilityLabel = "Good";
    } else if (accessibilityScore >= 50) {
      accessibilityLabel = "Moderate";
    } else {
      accessibilityLabel = "Poor";
    }
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="relocation-page">

      {/* PAGE HEADER */}
      <div className="relocation-page-header">

        <div>

          <div className="eyebrow">
            RELOCATION DECISION SUPPORT
          </div>

          <h1>
            Relocation Planner
          </h1>

          <p>
            Assess vulnerable habitations and identify
            the safest alternative locations for relocation.
          </p>

        </div>

        <div className="planner-status">
          <span className="status-dot"></span>
          System Ready
        </div>

      </div>


      {/* OVERVIEW STRIP */}
      <div className="relocation-overview">

        <div className="overview-item">

          <div className="overview-icon">
            👥
          </div>

          <div>
            <span>
              People to Relocate
            </span>

            <strong>
              3,060
            </strong>
          </div>

        </div>


        <div className="overview-divider"></div>


        <div className="overview-item">

          <div className="overview-icon">
            🏠
          </div>

          <div>
            <span>
              Available Capacity
            </span>

            <strong>
              3,840
            </strong>
          </div>

        </div>


        <div className="overview-divider"></div>


        <div className="overview-item">

          <div className="overview-icon">
            ✓
          </div>

          <div>
            <span>
              Capacity Surplus
            </span>

            <strong>
              780
            </strong>
          </div>

        </div>


        <div className="overview-divider"></div>


        <div className="overview-item">

          <div className="overview-icon">
            ◉
          </div>

          <div>
            <span>
              Priority Villages
            </span>

            <strong>
              5
            </strong>
          </div>

        </div>

      </div>


      {/* MAIN GRID */}
      <div className="relocation-main-grid">

        {/* ASSESSMENT PANEL */}
        <section className="assessment-panel">

          <div className="panel-heading">

            <div>

              <span className="panel-label">
                STEP 01
              </span>

              <h2>
                Select habitation
              </h2>

              <p>
                Choose a vulnerable habitation to begin
                the relocation assessment.
              </p>

            </div>

            <div className="panel-number">
              01
            </div>

          </div>


          {/* VILLAGE SELECT */}
          <div className="field-group">

            <label>
              VULNERABLE HABITATION
            </label>

            <select
              value={selectedVillage}
              onChange={handleVillageChange}
              disabled={loadingVillages}
            >

              <option value="">
                {loadingVillages
                  ? "Loading habitations..."
                  : "Select a habitation"}
              </option>

              {villages.map((village) => (

                <option
                  key={village.location_code}
                  value={village.village_name}
                >
                  {village.village_name}
                </option>

              ))}

            </select>

          </div>


          {/* POPULATION */}
          <div className="population-box">

            <div className="population-icon">
              👥
            </div>

            <div>

              <span>
                Population requiring relocation
              </span>

              <strong>
                {selectedData
                  ? `${population} people`
                  : "--"}
              </strong>

            </div>

            <div className="population-priority">

              {selectedData
                ? "ASSESSED"
                : "--"}

            </div>

          </div>


          {/* ASSESSMENT FACTORS */}
          <div className="assessment-factors">

            <div>

              <span>
                Hazard Risk
              </span>

              <strong className="risk-value">

                {selectedData
                  ? `${riskScore}/100`
                  : "--"}

              </strong>

            </div>


            <div>

              <span>
                Safety Score
              </span>

              <strong>

                {safetyScore !== null
                  ? `${safetyScore.toFixed(1)}/100`
                  : "--"}

              </strong>

            </div>


            <div>

              <span>
                Accessibility
              </span>

              <strong
                className={
                  accessibilityLabel === "Poor"
                    ? "poor-value"
                    : ""
                }
              >
                {accessibilityLabel}
              </strong>

            </div>

          </div>


          {/* FIND BUTTON */}
          <button
            className="assessment-button"
            onClick={handleFindSites}
            disabled={!selectedVillage || loading}
          >

            {loading
              ? "Finding suitable sites..."
              : "Find Suitable Relocation Sites"}

            <span>
              →
            </span>

          </button>

        </section>


        {/* AI RECOMMENDATION */}
        <section className="ai-recommendation">

          <div className="ai-top">

            <div className="ai-icon">
              ✦
            </div>

            <span>
              AI RECOMMENDATION
            </span>

          </div>


          <h2>

            {recommendations.length}
            {" "}
            suitable sites identified

          </h2>


          <p>

            {selectedVillage
              ? `RESQ assessed relocation options for ${selectedVillage} and ranked suitable locations using the available safety, capacity and accessibility scores.`
              : "Select a habitation to begin the relocation assessment and identify suitable alternative locations."}

          </p>


          {/* BEST MATCH */}
          <div className="recommendation-score">

            <div>

              <span>
                Best Match
              </span>

              <strong>

                {recommendations.length > 0
                  ? `${Number(
                      recommendations[0].score_100
                    ).toFixed(2)}%`
                  : "--"}

              </strong>

            </div>


            <div className="recommendation-bar">

              <div
                style={{
                  width:
                    recommendations.length > 0
                      ? `${Math.min(
                          Number(
                            recommendations[0].score_100
                          ),
                          100
                        )}%`
                      : "0%",
                }}
              ></div>

            </div>

          </div>


          {/* AI FACTORS */}
          <div className="ai-factors">

            <span>
              ✓ Low hazard exposure
            </span>

            <span>
              ✓ Sufficient capacity
            </span>

            <span>
              ✓ Accessible infrastructure
            </span>

          </div>

        </section>

      </div>


      {/* SAFE SITES */}
      <section className="sites-section">

        <div className="sites-heading">

          <div>

            <span className="panel-label">
              STEP 02
            </span>

            <h2>
              Recommended Safe Sites
            </h2>

            <p>
              Locations ranked according to safety,
              capacity and accessibility.
            </p>

          </div>

        </div>


        {/* ERROR */}
        {error ? (

          <p>
            {error}
          </p>

        ) : loading ? (

          <p>
            Loading recommendations...
          </p>

        ) : recommendations.length === 0 ? (

          <p>
            No suitable relocation sites found.
          </p>

        ) : (

          <div className="safe-site-list">

            {recommendations.map((site, index) => (

              <SafeSite

                key={site.location_code}

                rank={String(index + 1).padStart(2, "0")}

                name={site.village_name}

                location={`Dibrugarh • ${site.location_code}`}

                capacity={`${(
                  Number(site.capacity_score) * 100
                ).toFixed(2)}%`}

                distance={`${site.distance_km} km`}

                relocationScore={Number(
                  site.score_100
                ).toFixed(2)}

                infrastructure="Assessed"

                best={index === 0}

              />

            ))}

          </div>

        )}

      </section>


      {/* FOOTER INSIGHT */}
      <div className="planner-insight">

        <div className="insight-icon">
          ✦
        </div>

        <div>

          <strong>
            RESQ Decision Support
          </strong>

          <p>
            Site recommendations consider hazard exposure,
            population capacity, road accessibility,
            infrastructure availability and evacuation
            feasibility.
          </p>

        </div>

      </div>

    </div>
  );
}


/* ==================================================
   SAFE SITE COMPONENT
   ================================================== */

function SafeSite(props) {

  return (

    <div
      className={`safe-site-card ${
        props.best
          ? "best-site"
          : ""
      }`}
    >

      {/* RANK */}
      <div className="site-rank">
        {props.rank}
      </div>


      {/* SITE NAME */}
      <div className="site-main">

        <div className="site-title">

          <h3>
            {props.name}
          </h3>

          {props.best && (

            <span className="best-badge">
              BEST MATCH
            </span>

          )}

        </div>

        <p>
          📍 {props.location}
        </p>

      </div>


      {/* CAPACITY */}
      <div className="site-metric">

        <span>
          CAPACITY
        </span>

        <strong>
          {props.capacity}
        </strong>

        <small>
          normalized capacity
        </small>

      </div>


      {/* DISTANCE */}
      <div className="site-metric">

        <span>
          DISTANCE
        </span>

        <strong>
          {props.distance}
        </strong>

        <small>
          from reference hub
        </small>

      </div>


      {/* RELOCATION SCORE */}
      <div className="site-safety">

        <span>
          RELOCATION SCORE
        </span>

        <strong>
          {props.relocationScore}%
        </strong>

        <div className="site-safety-bar">

          <div
            style={{
              width: `${Math.min(
                Number(
                  props.relocationScore
                ),
                100
              )}%`,
            }}
          ></div>

        </div>

      </div>


      {/* INFRASTRUCTURE */}
      <div className="site-infrastructure">

        <span className="check-icon">
          ✓
        </span>

        <div>

          <strong>
            {props.infrastructure}
          </strong>

          <small>
            Infrastructure
          </small>

        </div>

      </div>


      {/* ARROW */}
      <button
        type="button"
        className="site-arrow"
      >
        →
      </button>

    </div>

  );
}


export default RelocationPlanner;