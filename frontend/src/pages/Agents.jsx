// frontend/src/pages/Agents.jsx
import React from "react";

export default function Agents() {
  return (
    <div>
      <h1>Agenter</h1>
      <p>Placeholder – UI for LYXbot og agent-styring kommer senere.</p>
      
      <div style={{
        background: "white",
        borderRadius: "8px",
        padding: "20px",
        marginTop: "20px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{ marginTop: 0 }}>LYXbot Agent</h2>
        <p>Status: <span style={{ color: "green" }}>Aktiv</span></p>
        <p>Versjon: 1.0.0</p>
        
        <h3>Kommende funksjoner</h3>
        <ul>
          <li>Agent-konfigurasjon</li>
          <li>Aktivitetslogg</li>
          <li>Manuell kommandoer</li>
          <li>Automatiseringsregler</li>
        </ul>
      </div>
    </div>
  );
}
