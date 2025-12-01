// vr/src/App.jsx
// v2
import React from "react";
import { createRoot } from "react-dom/client";
import Scene from "./Scene";
import "./styles.css";

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<Scene />);
}
