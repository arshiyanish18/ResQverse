import { useEffect, useMemo, useState } from "react";

const API_BASE_URL =
  "https://resqverse-sgqz.onrender.com";

function getRisk(village) {
  if (
    village.risk_score !== undefined &&
    village.risk_score !== null
  ) {
    return Number(village.risk_score);
  }

  if (
    village.safety_score !== undefined &&
    village.safety_score !== null
  ) {
    return (
      (1 - Number(village.safety_score)) *
      100
    );
  }

  return 0;
}

function getAccessibility(village) {
  if (
    village.accessibility_score !==
      undefined &&
    village.accessibility_score !== null
  ) {
    return (
      Number(
        village.accessibility_score
      ) * 100
    );
  }

  return null;
}

function getPriority(risk) {
  if (risk >= 85) return "IMMEDIATE";
  if (risk >= 70) return "SHORT-TERM";
  if (risk >= 50) return "MEDIUM-TERM";
  return "MONITOR";
}

function getPriorityClass(priority) {
  return priority
    .toLowerCase()
    .replace("-", "");
}

function VulnerableHabitations() {
  const [habitations, setHabitations] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("ALL");

  const [selected, setSelected] =
    useState(null);


  const loadData = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/relocation/villages`
      );

      if (!response.ok) {
        throw new Error(
          "Unable to fetch habitation data."
        );
      }

      const data =
        await response.json();

      setHabitations(
        data.villages || []
      );

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


  useEffect(() => {
    loadData();
  }, []);


  const processedData = useMemo(() => {
    return habitations.map(
      (village) => {

        const risk =
          getRisk(village);

        const accessibility =
          getAccessibility(
            village
          );

        const priority =
          getPriority(risk);

        return {
          ...village,
          risk,
          accessibility,
          priority,
        };
      }
    );
  }, [habitations]);


  const filteredData =
    processedData.filter(
      (village) => {

        const matchesSearch =
          village.village_name
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            );

        const matchesFilter =
          filter === "ALL" ||
          village.priority === filter;

        return (
          matchesSearch &&
          matchesFilter
        );
      }
    );


  const immediateCount =
    processedData.filter(
      (village) =>
        village.priority ===
        "IMMEDIATE"
    ).length;


  const highCount =
    processedData.filter(
      (village) =>
        village.risk >= 70
    ).length;


  const monitoredPopulation =
    processedData.reduce(
      (total, village) =>
        total +
        Number(
          village.population || 0
        ),
      0
    );


  const exportReport = () => {

    if (!processedData.length) {
      return;
    }

    const headers = [
      "Habitation",
      "Population",
      "Risk Score",
      "Accessibility",
      "Priority",
    ];

    const rows =
      processedData.map(
        (village) => [
          village.village_name,
          village.population,
          Math.round(
            village.risk
          ),
          village.accessibility !==
          null
            ? village.accessibility.toFixed(
                1
              )
            : "N/A",
          village.priority,
        ]
      );

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row.join(",")
      )
      .join("\n");

    const blob =
      new Blob(
        [csv],
        {
          type:
            "text/csv;charset=utf-8;",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      "resqverse_habitation_report.csv";

    link.click();

    URL.revokeObjectURL(
      url
    );
  };


  return (
    <div className="gov-habitation-page">

      {/* HEADER */}

      <header className="gov-page-header">

        <div>

          <div className="gov-eyebrow">
            COMMUNITY VULNERABILITY MONITORING
          </div>

          <h1>
            Vulnerable Habitations
          </h1>

          <p>
            Live habitation-level assessment
            using the RESQverse relocation dataset.
          </p>

        </div>


        <div className="gov-header-actions">

          <button
            className="gov-outline-button"
            onClick={loadData}
          >
            ↻ Refresh Data
          </button>

          <button
            className="gov-primary-button"
            onClick={exportReport}
          >
            Export Report
          </button>

        </div>

      </header>


      {/* SUMMARY */}

      <section className="gov-stat-grid">

        <div className="gov-stat-card">

          <span>
            MONITORED HABITATIONS
          </span>

          <strong>
            {habitations.length}
          </strong>

          <small>
            Live backend records
          </small>

        </div>


        <div className="gov-stat-card critical">

          <span>
            IMMEDIATE PRIORITY
          </span>

          <strong>
            {immediateCount}
          </strong>

          <small>
            Risk score ≥ 85
          </small>

        </div>


        <div className="gov-stat-card high">

          <span>
            HIGH EXPOSURE
          </span>

          <strong>
            {highCount}
          </strong>

          <small>
            Risk score ≥ 70
          </small>

        </div>


        <div className="gov-stat-card">

          <span>
            MONITORED POPULATION
          </span>

          <strong>
            {monitoredPopulation.toLocaleString()}
          </strong>

          <small>
            Across loaded habitations
          </small>

        </div>

      </section>


      {/* CONTROLS */}

      <section className="gov-data-panel">

        <div className="gov-data-toolbar">

          <div>

            <span className="gov-section-label">
              HABITATION REGISTER
            </span>

            <h2>
              Risk & Vulnerability Records
            </h2>

          </div>


          <div className="gov-data-controls">

            <input
              type="text"
              placeholder="Search habitation..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />


            <select
              value={filter}
              onChange={(event) =>
                setFilter(
                  event.target.value
                )
              }
            >

              <option value="ALL">
                All priorities
              </option>

              <option value="IMMEDIATE">
                Immediate
              </option>

              <option value="SHORT-TERM">
                Short-term
              </option>

              <option value="MEDIUM-TERM">
                Medium-term
              </option>

              <option value="MONITOR">
                Monitor
              </option>

            </select>

          </div>

        </div>


        {error && (
          <div className="gov-error">
            {error}
          </div>
        )}


        <div className="gov-table">

          <div className="gov-table-head">

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
              ACCESS
            </span>

            <span>
              PRIORITY
            </span>

          </div>


          {loading ? (

            <div className="gov-empty">
              Loading habitation records...
            </div>

          ) : filteredData.length === 0 ? (

            <div className="gov-empty">
              No habitation records found.
            </div>

          ) : (

            filteredData.map(
              (village, index) => {

                const risk =
                  Math.round(
                    village.risk
                  );

                return (

                  <button
                    className="gov-table-row"
                    key={village.location_code}
                    onClick={() =>
                      setSelected(
                        village
                      )
                    }
                  >

                    <div className="gov-habitation-name">

                      <span className="gov-home-icon">
                        ⌂
                      </span>

                      <div>

                        <strong>
                          {village.village_name ||
                            "Unnamed Habitation"}
                        </strong>

                        <small>
                          Dibrugarh District
                        </small>

                      </div>

                    </div>


                    <span>
                      {Number(
                        village.population ||
                        0
                      ).toLocaleString()}
                    </span>


                    <div className="gov-risk-cell">

                      <div className="gov-risk-bar">

                        <div
                          style={{
                            width:
                              `${Math.min(
                                risk,
                                100
                              )}%`,
                          }}
                        />

                      </div>

                      <strong>
                        {risk}
                      </strong>

                    </div>


                    <span>

                      {village.accessibility !==
                      null
                        ? `${village.accessibility.toFixed(
                            0
                          )}/100`
                        : "N/A"}

                    </span>


                    <span
                      className={`gov-priority ${getPriorityClass(
                        village.priority
                      )}`}
                    >
                      {village.priority}
                    </span>

                  </button>
                );
              }
            )
          )}

        </div>

      </section>


      {/* DETAILS */}

      {selected && (

        <div
          className="gov-modal-backdrop"
          onClick={() =>
            setSelected(null)
          }
        >

          <div
            className="gov-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              className="gov-modal-close"
              onClick={() =>
                setSelected(null)
              }
            >
              ×
            </button>


            <span className="gov-section-label">
              HABITATION ASSESSMENT
            </span>

            <h2>
              {selected.village_name}
            </h2>

            <p>
              Dibrugarh District
            </p>


            <div className="gov-detail-grid">

              <div>
                <span>
                  POPULATION
                </span>

                <strong>
                  {Number(
                    selected.population ||
                    0
                  ).toLocaleString()}
                </strong>
              </div>


              <div>
                <span>
                  RISK SCORE
                </span>

                <strong>
                  {Math.round(
                    getRisk(
                      selected
                    )
                  )}
                  /100
                </strong>
              </div>


              <div>
                <span>
                  SAFETY SCORE
                </span>

                <strong>
                  {selected.safety_score !==
                  undefined
                    ? `${(
                        Number(
                          selected.safety_score
                        ) * 100
                      ).toFixed(1)}/100`
                    : "N/A"}
                </strong>
              </div>


              <div>
                <span>
                  ACCESSIBILITY
                </span>

                <strong>
                  {getAccessibility(
                    selected
                  ) !== null
                    ? `${getAccessibility(
                        selected
                      ).toFixed(1)}/100`
                    : "N/A"}
                </strong>
              </div>

            </div>


            <div className="gov-modal-priority">

              <span>
                RELOCATION PRIORITY
              </span>

              <strong>
                {getPriority(
                  getRisk(
                    selected
                  )
                )}
              </strong>

            </div>


            <button
              className="gov-primary-button full"
              onClick={() =>
                setSelected(null)
              }
            >
              Close Assessment
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default VulnerableHabitations;