import React from "react";
import { inject } from "@vercel/analytics";
import CameraScreen from "./src/screens/CameraScreen";

// Initialize Vercel Web Analytics
inject();

export default function App() {
  return <CameraScreen />;
}
