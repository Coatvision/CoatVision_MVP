// mobile/src/index.js
// Entry point for Expo app with Vercel Speed Insights
import { registerRootComponent } from "expo";
import { injectSpeedInsights } from "@vercel/speed-insights";
import App from "./App";

// Initialize Vercel Speed Insights (client-side only)
if (typeof window !== "undefined") {
  injectSpeedInsights();
}

// Register the main App component
registerRootComponent(App);
