// frontend/src/pages/Status.jsx
// v1
import React, { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function Status() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatus();
    // Refresh status every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/status/`);
      if (!response.ok) throw new Error("Failed to fetch status");
      const data = await response.json();
      setStatus(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching status:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      healthy: { background: "#dcfce7", color: "#166534", borderColor: "#22c55e" },
      configured: { background: "#dcfce7", color: "#166534", borderColor: "#22c55e" },
      degraded: { background: "#fef3c7", color: "#d97706", borderColor: "#f59e0b" },
      error: { background: "#fee2e2", color: "#dc2626", borderColor: "#ef4444" },
      not_configured: { background: "#f3f4f6", color: "#6b7280", borderColor: "#9ca3af" },
    };
    return styles[status] || styles.error;
  };

  if (loading) {
    return (
      <div>
        <h1>Systemstatus</h1>
        <p>Laster...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1>Systemstatus</h1>
        <div style={{ 
          background: "#fee2e2", 
          color: "#dc2626", 
          padding: "20px", 
          borderRadius: "8px",
          marginTop: "20px"
        }}>
          <strong>Feil:</strong> {error}
          <br />
          <button
            onClick={fetchStatus}
            style={{
              marginTop: "10px",
              padding: "8px 16px",
              background: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Prøv igjen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ margin: 0 }}>Systemstatus</h1>
        <button
          onClick={fetchStatus}
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

      {/* Overall Status */}
      <div
        style={{
          background: "white",
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "20px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Generell Status</h2>
        <div style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>
          <div>
            <span style={{ color: "#666" }}>API:</span>{" "}
            <span
              style={{
                ...getStatusStyle(status.overall_status),
                padding: "4px 12px",
                borderRadius: "20px",
                fontWeight: "500",
              }}
            >
              {status.overall_status === "healthy" ? "Sunn" : status.overall_status}
            </span>
          </div>
          <div>
            <span style={{ color: "#666" }}>Versjon:</span>{" "}
            <strong>{status.system?.version}</strong>
          </div>
          <div>
            <span style={{ color: "#666" }}>Sist oppdatert:</span>{" "}
            <strong>{new Date(status.system?.timestamp).toLocaleString("no-NO")}</strong>
          </div>
        </div>
      </div>

      {/* Subsystems */}
      <div
        style={{
          background: "white",
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "20px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Undersystemer</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
          }}
        >
          {Object.entries(status.subsystems || {}).map(([name, info]) => (
            <SubsystemCard key={name} name={name} info={info} getStatusStyle={getStatusStyle} />
          ))}
        </div>
      </div>

      {/* Endpoints */}
      <div
        style={{
          background: "white",
          borderRadius: "8px",
          padding: "20px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ marginTop: 0 }}>API Endepunkter</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {Object.entries(status.endpoints || {}).map(([name, path]) => (
            <div
              key={name}
              style={{
                background: "#f5f5f5",
                padding: "8px 16px",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <strong>{name}:</strong>
              <code style={{ color: "#2563eb" }}>{path}</code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SubsystemCard({ name, info, getStatusStyle }) {
  const displayName = {
    analyze: "Bildeanalyse",
    wash: "Vaskeanalyse",
    lyxbot: "LYXbot Agent",
    reports: "Rapporter",
    database: "Database",
  };

  return (
    <div
      style={{
        border: `2px solid ${getStatusStyle(info.status).borderColor}`,
        borderRadius: "8px",
        padding: "15px",
        background: getStatusStyle(info.status).background,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <h3 style={{ margin: 0, color: "#333" }}>{displayName[name] || name}</h3>
        <span
          style={{
            background: "white",
            padding: "4px 10px",
            borderRadius: "12px",
            fontSize: "0.85rem",
            fontWeight: "500",
            color: getStatusStyle(info.status).color,
          }}
        >
          {info.status === "healthy" ? "OK" : info.status === "configured" ? "Konfigurert" : info.status}
        </span>
      </div>
      
      {info.module && (
        <div style={{ fontSize: "0.9rem", color: "#666", marginBottom: "5px" }}>
          <strong>Modul:</strong> {info.module}
        </div>
      )}
      
      {info.agent && (
        <div style={{ fontSize: "0.9rem", color: "#666", marginBottom: "5px" }}>
          <strong>Agent:</strong> {info.agent}
        </div>
      )}
      
      {info.provider && (
        <div style={{ fontSize: "0.9rem", color: "#666", marginBottom: "5px" }}>
          <strong>Provider:</strong> {info.provider}
        </div>
      )}
      
      {info.features && info.features.length > 0 && (
        <div style={{ marginTop: "10px" }}>
          <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "5px" }}>Funksjoner:</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
            {info.features.map((feature) => (
              <span
                key={feature}
                style={{
                  background: "white",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  fontSize: "0.8rem",
                  color: "#666",
                }}
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
