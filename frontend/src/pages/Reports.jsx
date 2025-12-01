// frontend/src/pages/Reports.jsx
import React from "react";

const REPORT_URL = (jobId) => 
  `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/api/report/demo${jobId ? `?job_id=${jobId}` : ""}`;

export default function Reports() {
  const openDemo = () => {
    window.open(REPORT_URL(), "_blank");
  };

  return (
    <div>
      <h1>Rapporter</h1>
      <p>Generer og last ned analyserapporter i PDF-format.</p>
      
      <div style={{
        background: "white",
        borderRadius: "8px",
        padding: "20px",
        marginTop: "20px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{ marginTop: 0 }}>Demo Rapport</h2>
        <p>Klikk knappen under for å generere en demo-rapport:</p>
        
        <button 
          onClick={openDemo}
          style={{
            background: "#1a1a2e",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "1rem"
          }}
        >
          Last ned Demo PDF
        </button>
        
        <h3 style={{ marginTop: "30px" }}>Kommende funksjoner</h3>
        <ul>
          <li>Generer rapport for spesifikk jobb</li>
          <li>Tilpass rapportinnhold</li>
          <li>Eksporter til flere formater</li>
          <li>Planlagte rapporter</li>
        </ul>
      </div>
    </div>
  );
}
