// frontend/src/pages/Logs.jsx
// v1
import React, { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({ endpoint: "", level: "" });

  useEffect(() => {
    fetchLogs();
    fetchSummary();
  }, [filter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/api/logs/?limit=50`;
      if (filter.endpoint) url += `&endpoint=${filter.endpoint}`;
      if (filter.level) url += `&level=${filter.level}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch logs");
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (err) {
      console.error("Error fetching logs:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/logs/summary`);
      if (!response.ok) throw new Error("Failed to fetch summary");
      const data = await response.json();
      setSummary(data);
    } catch (err) {
      console.error("Error fetching summary:", err);
    }
  };

  const getLevelStyle = (level) => {
    const styles = {
      error: { background: "#fee2e2", color: "#dc2626" },
      warning: { background: "#fef3c7", color: "#d97706" },
      info: { background: "#dbeafe", color: "#2563eb" },
      debug: { background: "#f3f4f6", color: "#6b7280" },
    };
    return styles[level] || styles.info;
  };

  return (
    <div>
      <h1 style={{ marginBottom: "20px" }}>Systemlogger</h1>

      {/* Summary Cards */}
      {summary && (
        <div
          style={{
            display: "flex",
            gap: "20px",
            marginBottom: "30px",
            flexWrap: "wrap",
          }}
        >
          <SummaryCard title="Logger (24t)" value={summary.total_logs_24h} />
          <SummaryCard
            title="Feil (24t)"
            value={summary.errors_24h}
            color="#dc2626"
          />
          <SummaryCard
            title="Advarsler (24t)"
            value={summary.warnings_24h}
            color="#d97706"
          />
        </div>
      )}

      {/* Filters */}
      <div
        style={{
          background: "white",
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "20px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: "15px" }}>Filtre</h3>
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          <div>
            <label style={{ display: "block", marginBottom: "5px" }}>
              Endepunkt:
            </label>
            <select
              value={filter.endpoint}
              onChange={(e) =>
                setFilter({ ...filter, endpoint: e.target.value })
              }
              style={selectStyle}
            >
              <option value="">Alle</option>
              <option value="analyze">Analyze</option>
              <option value="wash">Wash</option>
              <option value="lyxbot">LYXbot</option>
              <option value="reports">Reports</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "5px" }}>
              Nivå:
            </label>
            <select
              value={filter.level}
              onChange={(e) => setFilter({ ...filter, level: e.target.value })}
              style={selectStyle}
            >
              <option value="">Alle</option>
              <option value="error">Error</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
            </select>
          </div>
          <div style={{ alignSelf: "flex-end" }}>
            <button
              onClick={fetchLogs}
              style={{
                background: "#1a1a2e",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Oppdater
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div
        style={{
          background: "white",
          borderRadius: "8px",
          padding: "20px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Siste Logger</h2>

        {loading && <p>Laster...</p>}
        {error && <p style={{ color: "red" }}>Feil: {error}</p>}

        {!loading && !error && logs.length === 0 && (
          <p>Ingen logger funnet.</p>
        )}

        {!loading && !error && logs.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #ddd" }}>
                  <th style={thStyle}>Tid</th>
                  <th style={thStyle}>Endepunkt</th>
                  <th style={thStyle}>Nivå</th>
                  <th style={thStyle}>Melding</th>
                  <th style={thStyle}>Detaljer</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr key={log.id || index} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={tdStyle}>
                      {log.created_at
                        ? new Date(log.created_at).toLocaleString("no-NO")
                        : "—"}
                    </td>
                    <td style={tdStyle}>
                      <code style={{ background: "#f5f5f5", padding: "2px 6px", borderRadius: "4px" }}>
                        {log.endpoint}
                      </code>
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          ...getLevelStyle(log.level),
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "0.85rem",
                          fontWeight: "500",
                        }}
                      >
                        {log.level?.toUpperCase()}
                      </span>
                    </td>
                    <td style={tdStyle}>{log.message}</td>
                    <td style={tdStyle}>
                      {log.details && Object.keys(log.details).length > 0 ? (
                        <details>
                          <summary style={{ cursor: "pointer" }}>Vis</summary>
                          <pre
                            style={{
                              fontSize: "0.8rem",
                              background: "#f5f5f5",
                              padding: "8px",
                              borderRadius: "4px",
                              marginTop: "5px",
                              overflow: "auto",
                              maxWidth: "300px",
                            }}
                          >
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ title, value, color = "#1a1a2e" }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "8px",
        padding: "20px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        minWidth: "150px",
      }}
    >
      <h3
        style={{
          margin: "0 0 10px 0",
          fontSize: "0.9rem",
          color: "#666",
          textTransform: "uppercase",
        }}
      >
        {title}
      </h3>
      <div
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
          color: color,
        }}
      >
        {value}
      </div>
    </div>
  );
}

const thStyle = {
  textAlign: "left",
  padding: "10px",
  color: "#666",
};

const tdStyle = {
  padding: "10px",
  verticalAlign: "top",
};

const selectStyle = {
  padding: "8px 12px",
  borderRadius: "4px",
  border: "1px solid #ddd",
  minWidth: "150px",
};
