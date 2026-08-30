function HazardIntelligence() {
  return (
    <div className="hazard-page">

      <div className="topbar">
        <div>
          <p className="eyebrow">AI DISASTER ANALYSIS</p>
          <h1>Hazard Intelligence</h1>
          <p className="subtitle">
            Analyze multi-hazard conditions and identify high-risk areas.
          </p>
        </div>

        <div className="location">
          <span>📍</span>
          <div>
            <strong>North-East India</strong>
            <small>Monitoring Region</small>
          </div>
        </div>
      </div>

      <section className="stats-grid">

        <div className="stat-card danger">
          <div className="stat-top">
            <span>Overall Risk</span>
            <div className="stat-icon">⚠</div>
          </div>
          <h2>HIGH</h2>
          <p>Current regional assessment</p>
        </div>

        <div className="stat-card warning">
          <div className="stat-top">
            <span>Active Hazards</span>
            <div className="stat-icon">◉</div>
          </div>
          <h2>3</h2>
          <p>Hazards currently detected</p>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>High Risk Zones</span>
            <div className="stat-icon">◈</div>
          </div>
          <h2>8</h2>
          <p>Areas requiring monitoring</p>
        </div>

        <div className="stat-card safe">
          <div className="stat-top">
            <span>Safe Zones</span>
            <div className="stat-icon">✓</div>
          </div>
          <h2>12</h2>
          <p>Suitable for habitation</p>
        </div>

      </section>

      <section className="section">

        <div className="section-header">
          <div>
            <p className="eyebrow">MULTI-HAZARD ANALYSIS</p>
            <h2>Current Hazard Conditions</h2>
          </div>
        </div>

        <div className="hazard-grid">

          <div className="hazard-card flood">
            <div className="hazard-symbol">🌊</div>

            <div>
              <h3>Flood Risk</h3>
              <p>Water level & flood probability</p>
            </div>

            <strong>HIGH</strong>
          </div>

          <div className="hazard-card landslide">
            <div className="hazard-symbol">⛰️</div>

            <div>
              <h3>Landslide Risk</h3>
              <p>Slope failure probability</p>
            </div>

            <strong>MEDIUM</strong>
          </div>

          <div className="hazard-card cloudburst">
            <div className="hazard-symbol">🌧️</div>

            <div>
              <h3>Cloudburst Risk</h3>
              <p>Extreme localized rainfall</p>
            </div>

            <strong>HIGH</strong>
          </div>

        </div>

      </section>

      <section className="section">

        <div className="section-header">
          <div>
            <p className="eyebrow">AI ASSESSMENT</p>
            <h2>Risk Interpretation</h2>
          </div>
        </div>

        <div className="relocation-section">

          <div>
            <h2>⚠ High Priority Region</h2>

            <p>
              Multiple hazards have been detected in the monitored region.
              Flood and cloudburst conditions indicate an increased
              possibility of localized disruption.
            </p>

            <p>
              Vulnerable habitations should be prioritized for detailed
              assessment and relocation planning.
            </p>
          </div>

          <button className="primary-button">
            Start Risk Assessment →
          </button>

        </div>

      </section>

    </div>
  );
}

export default HazardIntelligence;