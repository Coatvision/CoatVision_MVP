import { Link } from 'expo-router';
import { ScrollView, StyleSheet, View, Pressable } from 'react-native';

import { ThemedText, ThemedView } from '@/components/Themed';

export default function PartnersUploadDataScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Produsentportal – Treningsdata
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Veiledning for hvordan du samler inn og laster opp bilder/video for å trene
          CoatVision på dine produkter.
        </ThemedText>
      </View>

      {/* Kort: struktur */}
      <ThemedView style={styles.card}>
        <ThemedText style={styles.sectionTitle}>
          Hvordan treningsdata brukes
        </ThemedText>
        <ThemedText style={styles.cardText}>
          Bildene og videoene du laster opp brukes til å lære modellen å skille
          mellom coating og ikke coating, riktig og feil påføring, og hvordan
          produktene dine ser ut under ulike lysforhold og vinkler.
        </ThemedText>
      </ThemedView>

      {/* Kort: anbefalt fotoprotokoll */}
      <ThemedView style={styles.card}>
        <ThemedText style={styles.sectionTitle}>
          Anbefalt fotoprotokoll
        </ThemedText>

        <View style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <ThemedText style={styles.bulletText}>
            Bruk jevnt og stabilt lys (unngå harde skygger og sterke hotspot-refleksjoner).
          </ThemedText>
        </View>

        <View style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <ThemedText style={styles.bulletText}>
            Hold fast vinkel (ca. 45°) og fast avstand til panelet – merk gjerne gulvet.
          </ThemedText>
        </View>

        <View style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <ThemedText style={styles.bulletText}>
            Ta sekvenser: før påføring, under påføring, etter buffing og etter herding.
          </ThemedText>
        </View>

        <View style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <ThemedText style={styles.bulletText}>
            Inkluder også «feilbilder» – for mye/lite produkt, high spots, hologrammer osv.
          </ThemedText>
        </View>
      </ThemedView>

      {/* Kort: opplasting – senere erstattes med ekte upload-komponent */}
      <ThemedView style={styles.card}>
        <ThemedText style={styles.sectionTitle}>
          Opplasting (prototype)
        </ThemedText>
        <ThemedText style={styles.cardText}>
          I denne prototypen er det ikke koblet opp faktisk filopplasting ennå. I en
          senere versjon vil du kunne:
        </ThemedText>

        <View style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <ThemedText style={styles.bulletText}>
            Velge hvilket produkt datasettet tilhører.
          </ThemedText>
        </View>

        <View style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <ThemedText style={styles.bulletText}>
            Dra og slippe bildefiler eller video fra PC, nettbrett eller mobil.
          </ThemedText>
        </View>

        <View style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <ThemedText style={styles.bulletText}>
            Knytte metadata til hvert sett (paneltype, farge, lysforhold, status).
          </ThemedText>
        </View>
      </ThemedView>

      {/* Navigasjon */}
      <ThemedView style={styles.card}>
        <ThemedText style={styles.sectionTitle}>
          Navigasjon
        </ThemedText>
        <ThemedText style={styles.cardText}>
          Når opplastingsløsningen er klar, vil denne siden være stedet hvor
          produsenter går for å holde treningsdata oppdatert.
        </ThemedText>

        <View style={styles.actions}>
          <Link href="/partners-products" asChild>
            <Pressable style={styles.primaryButton}>
              <ThemedText style={styles.primaryButtonText}>
                Gå til produktsiden
              </ThemedText>
            </Pressable>
          </Link>

          <Link href="/partners" asChild>
            <Pressable style={styles.secondaryButton}>
              <ThemedText style={styles.secondaryButtonText}>
                Tilbake til produsentportal
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
