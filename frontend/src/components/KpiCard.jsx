// frontend/src/components/KpiCard.jsx
import React from "react";

export default function KpiCard({ title, value, unit = "", description = "" }) {
  return (
    <div style={{
      background: "white",
      borderRadius: "8px",
      padding: "20px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      minWidth: "200px"
    }}>
      <h3 style={{
        margin: "0 0 10px 0",
        fontSize: "0.9rem",
        color: "#666",
        textTransform: "uppercase"
      }}>
        {title}
      </h3>
      <div style={{
        fontSize: "2rem",
        fontWeight: "bold",
        color: "#1a1a2e"
      }}>
        {value}{unit && <span style={{ fontSize: "1rem", color: "#888" }}> {unit}</span>}
      </div>
      {description && (
        <p style={{
          margin: "10px 0 0 0",
          fontSize: "0.85rem",
          color: "#999"
        }}>
          {description}
        </p>
      )}
    </div>
  );
}
