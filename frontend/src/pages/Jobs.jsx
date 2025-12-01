// frontend/src/pages/Jobs.jsx
import React from "react";

export default function Jobs() {
  return (
    <div>
      <h1>Jobber</h1>
      <p>Placeholder – senere knyttes til Supabase-tabell &quot;jobs&quot;.</p>
      
      <div style={{
        background: "white",
        borderRadius: "8px",
        padding: "20px",
        marginTop: "20px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{ marginTop: 0 }}>Kommende funksjoner</h2>
        <ul>
          <li>Liste over alle jobber</li>
          <li>Opprett ny jobb</li>
          <li>Se jobbdetaljer og status</li>
          <li>Koble til analyseresultater</li>
        </ul>
      </div>
    </div>
  );
}
