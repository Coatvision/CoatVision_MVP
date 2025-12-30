import { useState, useEffect } from "react";
import {
  View,
  Image,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";

import { ThemedText, ThemedView } from "@/components/Themed";
import { supabase, hasSupabase } from "@/lib/supabaseSafe";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export default function AnalyzeScreen() {
  const router = useRouter();

  const [pickedUri, setPickedUri] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  // Deriverte verdier basert på result (brukes bare når result finnes)
  const coverageScore =
    result?.metrics?.coverage_score ??
    (result?.metrics?.edge_coverage_ratio ?? 0) * 100;

  const summaryText =
    result?.metrics?.summary ??
    result?.metrics?.note ??
    "Eksperimentell bildeanalyse – tolkes med litt forsiktighet.";

  // Sjekk at bruker er innlogget før vi viser siden
  useEffect(() => {
    const checkSession = async () => {
      if (!hasSupabase || !supabase) {
        setAuthChecking(false);
        return;
      }
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.log("Feil ved henting av session", error);
        }
        if (!data.session) {
          router.replace("/login");
          return;
        }
      } finally {
        setAuthChecking(false);
      }
    };

    checkSession();
  }, []);

  const pickAndAnalyze = async () => {
    // Be om tilgang til bilder
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Gi tilgang til bilder for å bruke denne funksjonen.");
      return;
    }

    // Velg bilde fra galleriet
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });

    if (res.canceled || !res.assets || res.assets.length === 0) {
      return;
    }

    const asset = res.assets[0];
    setPickedUri(asset.uri);
    setResult(null);
    setLoading(true);

    try {
      // Les bildet som base64 og kall backend JSON-endepunktet
      // Backend forventer { image_base64: string }
      let base64Data: string | null = null;
      try {
        // Prøv å lese som base64 (native og web via fetch->arrayBuffer)
        if (Platform.OS === "web") {
          const resp = await fetch(asset.uri);
          const blob = await resp.blob();
          const arrayBuffer = await blob.arrayBuffer();
          // Konverter til base64
          const uint8Array = new Uint8Array(arrayBuffer);
          let binary = "";
          for (let i = 0; i < uint8Array.length; i++) binary += String.fromCharCode(uint8Array[i]);
          base64Data = typeof btoa !== "undefined" ? btoa(binary) : Buffer.from(binary, "binary").toString("base64");
        } else {
          base64Data = await FileSystem.readAsStringAsync(asset.uri, { encoding: 'base64' });
        }
      } catch (e) {
        console.error("Kunne ikke lese bildet som base64", e);
        alert("Kunne ikke lese bildet. Prøv et annet bilde.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/analyze/coating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_base64: base64Data }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Analyze failed", response.status, text);
        alert(`Analyse feilet (${response.status}).`);
        return;
      }

      const json = await response.json();
      setResult(json);
    } catch (err) {
      console.error(err);
      alert("Noe gikk galt under analysen.");
    } finally {
      setLoading(false);
    }
  };

  async function handleLogout() {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.log("Feil ved utlogging", error);
    } finally {
      router.replace("/login");
    }
  }

  // Mens vi sjekker om bruker er innlogget
  if (authChecking) {
    return (
      <ThemedView style={styles.loadingScreen}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Topp-linje med Logg ut */}
      <View style={styles.topBar}>
        {hasSupabase && (
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <ThemedText style={styles.logoutButtonText}>Logg ut</ThemedText>
          </Pressable>
        )}
      </View>

      <ThemedText type="title">Analyser coating</ThemedText>
      <ThemedText style={styles.subtitle}>
        Last opp et bilde av panelet, så lar vi CoatVision Core analysere hvor
        det er coating – og hvor det mangler.
      </ThemedText>

      <Pressable style={styles.button} onPress={pickAndAnalyze}>
        <ThemedText style={styles.buttonText}>
          Velg bilde og analyser
        </ThemedText>
      </Pressable>

      {loading && <ActivityIndicator style={{ marginTop: 16 }} />}

      <View style={styles.previewRow}>
        {pickedUri && (
          <View style={styles.previewBox}>
            <ThemedText style={styles.previewLabel}>Original</ThemedText>
            <Image source={{ uri: pickedUri }} style={styles.image} />
          </View>
        )}

        {result?.output_filename && (
          <View style={styles.previewBox}>
            <ThemedText style={styles.previewLabel}>CoatVision</ThemedText>
            <Image
              source={{
                uri: `${API_URL}/outputs/${result.output_filename}`,
              }}
              style={styles.image}
            />
          </View>
        )}
      </View>

      {result && (
        <ThemedView style={styles.metricsCard}>
          <ThemedText type="subtitle">Metrikker</ThemedText>
          <ThemedText>Original: {result.original_filename}</ThemedText>

          <ThemedText>
            Estimert dekning (beta): {Math.round(coverageScore)} %
          </ThemedText>

          <ThemedText>{summaryText}</ThemedText>
        </ThemedView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  loadingScreen: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 16,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  buttonText: {
    fontWeight: "600",
  },
  previewRow: {
    flexDirection: "row",
    marginTop: 24,
    gap: 16,
  },
  previewBox: {
    flex: 1,
  },
  previewLabel: {
    marginBottom: 8,
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
  },
  metricsCard: {
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#22c55e",
  },
  logoutButtonText: {
    fontWeight: "600",
  },
});
