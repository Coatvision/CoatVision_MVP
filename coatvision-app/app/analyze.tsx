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
import { supabase, hasSupabase } from "../lib/supabaseSafe";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
import { analyzeCoating, analyzeDefects, analyzeWash } from "./api";

export default function AnalyzeScreen() {
  const router = useRouter();

  const [pickedUri, setPickedUri] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

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
      // Read selected image as base64 and call JSON endpoint
      let base64: string | null = null;
      if (Platform.OS === "web") {
        const resp = await fetch(asset.uri);
        const blob = await resp.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        // Convert bytes to base64
        base64 = btoa(String.fromCharCode(...bytes));
      } else {
        const file = await FileSystem.readAsStringAsync(asset.uri, { encoding: 'base64' });
        base64 = file;
      }

      if (!base64) {
        throw new Error("Kunne ikke lese bildet som base64");
      }

      const json = await analyzeCoating(base64);
      setResult(json);
    } catch (err) {
      console.error(err);
      alert("Noe gikk galt under analysen.");
    } finally {
      setLoading(false);
    }
  };

  const analyzeDefectsAction = async () => {
    if (!pickedUri) return alert("Velg et bilde først.");
    setLoading(true);
    try {
      let base64: string | null = null;
      if (Platform.OS === "web") {
        const resp = await fetch(pickedUri);
        const blob = await resp.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        base64 = btoa(String.fromCharCode(...bytes));
      } else {
        const file = await FileSystem.readAsStringAsync(pickedUri, { encoding: 'base64' });
        base64 = file;
      }
      const json = await analyzeDefects(base64!);
      setResult(json);
    } catch (e) {
      console.error(e);
      alert("Feil ved analyse av defekter.");
    } finally {
      setLoading(false);
    }
  };

  const analyzeWashAction = async () => {
    if (!pickedUri) return alert("Velg et bilde først.");
    setLoading(true);
    try {
      let base64: string | null = null;
      if (Platform.OS === "web") {
        const resp = await fetch(pickedUri);
        const blob = await resp.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        base64 = btoa(String.fromCharCode(...bytes));
      } else {
        const file = await FileSystem.readAsStringAsync(pickedUri, { encoding: 'base64' });
        base64 = file;
      }
      const json = await analyzeWash(base64!);
      setResult(json);
    } catch (e) {
      console.error(e);
      alert("Feil ved vask/renhetsanalyse.");
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

      {/* Extra actions once image is selected */}
      {pickedUri && (
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
          <Pressable style={styles.button} onPress={analyzeDefectsAction}>
            <ThemedText style={styles.buttonText}>Analyser defekter</ThemedText>
          </Pressable>
          <Pressable style={styles.button} onPress={analyzeWashAction}>
            <ThemedText style={styles.buttonText}>Analyser vask</ThemedText>
          </Pressable>
        </View>
      )}

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
            Edge coverage (dummy):{" "}
            {Math.round((result.metrics?.edge_coverage_ratio ?? 0) * 100)} %
          </ThemedText>
          {result.metrics?.note && (
            <ThemedText>{result.metrics.note}</ThemedText>
          )}
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
