// mobile/src/components/PDFButton.js
import React from "react";
import { Button, Alert, Platform } from "react-native";
import * as Linking from "expo-linking";
import { API_BASE } from "../utils/api";

/**
 * Button component that opens the PDF report in the browser
 */
export default function PDFButton({ jobId = null, title = "Last ned rapport" }) {
  const openReport = async () => {
    try {
      // Build report URL
      const reportUrl = `${API_BASE}/report/demo${jobId ? `?job_id=${jobId}` : ""}`;
      
      // Check if we can open the URL
      const canOpen = await Linking.canOpenURL(reportUrl);
      
      if (canOpen) {
        await Linking.openURL(reportUrl);
      } else {
        Alert.alert(
          "Feil",
          "Kunne ikke åpne rapport-URL. Sjekk at backend kjører.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error opening report:", error);
      Alert.alert(
        "Feil",
        "En feil oppstod ved åpning av rapporten.",
        [{ text: "OK" }]
      );
    }
  };

  return (
    <Button
      title={title}
      onPress={openReport}
      color={Platform.OS === "ios" ? "#1a1a2e" : undefined}
    />
  );
}
