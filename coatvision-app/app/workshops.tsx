import { Link } from 'expo-router';
import { ScrollView, StyleSheet, View, Pressable } from 'react-native';

import { ThemedText, ThemedView } from '@/components/Themed';

export default function WorkshopsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          For verksteder & detailere
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          LYXvision / CoatVision hjelper deg å se lakken slik du aldri har sett den
          før – og dokumentere jobben på en måte kunden faktisk forstår.
        </ThemedText>
      </View>

      {/* Intro */}
      <ThemedView style={styles.card}>
        <ThemedText style={styles.sectionTitle}>
          Hva får verkstedet ut av LYXvision?
        </ThemedText>
        <ThemedText style={styles.cardText}>
          Systemet er bygget for hverdagen i bilpleie og detailing – ikke for
          datasentre. Det gir deg raskere vurdering av tilstand, bedre kontroll på
          coating-dekning og visuell dokumentasjon som både kunde og forsikring
          forstår.
        </ThemedText>
      </ThemedView>

      {/* Fordeler */}
      <ThemedView style={styles.card}>
        <ThemedText style={styles.sectionTitle}>
          Nøkkelfordeler i arbeidshverdagen
        </ThemedText>

        <View style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <ThemedText style={styles.bulletText}>
            Se coating-dekning og oversette områder før kunden gjør det.
          </ThemedText>
        </View>

        <View style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <ThemedText style={styles.bulletText}>
            Få hjelp til å velge riktig prosess: vask, korrigering, ettstegs eller
            full pakke.
          </ThemedText>
        </View>

        <View style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <ThemedText style={styles.bulletText}>
            Dokumenter hele jobben med før/etter-bilder og enkel rapport til kunden.
          </ThemedText>
        </View>

        <View style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <ThemedText style={styles.bulletText}>
            Reduser tiden brukt på vurdering og usikkerhet – bruk mer tid på faktisk
            arbeid.
          </ThemedText>
        </View>
      </ThemedView>

      {/* Snarveier for verksteder */}
      <ThemedView style={styles.card}>
        <ThemedText style={styles.sectionTitle}>
          Hvordan vil du starte?
        </ThemedText>
        <ThemedText style={styles.cardText}>
          Du kan enten bli med som pilotverksted, eller bare se hvordan LYXvision
          settes opp og brukes i en vanlig arbeidsdag før du bestemmer deg.
        </ThemedText>

        <View style={styles.actions}>
          <Link href="/workshops-pilot" asChild>
            <Pressable style={styles.primaryButton}>
              <ThemedText style={styles.primaryButtonText}>
                Bli pilotverksted
              </ThemedText>
            </Pressable>
          </Link>

          <Link href="/workshops-setup" asChild>
            <Pressable style={styles.secondaryButton}>
              <ThemedText style={styles.secondaryButtonText}>
                Se oppsett & bruk i verksted
              </ThemedText>
            </Pressable>
          </Link>
        </View>
      </ThemedView>

      {/* Kontakt / CTA */}
      <ThemedView style={styles.card}>
        <ThemedText style={styles.sectionTitle}>
          Klar for en prat?
        </ThemedText>
        <ThemedText style={styles.cardText}>
          Vi ser etter noen få verksteder som vil være tidlige på LYXvision. Du
          trenger ikke være “størst i byen” – det viktigste er at du bryr deg om
          kvalitet og har lyst til å teste noe nytt.
        </ThemedText>

        <View style={styles.actions}>
          <Pressable style={styles.primaryButton}>
            <ThemedText style={styles.primaryButtonText}>
              Kontakt oss om verkstedpilot
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
