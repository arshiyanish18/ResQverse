function VulnerableHabitations() {
  const habitations = [
    {
      name: "Village A",
      district: "Upper Valley",
      population: 1250,
      risk: 92,
      vulnerability: 87,
      access: "Poor",
      priority: "IMMEDIATE",
    },
    {
      name: "Village B",
      district: "River Basin",
      population: 840,
      risk: 78,
      vulnerability: 71,
      access: "Moderate",
      priority: "SHORT-TERM",
    },
    {
      name: "Village C",
      district: "Mountain Belt",
      population: 620,
      risk: 61,
      vulnerability: 54,
      access: "Good",
      priority: "MEDIUM-TERM",
    },
    {
      name: "Village D",
      district: "Eastern Corridor",
      population: 510,
      risk: 58,
      vulnerability: 49,
      access: "Good",
      priority: "MEDIUM-TERM",
    },
  ];

  return (
    <div className="vulnerable-page">

      {/* HEADER */}
      <div className="vulnerable-header">

        <div>

          <p className="eyebrow">
            VULNERABILITY ASSESSMENT
          </p>

          <h1>
            Vulnerable Habitations
          </h1>

          <p>
            Monitor communities exposed to hazards and
            identify those requiring priority intervention.
          </p>

        </div>

        <button className="outline-button">
          Export Report ↓
        </button>

      </div>


      {/* SUMMARY */}
      <div className="vulnerability-summary">

        <div className="vulnerability-stat">
          <span>MONITORED HABITATIONS</span>
          <strong>24</strong>
          <small>Across the region</small>
        </div>

        <div className="vulnerability-stat danger-stat">
          <span>IMMEDIATE PRIORITY</span>
          <strong>5</strong>
          <small>Require urgent action</small>
        </div>

        <div className="vulnerability-stat warning-stat">
          <span>HIGH VULNERABILITY</span>
          <strong>9</strong>
          <small>Score above 70</small>
        </div>

        <div className="vulnerability-stat safe-stat">
          <span>PEOPLE AT RISK</span>
          <strong>8,420</strong>
          <small>Total exposed population</small>
        </div>

      </div>


      {/* TABLE */}
      <section className="vulnerable-table-section">

        <div className="vulnerable-table-header">

          <div>
            <p className="eyebrow">
              COMMUNITY RISK PROFILE
            </p>

            <h2>
              Habitation Assessment
            </h2>
          </div>

          <select>
            <option>All Priorities</option>
            <option>Immediate</option>
            <option>Short-Term</option>
            <option>Medium-Term</option>
          </select>

        </div>


        <div className="vulnerable-table">

          <div className="vulnerable-table-head">

            <span>HABITATION</span>
            <span>POPULATION</span>
            <span>RISK SCORE</span>
            <span>VULNERABILITY</span>
            <span>ACCESS</span>
            <span>PRIORITY</span>

          </div>


          {habitations.map((village) => (

            <div
              className="vulnerable-row"
              key={village.name}
            >

              <div className="village-info">

                <div className="village-icon">
                  ⌂
                </div>

                <div>

                  <strong>
                    {village.name}
                  </strong>

                  <small>
                    {village.district}
                  </small>

                </div>

              </div>


              <span>
                {village.population.toLocaleString()}
              </span>


              <div className="vulnerability-score">

                <div className="vulnerability-bar">

                  <div
                    style={{
                      width: `${village.risk}%`,
                    }}
                  ></div>

                </div>

                <strong>
                  {village.risk}
                </strong>

              </div>


              <strong>
                {village.vulnerability}/100
              </strong>


              <span className="access-value">
                {village.access}
              </span>


              <span
                className={`vulnerability-priority ${
                  village.priority
                    .toLowerCase()
                    .replace("-", "")
                }`}
              >
                {village.priority}
              </span>

            </div>

          ))}

        </div>

      </section>


      {/* INSIGHT */}
      <div className="vulnerability-insight">

        <div className="insight-icon">
          ⚠
        </div>

        <div>

          <strong>
            Priority assessment
          </strong>

          <p>
            Vulnerability scores combine hazard exposure,
            population characteristics, accessibility and
            infrastructure conditions to determine intervention priority.
          </p>

        </div>

      </div>

    </div>
  );
}

export default VulnerableHabitations;