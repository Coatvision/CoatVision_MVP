// frontend/src/pages/Dashboard.jsx
// v1
import React, { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import KpiCard from "../components/KpiCard";

export default function Dashboard() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchResults() {
      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        setError("Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("analysis_results")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) throw error;
        setResults(data || []);
      } catch (err) {
        console.error("Error fetching results:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, []);

  // Calculate average metrics
  const avgCvi = results.length > 0
    ? (results.reduce((sum, r) => sum + (r.cvi || 0), 0) / results.length).toFixed(1)
    : "—";
  const avgCqi = results.length > 0
    ? (results.reduce((sum, r) => sum + (r.cqi || 0), 0) / results.length).toFixed(1)
    : "—";
  const avgCoverage = results.length > 0
    ? (results.reduce((sum, r) => sum + (r.coverage || 0), 0) / results.length).toFixed(1)
    : "—";

  return (
    <div>
      <h1 style={{ marginBottom: "20px" }}>Dashboard</h1>

      {/* KPI Cards */}
      <div style={{
        display: "flex",
        gap: "20px",
        marginBottom: "30px",
        flexWrap: "wrap"
      }}>
        <KpiCard
          title="Gj.snitt CVI"
          value={avgCvi}
          unit="%"
          description="Coating Visual Index"
        />
        <KpiCard
          title="Gj.snitt CQI"
          value={avgCqi}
          unit="%"
          description="Coating Quality Index"
        />
        <KpiCard
          title="Gj.snitt Dekning"
          value={avgCoverage}
          unit="%"
          description="Coverage"
        />
        <KpiCard
          title="Analyser"
          value={results.length}
          description="Siste 10 analyser"
        />
      </div>

      {/* Results Table */}
      <div style={{
        background: "white",
        borderRadius: "8px",
        padding: "20px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{ marginTop: 0 }}>Siste Analyser</h2>

        {loading && <p>Laster...</p>}
        {error && <p style={{ color: "red" }}>Feil: {error}</p>}

        {!loading && !error && results.length === 0 && (
          <p>Ingen analyseresultater funnet.</p>
        )}

        {!loading && !error && results.length > 0 && (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #ddd" }}>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>CVI</th>
                <th style={thStyle}>CQI</th>
                <th style={thStyle}>Dekning</th>
                <th style={thStyle}>Dato</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={tdStyle}>{r.id}</td>
                  <td style={tdStyle}>{r.cvi?.toFixed(1) || "—"}%</td>
                  <td style={tdStyle}>{r.cqi?.toFixed(1) || "—"}%</td>
                  <td style={tdStyle}>{r.coverage?.toFixed(1) || "—"}%</td>
                  <td style={tdStyle}>
                    {r.created_at ? new Date(r.created_at).toLocaleDateString("no-NO") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const thStyle = {
  textAlign: "left",
  padding: "10px",
  color: "#666"
};

const tdStyle = {
  padding: "10px"
};
