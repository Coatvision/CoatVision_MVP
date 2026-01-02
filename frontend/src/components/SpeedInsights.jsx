// frontend/src/components/SpeedInsights.jsx
// Vercel Speed Insights integration component
import React from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';

/**
 * SpeedInsights Component
 * 
 * This component integrates Vercel Speed Insights into the application.
 * It tracks Web Vitals and sends performance metrics to Vercel.
 * 
 * For more information, see: https://vercel.com/docs/speed-insights
 */
export default function SpeedInsightsComponent() {
  return <SpeedInsights />;
}
