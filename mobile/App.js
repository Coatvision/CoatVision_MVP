import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { injectSpeedInsights } from '@vercel/speed-insights';
import CameraScreen from './src/screens/CameraScreen';

export default function App() {
  useEffect(() => {
    // Initialize Vercel Speed Insights for performance monitoring
    // This must run on the client side only
    try {
      injectSpeedInsights();
    } catch (error) {
      console.error('Failed to initialize Speed Insights:', error);
    }
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" />
      <CameraScreen />
    </>
  );
}
