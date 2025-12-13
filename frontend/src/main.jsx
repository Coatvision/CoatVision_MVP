// frontend/src/main.jsx
// v2
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import App from "./App";
import "./styles.css";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <SpeedInsights />
    </BrowserRouter>
  </React.StrictMode>
);
