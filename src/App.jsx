import { useState } from "react";
import "./App.css";
import HazardIntelligence from "./HazardIntelligence";
import RelocationPlanner from "./RelocationPlanner";
import SafeSites from "./SafeSites";
import RedZoneMap from "./RedZoneMap";
import VulnerableHabitations from "./VulnerableHabitations";

function App() {
  const [activePage, setActivePage] = useState("dashboard");

  const habitations = [
    {
      name: "Village A",
      population: 1250,
      risk: 92,
      vulnerability: 87,
      accessibility: "Poor",
      priority: "IMMEDIATE",
      color: "red",
    },
    {
      name: "Village B",
      population: 840,
      risk: 78,
      vulnerability: 71,
      accessibility: "Moderate",
      priority: "SHORT-TERM",
      color: "orange",
    },
    {
      name: "Village C",
      population: 620,
      risk: 61,
      vulnerability: 54,
      accessibility: "Good",
      priority: "MEDIUM-TERM",
      color: "yellow",
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) {
      return "Good morning";
    } else if (hour < 17) {
      return "Good afternoon";
    } else {
      return "Good evening";
    }
  };

  return (
    <div className="app">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="logo">
          <div className="logo-icon">R</div>

          <div>
            <h2>RESQ</h2>
            <span>Disaster Intelligence</span>
          </div>
        </div>


        <nav>

          {/* DASHBOARD */}
          <button
            className={`nav-item ${
              activePage === "dashboard" ? "active" : ""
            }`}
            onClick={() => setActivePage("dashboard")}
          >
            <span>⌂</span>
            Dashboard
          </button>


          {/* HAZARD INTELLIGENCE */}
          <button
            className={`nav-item ${
              activePage === "hazard" ? "active" : ""
            }`}
            onClick={() => setActivePage("hazard")}
          >
            <span>◉</span>
            Hazard Intelligence
          </button>


          {/* RED ZONE */}
          <button
            className={`nav-item ${
              activePage === "redzone" ? "active" : ""
            }`}
            onClick={() => setActivePage("redzone")}
          >
            <span>◈</span>
            Red-Zone Map
          </button>


          {/* VULNERABLE HABITATIONS */}
          <button
            className={`nav-item ${
              activePage === "vulnerable" ? "active" : ""
            }`}
            onClick={() => setActivePage("vulnerable")}
          >
            <span>⚠</span>
            Vulnerable Habitations
          </button>


          {/* RELOCATION PLANNER */}
          <button
            className={`nav-item ${
              activePage === "relocation" ? "active" : ""
            }`}
            onClick={() => setActivePage("relocation")}
          >
            <span>⇄</span>
            Relocation Planner
          </button>


          {/* SAFE SITES */}
          <button
            className={`nav-item ${
              activePage === "safe" ? "active" : ""
            }`}
            onClick={() => setActivePage("safe")}
          >
            <span>⌖</span>
            Safe Sites
          </button>

        </nav>


        <div className="sidebar-bottom">

          <div className="system-status">
            <span className="status-dot"></span>
            System Operational
          </div>

          <p>
            AI Multi-Hazard Decision Support
          </p>

        </div>

      </aside>


      {/* MAIN CONTENT */}
      <main className="main-content">

       {activePage === "hazard" ? (

  <HazardIntelligence />

) : activePage === "redzone" ? (

  <RedZoneMap />

) : activePage === "vulnerable" ? (

  <VulnerableHabitations />

) : activePage === "relocation" ? (

  <RelocationPlanner />

) : activePage === "safe" ? (

  <SafeSites />

) : (
          <>

            {/* HEADER */}
            <header className="topbar">

              <div>

                <p className="eyebrow">
                  DISASTER MANAGEMENT SYSTEM
                </p>

                <h1>
                  {getGreeting()} 👋
                </h1>

                <p className="subtitle">
                  Monitor hazards, vulnerable habitations and
                  relocation needs.
                </p>

              </div>


              <div className="location">

                <span>📍</span>

                <div>

                  <strong>
                    North-East India
                  </strong>

                  <small>
                    Monitoring Region
                  </small>

                </div>

              </div>

            </header>


            {/* ALERT */}
            <section className="alert-banner">

              <div className="alert-icon">
                !
              </div>

              <div>

                <strong>
                  Immediate attention required
                </strong>

                <p>
                  1 habitation has been identified as
                  requiring immediate relocation.
                </p>

              </div>

              <button>
                View Details →
              </button>

            </section>


            {/* STAT CARDS */}
            <section className="stats-grid">

              <div className="stat-card">

                <div className="stat-top">

                  <span>
                    Vulnerable Habitations
                  </span>

                  <div className="stat-icon">
                    ⌂
                  </div>

                </div>

                <h2>24</h2>

                <p>
                  Currently monitored
                </p>

              </div>


              <div className="stat-card danger">

                <div className="stat-top">

                  <span>
                    Immediate Relocation
                  </span>

                  <div className="stat-icon">
                    ⚠
                  </div>

                </div>

                <h2>1</h2>

                <p>
                  Requires urgent action
                </p>

              </div>


              <div className="stat-card warning">

                <div className="stat-top">

                  <span>
                    High Risk Zones
                  </span>

                  <div className="stat-icon">
                    ◉
                  </div>

                </div>

                <h2>8</h2>

                <p>
                  Multi-hazard areas
                </p>

              </div>


              <div className="stat-card safe">

                <div className="stat-top">

                  <span>
                    Relocation Capacity
                  </span>

                  <div className="stat-icon">
                    ✓
                  </div>

                </div>

                <h2>3,840</h2>

                <p>
                  People supported
                </p>

              </div>

            </section>


            {/* HAZARD OVERVIEW */}
            <section className="section">

              <div className="section-header">

                <div>

                  <p className="eyebrow">
                    HAZARD INTELLIGENCE
                  </p>

                  <h2>
                    Multi-Hazard Overview
                  </h2>

                </div>

                <button className="outline-button">
                  View Risk Map →
                </button>

              </div>


              <div className="hazard-grid">

                <div className="hazard-card flood">

                  <div className="hazard-symbol">
                    🌊
                  </div>

                  <div>

                    <h3>
                      Flood Risk
                    </h3>

                    <p>
                      Water level & flood probability
                    </p>

                  </div>

                  <strong>
                    HIGH
                  </strong>

                </div>


                <div className="hazard-card landslide">

                  <div className="hazard-symbol">
                    ⛰️
                  </div>

                  <div>

                    <h3>
                      Landslide Risk
                    </h3>

                    <p>
                      Slope failure probability
                    </p>

                  </div>

                  <strong>
                    MEDIUM
                  </strong>

                </div>


                <div className="hazard-card cloudburst">

                  <div className="hazard-symbol">
                    🌧️
                  </div>

                  <div>

                    <h3>
                      Cloudburst Risk
                    </h3>

                    <p>
                      Extreme localized rainfall
                    </p>

                  </div>

                  <strong>
                    HIGH
                  </strong>

                </div>

              </div>

            </section>


            {/* HABITATIONS */}
            <section className="section">

              <div className="section-header">

                <div>

                  <p className="eyebrow">
                    VULNERABILITY ASSESSMENT
                  </p>

                  <h2>
                    Priority Habitations
                  </h2>

                </div>

                <button className="outline-button">
                  View All →
                </button>

              </div>


              <div className="habitation-table">

                <div className="table-header">

                  <span>
                    HABITATION
                  </span>

                  <span>
                    POPULATION
                  </span>

                  <span>
                    RISK SCORE
                  </span>

                  <span>
                    VULNERABILITY
                  </span>

                  <span>
                    ACCESS
                  </span>

                  <span>
                    PRIORITY
                  </span>

                </div>


                {habitations.map((village) => (

                  <div
                    className="table-row"
                    key={village.name}
                  >

                    <strong>
                      {village.name}
                    </strong>


                    <span>
                      {village.population.toLocaleString()}
                    </span>


                    <span>

                      <div className="score">

                        <div className="score-bar">

                          <div
                            className={`score-fill ${village.color}`}
                            style={{
                              width: `${village.risk}%`,
                            }}
                          ></div>

                        </div>

                        <b>
                          {village.risk}
                        </b>

                      </div>

                    </span>


                    <span>
                      {village.vulnerability}/100
                    </span>


                    <span>
                      {village.accessibility}
                    </span>


                    <span>

                      <span
                        className={`priority ${village.color}`}
                      >
                        {village.priority}
                      </span>

                    </span>

                  </div>

                ))}

              </div>

            </section>


            {/* RELOCATION */}
            <section className="relocation-section">

              <div>

                <p className="eyebrow">
                  RELOCATION DECISION SUPPORT
                </p>

                <h2>
                  Find Safe Alternative Sites
                </h2>

                <p>
                  Identify suitable relocation locations
                  based on safety, carrying capacity and
                  infrastructure.
                </p>

              </div>


              <button
                className="primary-button"
                onClick={() => setActivePage("relocation")}
              >
                Start Relocation Assessment →
              </button>

            </section>

          </>

        )}

      </main>

    </div>
  );
}

export default App;