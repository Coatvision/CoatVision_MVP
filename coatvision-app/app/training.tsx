import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';

import { ThemedText, ThemedView } from '@/components/Themed';

export default function TrainingScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Datasett & trening
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Her samler vi tankene rundt hvordan LYXvision skal trenes opp med ekte
          bilder fra verksteder og produsenter.
        </ThemedText>
      </View>

      {/* Kort: hvorfor datasett */}
      <ThemedView style={styles.card}>
        <ThemedText style={styles.sectionTitle}>
          Hvorfor egen treningsmodul?
        </ThemedText>
        <ThemedText style={styles.cardText}>
          Hvert verksted og hver produsent har litt ulike produkter, rutiner og
          lysforhold. Ved å bygge datasett per partner kan CoatVision lære akkurat
          din måte å jobbe på – i stedet for en generell “one size fits all”.
        </ThemedText>
      </ThemedView>

      {/* Kort: fotoprotokoll */}
      <ThemedView style={styles.card}>
        <ThemedText style={styles.sectionTitle}>
          Anbefalt fotoprotokoll
        </ThemedText>

        <View style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <ThemedText style={styles.bulletText}>
            Jevnt og forutsigbart lys (unngå ekstreme skygger og direkte sol).
          </ThemedText>
        </View>

        <View style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <ThemedText style={styles.bulletText}>
            Fast vinkel (ca. 45°) og avstand – marker gjerne en plass på gulvet.
          </ThemedText>
        </View>

        <View style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <ThemedText style={styles.bulletText}>
            Sekvenser: før coating, under påføring, etter buffing og etter herding.
          </ThemedText>
        </View>

        <View style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <ThemedText style={styles.bulletText}>
            Inkluder også “feil”: for mye produkt, high spots, hologrammer osv.
          </ThemedText>
        </View>
      </ThemedView>

      {/* Kort: struktur i datasett */}
      <ThemedView style={styles.card}>
        <ThemedText style={styles.sectionTitle}>
          Hvordan et datasett kan struktureres
        </ThemedText>

        <View style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <ThemedText style={styles.bulletText}>
            Paneltype og side (f.eks. “høyre dør foran”, “panser”, “bakskjerm venstre”).
          </ThemedText>
        </View>

        <View style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <ThemedText style={styles.bulletText}>
            Fargekode / lakk-type, hvis tilgjengelig.
          </ThemedText>
        </View>

        <View style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <ThemedText style={styles.bulletText}>
            Produktprofil (hvilken coating/primer/toppcoat som er brukt).
          </ThemedText>
        </View>

        <View style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <ThemedText style={styles.bulletText}>
            Status for bildet: før coating, etter påføring, etter buffing, etter herding.
          </ThemedText>
        </View>
      </ThemedView>

      {/* Kort: status / videreutvikling */}
      <ThemedView style={styles.card}>
        <ThemedText style={styles.sectionTitle}>
          Status i dag og veien videre
        </ThemedText>
        <ThemedText style={styles.cardText}>
          I denne prototypen beskriver vi strukturen og arbeidsmåten, men har ikke
          koblet på faktisk opplasting og modelltrening ennå. Når produsentportal
          og verkstedpiloter er klare, blir denne modulen “motoren” under panseret.
        </ThemedText>
      </ThemedView>

      {/* Navigasjon */}
      <ThemedView style={styles.card}>
        <ThemedText style={styles.sectionTitle}>
          Navigasjon
        </ThemedText>

        <View style={styles.actions}>
          <Link href="/partners" asChild>
            <Pressable style={styles.primaryButton}>
              <ThemedText style={styles.primaryButtonText}>
                Gå til produsentportal
              </ThemedText>
            </Pressable>
          </Link>

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
    marginTop: 4,
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
