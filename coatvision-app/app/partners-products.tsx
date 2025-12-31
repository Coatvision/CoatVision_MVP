import { Link } from 'expo-router';
import { ScrollView, StyleSheet, View, Pressable } from 'react-native';

import { ThemedText, ThemedView } from '@/components/Themed';

export default function PartnersProductsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Produsentportal – Produkter
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Registrer coating-produkter, primere, toppcoats og vedlikeholdsprodukter.
        </ThemedText>
      </View>

      {/* Kort: hva denne siden er */}
      <ThemedView style={styles.card}>
        <ThemedText style={styles.sectionTitle}>
          Produktprofiler i LYXvision
        </ThemedText>
        <ThemedText style={styles.cardText}>
          Hvert produkt du legger inn får sin egen profil i systemet. Den kobles til
          treningsdata, anbefalt bruk og hvilke paneltyper og lysforhold det er
          testet i. Dette gjør at AI-en kan gi riktige anbefalinger til verkstedene.
        </ThemedText>
      </ThemedView>

      {/* Placeholder "liste" – her kan du senere koble til backend */}
      <ThemedView style={styles.card}>
        <ThemedText style={styles.sectionTitle}>
          Eksempel på felter for et produkt
        </ThemedText>

        <View style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <ThemedText style={styles.bulletText}>
            Produktnavn (f.eks. “XTreme Ceramic Coat v2”)
          </ThemedText>
        </View>

        <View style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <ThemedText style={styles.bulletText}>
            Produkttype (primer, base-coat, toppcoat, vedlikeholdsprodukt)
          </ThemedText>
        </View>

        <View style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <ThemedText style={styles.bulletText}>
            Anbefalt herdetid, temperatur og lysforhold
          </ThemedText>
        </View>

        <View style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <ThemedText style={styles.bulletText}>
            Hvilke paneltyper og farger produktet er testet på
          </ThemedText>
        </View>

        <View style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <ThemedText style={styles.bulletText}>
            Lenker til treningsdatasett (bilder/video av riktig bruk)
          </ThemedText>
        </View>
      </ThemedView>

      {/* Handling / CTA – senere kan dette bli "Nytt produkt"-skjema */}
      <ThemedView style={styles.card}>
        <ThemedText style={styles.sectionTitle}>
          Neste steg
        </ThemedText>
        <ThemedText style={styles.cardText}>
          I en senere versjon kan denne siden inneholde et faktisk skjema for å
          registrere og redigere produkter. Foreløpig fungerer den som en oversikt
          over hva produsentprofilen bør inneholde.
        </ThemedText>

        <View style={styles.actions}>
          <Link href="/partners-upload-data" asChild>
            <Pressable style={styles.primaryButton}>
              <ThemedText style={styles.primaryButtonText}>
                Gå til opplasting av treningsdata
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
