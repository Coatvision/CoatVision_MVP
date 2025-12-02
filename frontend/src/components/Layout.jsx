// frontend/src/components/Layout.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Layout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
      {/* Sidebar */}
      <nav style={{
        width: "220px",
        background: "#1a1a2e",
        color: "white",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "10px"
      }}>
        <h2 style={{ margin: "0 0 20px 0", fontSize: "1.2rem" }}>CoatVision</h2>
        <Link to="/" style={linkStyle}>Dashboard</Link>
        <Link to="/jobs" style={linkStyle}>Jobber</Link>
        <Link to="/agents" style={linkStyle}>Agenter</Link>
        <Link to="/reports" style={linkStyle}>Rapporter</Link>
        <Link to="/logs" style={linkStyle}>Logger</Link>
        <Link to="/status" style={linkStyle}>Status</Link>
      </nav>

      {/* Main content */}
      <main style={{
        flex: 1,
        padding: "20px",
        background: "#f5f5f5"
      }}>
        {children}
      </main>
    </div>
  );
}

const linkStyle = {
  color: "#ccc",
  textDecoration: "none",
  padding: "10px",
  borderRadius: "4px",
  transition: "background 0.2s"
};
