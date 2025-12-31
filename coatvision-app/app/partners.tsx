import { Link } from 'expo-router';
import { ScrollView, StyleSheet, View, Pressable } from 'react-native';

import { ThemedText, ThemedView } from '@/components/Themed';

export default function PartnersScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Produsentportal
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          For coating- og bilpleieprodusenter som vil integrere produktene sine i
          LYXvision / CoatVision.
        </ThemedText>
      </View>

      {/* Intro-kort */}
      <ThemedView style={styles.card}>
        <ThemedText style={styles.cardTitle}>
          Hvorfor egen portal for produsenter?
        </ThemedText>
        <ThemedText style={styles.cardText}>
          Produsentportalen lar deg bygge egne profiler for produkter, laste opp
          treningsdata og sikre at verksteder som bruker LYXvision får riktige
          anbefalinger for akkurat din coating og ditt system.
        </ThemedText>
      </ThemedView>

      {/* Seksjon: hovedfunksjoner */}
      <ThemedView style={styles.card}>
        <ThemedText style={styles.sectionTitle}>
          Hva kan du gjøre i portalen?
        </ThemedText>

        <View style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <ThemedText style={styles.bulletText}>
            Registrere coating-produkter, primere, toppcoats og vedlikeholdsprodukter.
          </ThemedText>
        </View>

        <View style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <ThemedText style={styles.bulletText}>
            Laste opp bilder og video av riktig påføring, buffing og sluttkontroll for
            å trene AI-modellen.
          </ThemedText>
        </View>

        <View style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <ThemedText style={styles.bulletText}>
            Definere anbefalte arbeidsprosedyrer, herdetid og kontrollpunkter som
            vises direkte til detailere i appen.
          </ThemedText>
        </View>

        <View style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <ThemedText style={styles.bulletText}>
            Få innsyn i hvordan produktene dine brukes i felt (aggregert statistikk og
            tilbakemeldinger fra verksteder).
          </ThemedText>
        </View>
      </ThemedView>

      {/* Snarveier til undersider */}
      <ThemedView style={styles.card}>
        <ThemedText style={styles.sectionTitle}>
          Kom i gang
        </ThemedText>
        <ThemedText style={styles.cardText}>
          Start med å legge inn produktene dine, og bygg deretter opp treningsdata som
          viser riktig bruk og ønsket sluttresultat.
        </ThemedText>

        <View style={styles.actions}>
          <Link href="/partners-products" asChild>
            <Pressable style={styles.primaryButton}>
              <ThemedText style={styles.primaryButtonText}>
                Administrer produkter
              </ThemedText>
            </Pressable>
          </Link>

          <Link href="/partners-upload-data" asChild>
            <Pressable style={styles.secondaryButton}>
              <ThemedText style={styles.secondaryButtonText}>
                Last opp treningsdata
              </ThemedText>
            </Pressable>
          </Link>
        </View>
      </ThemedView>

      {/* Seksjon: samarbeid / pilot */}
      <ThemedView style={styles.card}>
        <ThemedText style={styles.sectionTitle}>
          Pilot og tidlig samarbeid
        </ThemedText>
        <ThemedText style={styles.cardText}>
          LYXvision er i en tidlig fase. Vi ønsker å samarbeide med et lite antall
          produsenter som vil være med å forme hvordan AI-analyse av coating skal se
          ut – både for proffmarkedet og for forbruker (CoatVision Wash).
        </ThemedText>
      </ThemedView>

      {/* CTA / kontakt */}
      <ThemedView style={styles.card}>
        <ThemedText style={styles.sectionTitle}>
          Interessert i å bli partner?
        </ThemedText>
        <ThemedText style={styles.cardText}>
          Ta kontakt for en prat om pilot, datainnsamling og hvordan dine produkter
          kan vises inne i LYXvision.
        </ThemedText>

        <View style={styles.actions}>
          <Pressable style={styles.primaryButton}>
            <ThemedText style={styles.primaryButtonText}>
              Kontakt oss om produsentportal
            </ThemedText>
          </Pressable>

          <Link href="/" asChild>
            <Pressable style={styles.secondaryButton}>
              <ThemedText style={styles.secondaryButtonText}>
                Tilbake til hovedside
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
    backgroundColor: '#020617', // mørk bakgrunn
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
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e5e7eb',
    marginBottom: 6,
  },
  cardText: {
    fontSize: 12,
    color: '#d1d5db',
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e5e7eb',
    marginBottom: 8,
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
