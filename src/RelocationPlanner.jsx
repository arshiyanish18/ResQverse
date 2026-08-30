function RelocationPlanner() {
return (
<div className="relocation-page">
  {/* PAGE HEADER */}
  <div className="relocation-page-header">

    <div>
      <div className="eyebrow">
        RELOCATION DECISION SUPPORT
      </div>

      <h1>Relocation Planner</h1>

      <p>
        Assess vulnerable habitations and identify the safest
        alternative locations for relocation.
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

      <div className="overview-icon">👥</div>

      <div>
        <span>People to Relocate</span>
        <strong>3,060</strong>
      </div>

    </div>


    <div className="overview-divider"></div>


    <div className="overview-item">

      <div className="overview-icon">🏠</div>

      <div>
        <span>Available Capacity</span>
        <strong>3,840</strong>
      </div>

    </div>


    <div className="overview-divider"></div>


    <div className="overview-item">

      <div className="overview-icon">✓</div>

      <div>
        <span>Capacity Surplus</span>
        <strong>780</strong>
      </div>

    </div>


    <div className="overview-divider"></div>


    <div className="overview-item">

      <div className="overview-icon">◉</div>

      <div>
        <span>Priority Villages</span>
        <strong>5</strong>
      </div>

    </div>

  </div>


  {/* MAIN GRID */}
  <div className="relocation-main-grid">


    {/* LEFT - ASSESSMENT */}
    <section className="assessment-panel">

      <div className="panel-heading">

        <div>
          <span className="panel-label">
            STEP 01
          </span>

          <h2>Select habitation</h2>

          <p>
            Choose a vulnerable habitation to begin
            the relocation assessment.
          </p>
        </div>

        <div className="panel-number">
          01
        </div>

      </div>


      <div className="field-group">

        <label>
          VULNERABLE HABITATION
        </label>

        <select>

          <option>
            Village A — Immediate Priority
          </option>

          <option>
            Village B — Short-Term Priority
          </option>

          <option>
            Village C — Medium-Term Priority
          </option>

          <option>
            Village D — Medium-Term Priority
          </option>

        </select>

      </div>


      <div className="population-box">

        <div className="population-icon">
          👥
        </div>

        <div>
          <span>Population requiring relocation</span>
          <strong>1,250 people</strong>
        </div>

        <div className="population-priority">
          IMMEDIATE
        </div>

      </div>


      <div className="assessment-factors">

        <div>
          <span>Risk Score</span>
          <strong className="risk-value">
            92/100
          </strong>
        </div>

        <div>
          <span>Vulnerability</span>
          <strong>
            87/100
          </strong>
        </div>

        <div>
          <span>Accessibility</span>
          <strong className="poor-value">
            Poor
          </strong>
        </div>

      </div>


      <button className="assessment-button">
        Find Suitable Relocation Sites
        <span>→</span>
      </button>

    </section>


    {/* RIGHT - AI RECOMMENDATION */}
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
        3 suitable sites identified
      </h2>

      <p>
        Based on the selected habitation, RESQ has
        identified three locations that can safely
        accommodate the affected population.
      </p>


      <div className="recommendation-score">

        <div>
          <span>Best Match</span>
          <strong>94%</strong>
        </div>

        <div className="recommendation-bar">
          <div></div>
        </div>

      </div>


      <div className="ai-factors">

        <span>✓ Low hazard exposure</span>
        <span>✓ Sufficient capacity</span>
        <span>✓ Accessible infrastructure</span>

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

        <h2>Recommended Safe Sites</h2>

        <p>
          Locations ranked according to safety,
          capacity and accessibility.
        </p>

      </div>

      <button className="map-button">
        View on Map →
      </button>

    </div>


    <div className="safe-site-list">

      <SafeSite
        rank="01"
        name="Community Shelter — Site A"
        location="East District"
        capacity="1,500"
        distance="4.2 km"
        safety="94"
        infrastructure="Excellent"
        best
      />

      <SafeSite
        rank="02"
        name="Government School — Site B"
        location="North District"
        capacity="900"
        distance="6.8 km"
        safety="88"
        infrastructure="Good"
      />

      <SafeSite
        rank="03"
        name="Relief Centre — Site C"
        location="West District"
        capacity="1,200"
        distance="8.4 km"
        safety="82"
        infrastructure="Good"
      />

    </div>

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
        infrastructure availability and evacuation feasibility.
      </p>
    </div>

  </div>

</div>
);
}
/* SAFE SITE COMPONENT */
function SafeSite(props) {
return (
<div
className={`safe-site-card ${props.best ? "best-site" : ""}`}
>
  <div className="site-rank">
    {props.rank}
  </div>


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


  <div className="site-metric">

    <span>CAPACITY</span>

    <strong>
      {props.capacity}
    </strong>

    <small>people</small>

  </div>


  <div className="site-metric">

    <span>DISTANCE</span>

    <strong>
      {props.distance}
    </strong>

    <small>from village</small>

  </div>


  <div className="site-safety">

    <span>SAFETY SCORE</span>

    <strong>
      {props.safety}%
    </strong>

    <div className="site-safety-bar">

      <div
        style={{
          width: props.safety + "%",
        }}
      ></div>

    </div>

  </div>


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


  <button className="site-arrow">
    →
  </button>

</div>
);
}
export default RelocationPlanner;