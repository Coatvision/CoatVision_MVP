import { Link } from 'expo-router';
import { ScrollView, StyleSheet, View, Pressable } from 'react-native';

import { ThemedText, ThemedView } from '@/components/Themed';

export default function WorkshopsPilotScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Pilotverksted for LYXvision
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Bli blant de første verkstedene som bruker AI til å kontrollere coating og
          dokumentere jobber.
        </ThemedText>
      </View>

      {/* Hva betyr pilotverksted? */}
      <ThemedView style={styles.card}>
        <ThemedText style={styles.sectionTitle}>
          Hva betyr det å være pilotverksted?
        </ThemedText>
        <ThemedText style={styles.cardText}>
          Som pilotverksted får du tilgang til en tidlig versjon av LYXvision /
          CoatVision. Du tester det i din egen hverdag, gir tilbakemeldinger og
          påvirker hvordan verktøyet skal fungere når det lanseres bredt.
        </ThemedText>
      </ThemedView>

      {/* Fordeler */}
      <ThemedView style={styles.card}>
        <ThemedText style={styles.sectionTitle}>
          Fordeler for pilotverksted
        </ThemedText>

        <View style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <ThemedText style={styles.bulletText}>
            Tidlig tilgang til ny funksjonalitet og forbedringer.
          </ThemedText>
        </View>

        <View style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <ThemedText style={styles.bulletText}>
            Mulighet til å påvirke hvordan systemet fungerer i praksis.
          </ThemedText>
        </View>

        <View style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <ThemedText style={styles.bulletText}>
            Prioritert støtte under oppsett og testing.
          </ThemedText>
        </View>

        <View style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <ThemedText style={styles.bulletText}>
            Mulig profilering som “LYXvision Pilotverksted” når tjenesten går live.
          </ThemedText>
        </View>
      </ThemedView>

      {/* Hva forventes av deg */}
      <ThemedView style={styles.card}>
        <ThemedText style={styles.sectionTitle}>
          Hva forventes av et pilotverksted?
        </ThemedText>

        <View style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <ThemedText style={styles.bulletText}>
            At du tester LYXvision jevnlig på faktiske jobber (der det passer).
          </ThemedText>
        </View>

        <View style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <ThemedText style={styles.bulletText}>
            At du gir ærlige tilbakemeldinger på hva som funker og hva som er dritt.
          </ThemedText>
        </View>

        <View style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <ThemedText style={styles.bulletText}>
            At du kan sette av litt tid i ny og ne til korte samtaler / skjermdeling.
          </ThemedText>
        </View>
      </ThemedView>

      {/* CTA */}
      <ThemedView style={styles.card}>
        <ThemedText style={styles.sectionTitle}>
          Interessert i å bli pilotverksted?
        </ThemedText>
        <ThemedText style={styles.cardText}>
          Send gjerne en kort beskrivelse av verkstedet ditt, hvor du holder til, og
          hva slags jobber du gjør mest av. Så tar vi kontakt for å se om dere passer
          inn i neste pilotrunde.
        </ThemedText>

        <View style={styles.actions}>
          <Pressable style={styles.primaryButton}>
            <ThemedText style={styles.primaryButtonText}>
              Kontakt oss om pilot
            </ThemedText>
          </Pressable>

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
