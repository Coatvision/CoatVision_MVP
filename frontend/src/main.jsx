// frontend/src/main.jsx
// v2
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { injectSpeedInsights } from "@vercel/speed-insights";
import App from "./App";
import "./styles.css";

// Initialize Vercel Speed Insights
injectSpeedInsights();

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
