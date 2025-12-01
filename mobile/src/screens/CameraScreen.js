// mobile/src/screens/CameraScreen.js
// v2
import React, { useEffect, useRef, useState } from "react";
import { View, Button, Text, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { Camera, CameraType } from "expo-camera";
import axios from "axios";
import { API_BASE } from "../utils/api";

export default function CameraScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState(CameraType.back);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const captureAndAnalyze = async () => {
    if (!cameraRef.current) return;

    setIsLoading(true);
    try {
      // Take photo
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.8,
      });

      // Send to backend for analysis
      const response = await axios.post(`${API_BASE}/analyze/base64`, {
        image: photo.base64,
      });

      const result = response.data;

      // Navigate to results screen with analysis data
      navigation.navigate("Result", {
        metrics: result.metrics,
        imageUri: photo.uri,
      });
    } catch (error) {
      console.error("Analysis error:", error);
      Alert.alert(
        "Feil",
        "Kunne ikke analysere bildet. Prøv igjen.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCameraType = () => {
    setType((current) =>
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Venter på kameratilgang...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Ingen tilgang til kamera. Vennligst aktiver kameratilgang i innstillinger.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={type} ref={cameraRef}>
        <View style={styles.overlay}>
          {/* Targeting frame */}
          <View style={styles.targetFrame} />
        </View>
      </Camera>

      <View style={styles.controls}>
        <Button title="Bytt kamera" onPress={toggleCameraType} />

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1a1a2e" />
            <Text style={styles.loadingText}>Analyserer...</Text>
          </View>
        ) : (
          <Button
            title="Ta bilde og analyser"
            onPress={captureAndAnalyze}
            color="#1a1a2e"
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  targetFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 10,
  },
  controls: {
    padding: 20,
    backgroundColor: "#fff",
    gap: 10,
  },
  loadingContainer: {
    alignItems: "center",
    padding: 10,
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  errorText: {
    padding: 20,
    textAlign: "center",
    color: "#666",
  },
});
