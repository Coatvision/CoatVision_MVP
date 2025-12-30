import { Link } from 'expo-router';
import { ScrollView, StyleSheet, View, Pressable } from 'react-native';

import { ThemedText, ThemedView } from '@/components/Themed';

export default function WorkshopsSetupScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Oppsett & bruk i verkstedet
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Slik kan LYXvision / CoatVision kobles inn i arbeidsflyten din uten å
          ødelegge rytmen i hverdagen.
        </ThemedText>
      </View>

      {/* Stegvis oppsett */}
      <ThemedView style={styles.card}>
        <ThemedText style={styles.sectionTitle}>
          Steg 1 – Velg utstyr
        </ThemedText>
        <ThemedText style={styles.cardText}>
          Start enkelt: bruk en mobil eller et nettbrett du allerede har i
          verkstedet. Senere kan du koble til dedikerte kameraer eller AR-briller
          hvis du ønsker det.
        </ThemedText>

        <View style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <ThemedText style={styles.bulletText}>
            Mobil/nettbrett med greit kamera og stabilt WiFi.
          </ThemedText>
        </View>

        <View style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <ThemedText style={styles.bulletText}>
            Mulighet til å ta bilder både i vaskesonen og inne i hallen.
          </ThemedText>
        </View>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText style={styles.sectionTitle}>
          Steg 2 – Lag en enkel fotoplass
        </ThemedText>
        <ThemedText style={styles.cardText}>
          For best resultat er det lurt å ha ett fast sted du tar bilder og kjører
          live-analyse. Det gjør det lettere for AI-en å forstå forskjellene i
          lakken, og ikke bare lys og bakgrunn.
        </ThemedText>

        <View style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <ThemedText style={styles.bulletText}>
            Marker et lite område på gulvet for hvor du står med kamera.
          </ThemedText>
        </View>

        <View style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <ThemedText style={styles.bulletText}>
            Sørg for jevnt lys – unngå direkte sol rett i panelet hvis mulig.
          </ThemedText>
        </View>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText style={styles.sectionTitle}>
          Steg 3 – Bruk LYXvision i jobben
        </ThemedText>

        <View style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <ThemedText style={styles.bulletText}>
            Før jobben: scan bilen for å se tilstand og planlegge riktig prosess.
          </ThemedText>
        </View>

        <View style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <ThemedText style={styles.bulletText}>
            Under coating: sjekk dekning panel for panel, og finn soner du må ta
            på nytt.
          </ThemedText>
        </View>

        <View style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <ThemedText style={styles.bulletText}>
            Etterpå: lag en kort rapport med bilder og send til kunden.
          </ThemedText>
        </View>
      </ThemedView>

      {/* Hvordan det utvikles videre */}
      <ThemedView style={styles.card}>
        <ThemedText style={styles.sectionTitle}>
          Veien videre
        </ThemedText>
        <ThemedText style={styles.cardText}>
          Målet er at LYXvision skal kunne kobles opp mot timebestilling og
          kundesystemer senere, slik at tilbud, godkjenning og dokumentasjon henger
          sammen. Men det hele starter med en enkel, praktisk bruk i hallen.
        </ThemedText>
      </ThemedView>

      {/* Navigasjon */}
      <ThemedView style={styles.card}>
        <ThemedText style={styles.sectionTitle}>
          Navigasjon
        </ThemedText>
        <View style={styles.actions}>
          <Link href="/workshops-pilot" asChild>
            <Pressable style={styles.primaryButton}>
              <ThemedText style={styles.primaryButtonText}>
                Les mer om pilotverksted
              </ThemedText>
            </Pressable>
          </Link>

          <Link href="/workshops" asChild>
            <Pressable style={styles.secondaryButton}>
              <ThemedText style={styles.secondaryButtonText}>
                Tilbake til verksted-siden
              </ThemedText>
            </Pressable>
          </Link>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 16,
    backgroundColor: '#020617',
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#e5e7eb',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#9ca3af',
  },

  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#111827',
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e5e7eb',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 12,
    color: '#d1d5db',
  },

  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: '#22c55e',
    marginTop: 4,
  },
  bulletText: {
    flex: 1,
    fontSize: 12,
    color: '#d1d5db',
  },

  actions: {
    marginTop: 12,
    gap: 8,
  },
  primaryButton: {
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#22c55e',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#022c22',
  },
  secondaryButton: {
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#374151',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#e5e7eb',
  },
});
