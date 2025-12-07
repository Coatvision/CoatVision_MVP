// frontend/src/pages/Logs.jsx
import React, { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Logs() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [allAnalyses, setAllAnalyses] = useState([]);
  const [summaryStats, setSummaryStats] = useState(null);
  const [error, setError] = useState(null);

  // Fetch all analyses on mount
  useEffect(() => {
    fetchAnalyses();
    fetchSummaryStats();
  }, []);

  const fetchAnalyses = async () => {
    try {
      const response = await fetch(`${API_URL}/api/logs/`);
      const data = await response.json();
      setAllAnalyses(data.analyses || []);
    } catch (err) {
      console.error("Error fetching analyses:", err);
    }
  };

  const fetchSummaryStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/logs/stats/summary`);
      const data = await response.json();
      setSummaryStats(data);
    } catch (err) {
      console.error("Error fetching summary stats:", err);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type (accept .log, .txt, and common log extensions)
      const validExtensions = ['.log', '.txt', '.out'];
      const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
      
      if (!validExtensions.includes(fileExtension)) {
        setError("Please upload a valid log file (.log, .txt, .out)");
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_URL}/api/logs/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      setCurrentAnalysis(data.analysis);
      
      // Refresh analyses list and stats
      fetchAnalyses();
      fetchSummaryStats();
      
      // Clear file input
      setFile(null);
      document.getElementById('fileInput').value = '';
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (logId) => {
    try {
      const response = await fetch(`${API_URL}/api/logs/${logId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Refresh analyses list
        fetchAnalyses();
        fetchSummaryStats();
        
        // Clear current analysis if it was deleted
        if (currentAnalysis && currentAnalysis.id === logId) {
          setCurrentAnalysis(null);
        }
      }
    } catch (err) {
      console.error("Error deleting analysis:", err);
    }
  };

  return (
    <div>
      <h1>Log File Analysis</h1>
      <p>Upload and analyze log files to identify error frequencies and trends.</p>

      {/* Upload Section */}
      <div style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Upload Log File</h2>
        <div style={{ marginBottom: "15px" }}>
          <input
            id="fileInput"
            type="file"
            accept=".log,.txt,.out"
            onChange={handleFileChange}
            style={fileInputStyle}
          />
        </div>
        
        {file && (
          <div style={{ marginBottom: "10px", color: "#666" }}>
            Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
          </div>
        )}
        
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          style={{
            ...buttonStyle,
            opacity: !file || uploading ? 0.5 : 1,
            cursor: !file || uploading ? "not-allowed" : "pointer"
          }}
        >
          {uploading ? "Analyzing..." : "Upload & Analyze"}
        </button>
        
        {error && (
          <div style={errorStyle}>{error}</div>
        )}
      </div>

      {/* Summary Statistics */}
      {summaryStats && summaryStats.total_analyses > 0 && (
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Summary Statistics</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
            <StatCard label="Total Analyses" value={summaryStats.total_analyses} />
            <StatCard label="Total Errors" value={summaryStats.total_errors} color="#e74c3c" />
            <StatCard label="Total Warnings" value={summaryStats.total_warnings} color="#f39c12" />
            <StatCard label="Avg Errors/File" value={summaryStats.avg_errors_per_file} />
          </div>
        </div>
      )}

      {/* Current Analysis Results */}
      {currentAnalysis && (
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Analysis Results: {currentAnalysis.filename}</h2>
          
          {/* Overview Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "15px", marginBottom: "20px" }}>
            <StatCard label="Total Lines" value={currentAnalysis.total_lines} />
            <StatCard label="Errors" value={currentAnalysis.error_count} color="#e74c3c" />
            <StatCard label="Warnings" value={currentAnalysis.warning_count} color="#f39c12" />
            <StatCard label="Info" value={currentAnalysis.info_count} color="#3498db" />
          </div>

          {/* Top Errors */}
          {currentAnalysis.top_errors && currentAnalysis.top_errors.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <h3>Top Errors</h3>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Error Message</th>
                    <th style={thStyle}>Count</th>
                    <th style={thStyle}>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAnalysis.top_errors.map((error, idx) => (
                    <tr key={idx}>
                      <td style={tdStyle}>{error.message}</td>
                      <td style={tdStyle}>{error.count}</td>
                      <td style={tdStyle}>{error.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Error Trends */}
          {currentAnalysis.error_trends && currentAnalysis.error_trends.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <h3>Error Trends Over Time</h3>
              <div style={trendContainerStyle}>
                {currentAnalysis.error_trends.map((trend, idx) => (
                  <div key={idx} style={trendItemStyle}>
                    <div style={{ fontSize: "12px", color: "#666" }}>{trend.time}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div 
                        style={{
                          height: "20px",
                          width: `${Math.min((trend.count / Math.max(...currentAnalysis.error_trends.map(t => t.count))) * 200, 200)}px`,
                          background: "#e74c3c",
                          borderRadius: "4px"
                        }}
                      />
                      <span>{trend.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: "15px", fontSize: "12px", color: "#888" }}>
            Analyzed at: {new Date(currentAnalysis.analyzed_at).toLocaleString()}
          </div>
        </div>
      )}

      {/* Previous Analyses */}
      {allAnalyses.length > 0 && (
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Previous Analyses</h2>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Filename</th>
                <th style={thStyle}>Lines</th>
                <th style={thStyle}>Errors</th>
                <th style={thStyle}>Warnings</th>
                <th style={thStyle}>Analyzed At</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allAnalyses.map((analysis) => (
                <tr key={analysis.id}>
                  <td style={tdStyle}>{analysis.filename}</td>
                  <td style={tdStyle}>{analysis.total_lines}</td>
                  <td style={tdStyle}>{analysis.error_count}</td>
                  <td style={tdStyle}>{analysis.warning_count}</td>
                  <td style={tdStyle}>{new Date(analysis.analyzed_at).toLocaleString()}</td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => setCurrentAnalysis(analysis)}
                      style={smallButtonStyle}
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(analysis.id)}
                      style={{ ...smallButtonStyle, background: "#e74c3c", marginLeft: "5px" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ label, value, color = "#2c3e50" }) {
  return (
    <div style={{ ...statCardStyle, borderLeft: `4px solid ${color}` }}>
      <div style={{ fontSize: "14px", color: "#666", marginBottom: "5px" }}>{label}</div>
      <div style={{ fontSize: "24px", fontWeight: "bold", color }}>{value}</div>
    </div>
  );
}

// Styles
const cardStyle = {
  background: "white",
  borderRadius: "8px",
  padding: "20px",
  marginTop: "20px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
};

const fileInputStyle = {
  padding: "10px",
  border: "1px solid #ddd",
  borderRadius: "4px",
  width: "100%",
  maxWidth: "400px"
};

const buttonStyle = {
  background: "#3498db",
  color: "white",
  border: "none",
  padding: "12px 24px",
  borderRadius: "4px",
  fontSize: "14px",
  fontWeight: "bold",
  cursor: "pointer"
};

const smallButtonStyle = {
  background: "#3498db",
  color: "white",
  border: "none",
  padding: "6px 12px",
  borderRadius: "4px",
  fontSize: "12px",
  cursor: "pointer"
};

const errorStyle = {
  marginTop: "10px",
  padding: "10px",
  background: "#fee",
  border: "1px solid #fcc",
  borderRadius: "4px",
  color: "#c33"
};

const statCardStyle = {
  background: "#f9f9f9",
  padding: "15px",
  borderRadius: "4px"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "10px"
};

const thStyle = {
  background: "#f0f0f0",
  padding: "10px",
  textAlign: "left",
  borderBottom: "2px solid #ddd"
};

const tdStyle = {
  padding: "10px",
  borderBottom: "1px solid #eee"
};

const trendContainerStyle = {
  maxHeight: "300px",
  overflowY: "auto",
  padding: "10px",
  background: "#f9f9f9",
  borderRadius: "4px"
};

const trendItemStyle = {
  marginBottom: "10px",
  padding: "10px",
  background: "white",
  borderRadius: "4px",
  border: "1px solid #eee"
};
