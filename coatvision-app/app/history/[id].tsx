import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText, ThemedView } from '@/components/Themed';
import {
  getHistoryEntryById,
  type HistoryEntry,
} from '@/src/config/storage/history';

export default function HistoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();

  const [entry, setEntry] = useState<HistoryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      if (!id || Array.isArray(id)) {
        setIsLoading(false);
        return;
      }
      const found = await getHistoryEntryById(id);
      setEntry(found);
      setIsLoading(false);
    };
    run();
  }, [id]);

  const formattedTimestamp = useMemo(() => {
    if (!entry) return '';
    const d = new Date(entry.timestamp);
    return d.toLocaleString();
  }, [entry]);

  const reportText = useMemo(() => {
    if (!entry) return '';
    const modeLabel = entry.mode === 'image' ? 'Bildeanalyse' : 'Live-skanning';

    const missing =
      entry.result.missingAreas && entry.result.missingAreas.length === 0
        ? 'Ingen spesifikke mangler ble markert i denne demo-analysen.'
        : (entry.result.missingAreas || []).map((m) => `- ${m}`).join('\n');

    const warnings =
      entry.result.warnings.length === 0
        ? 'Ingen spesielle varsler registrert.'
        : entry.result.warnings.map((w) => `- ${w}`).join('\n');

    return [
      `CoatVision-rapport`,
      ``,
      `Type: ${modeLabel}`,
      `Tidspunkt: ${formattedTimestamp}`,
      ``,
      `Anslått dekning: ${entry.result.coverage} %`,
      ``,
      `Mulige mangler:`,
      `${missing}`,
      ``,
      `Varsler:`,
      `${warnings}`,
      ``,
      `Notat:`,
      `${entry.result.notes}`,
      ``,
      `Merk: Dette er en demo-rapport fra en prototypeversjon av LYXvision / CoatVision.`,
    ].join('\n');
  }, [entry, formattedTimestamp]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.loadingText}>
          Leser analyse...
        </ThemedText>
      </View>
    );
  }

  if (!entry) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedView style={styles.card}>
          <ThemedText style={styles.title}>
            Fant ikke analysen
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Det ser ut som denne historikk-linjen ikke finnes lenger. Den kan ha
            blitt slettet hvis du har tømt historikken.
          </ThemedText>

          <View style={styles.navRow}>
            <Link href="/history" asChild>
              <Pressable style={styles.navButton}>
                <ThemedText style={styles.navButtonText}>
                  Til historikk
                </ThemedText>
              </Pressable>
            </Link>

            <Link href="/" asChild>
              <Pressable style={styles.navButtonSecondary}>
                <ThemedText style={styles.navButtonSecondaryText}>
                  Til hovedside
                </ThemedText>
              </Pressable>
            </Link>
          </View>
        </ThemedView>
      </ScrollView>
    );
  }

  const modeLabel =
    entry.mode === 'image' ? 'Bildeanalyse' : 'Live-skanning';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Detaljer for analyse
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          {modeLabel} · {formattedTimestamp}
        </ThemedText>
      </View>

      {/* Kort: grunninfo */}
      <ThemedView style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View>
            <ThemedText style={styles.entryTitle}>
              {modeLabel}
            </ThemedText>
            <ThemedText style={styles.entryMeta}>
              Kilde:{' '}
              {entry.source === 'analyze-screen'
                ? 'Skjerm for bildeanalyse (/analyze)'
                : 'Live-modus (/live)'}
            </ThemedText>
            <ThemedText style={styles.entryMeta}>
              Tidspunkt: {formattedTimestamp}
            </ThemedText>
          </View>
          <ThemedText
            style={[
              styles.badge,
              entry.mode === 'image'
                ? styles.badgeImage
                : styles.badgeLive,
            ]}
          >
            {entry.mode === 'image' ? 'Bilde' : 'Live'}
          </ThemedText>
        </View>

        <View style={styles.resultRow}>
          <View>
            <ThemedText style={styles.resultLabel}>
              Anslått dekning
            </ThemedText>
            <ThemedText style={styles.resultValue}>
              {entry.result.coverage} %
            </ThemedText>
          </View>
        </View>
      </ThemedView>

      {/* Bilde (hvis tilgjengelig) */}
      {entry.imageUri && (
        <ThemedView style={styles.card}>
          <ThemedText style={styles.sectionTitle}>
            Bilde fra analysen
          </ThemedText>
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: entry.imageUri }}
              style={styles.image}
              contentFit="cover"
            />
          </View>
          <ThemedText style={styles.imageHint}>
            Hint: På sikt kan det legges på varme-/markeringsoverlegg oppå dette bildet.
          </ThemedText>
        </ThemedView>
      )}

      {/* Detaljer: mangler, varsler, notat */}
      <ThemedView style={styles.card}>
        <ThemedText style={styles.sectionTitle}>
          Detaljer fra analysen
        </ThemedText>

        <ThemedText style={styles.resultLabel}>
          Mulige mangler
        </ThemedText>
        {entry.result.missingAreas.length === 0 ? (
          <ThemedText style={styles.resultItem}>
            • Ingen spesifikke mangler markert i denne demoen.
          </ThemedText>
        ) : (
          entry.result.missingAreas.map((m, idx) => (
            <ThemedText key={idx} style={styles.resultItem}>
              • {m}
            </ThemedText>
          ))
        )}

        <ThemedText style={styles.resultLabel}>
          Varsler
        </ThemedText>
        {entry.result.warnings.length === 0 ? (
          <ThemedText style={styles.resultItem}>
            • Ingen spesielle varsler i denne demo-analysen.
          </ThemedText>
        ) : (
          entry.result.warnings.map((w, idx) => (
            <ThemedText key={idx} style={styles.resultItem}>
              • {w}
            </ThemedText>
          ))
        )}

        <ThemedText style={styles.resultLabel}>
          Notat
        </ThemedText>
        <ThemedText style={styles.resultNote}>
          {entry.result.notes}
        </ThemedText>
      </ThemedView>

      {/* Rapporttekst – klar til å kopieres */}
      <ThemedView style={styles.card}>
        <ThemedText style={styles.sectionTitle}>
          Rapporttekst (kan kopieres til e-post/rapport)
        </ThemedText>
        <View style={styles.reportBox}>
          <ThemedText style={styles.reportText}>{reportText}</ThemedText>
        </View>
        <ThemedText style={styles.reportHint}>
          Du kan markere denne teksten og kopiere den inn i e-post, SMS eller et
          eget rapportdokument.
        </ThemedText>
      </ThemedView>

      {/* Navigasjon */}
      <ThemedView style={styles.card}>
        <ThemedText style={styles.sectionTitle}>
          Navigasjon
        </ThemedText>

        <View style={styles.navRow}>
          <Link href="/history" asChild>
            <Pressable style={styles.navButton}>
              <ThemedText style={styles.navButtonText}>
                Til historikk
              </ThemedText>
            </Pressable>
          </Link>

          <Link href="/" asChild>
            <Pressable style={styles.navButtonSecondary}>
              <ThemedText style={styles.navButtonSecondaryText}>
                Til hovedside
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

  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e5e7eb',
  },
  entryMeta: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  badge: {
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeImage: {
    backgroundColor: 'rgba(59,130,246,0.15)',
    color: '#bfdbfe',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.5)',
  },
  badgeLive: {
    backgroundColor: 'rgba(34,197,94,0.15)',
    color: '#bbf7d0',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.5)',
  },

  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e5e7eb',
    marginTop: 10,
    marginBottom: 6,
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#e5e7eb',
    marginTop: 6,
  },
  resultValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#22c55e',
  },
  resultItem: {
    fontSize: 12,
    color: '#d1d5db',
  },
  resultNote: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },

  imageWrapper: {
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#0f172a',
  },
  image: {
    width: '100%',
    height: 220,
  },
  imageHint: {
    marginTop: 6,
    fontSize: 11,
    color: '#9ca3af',
  },

  reportBox: {
    marginTop: 6,
    borderRadius: 12,
    padding: 10,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  reportText: {
    fontSize: 11,
    color: '#e5e7eb',
    fontFamily: undefined,
  },
  reportHint: {
    marginTop: 6,
    fontSize: 11,
    color: '#9ca3af',
  },

  navRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
  navButton: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#22c55e',
  },
  navButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#022c22',
  },
  navButtonSecondary: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#374151',
  },
  navButtonSecondaryText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#e5e7eb',
  },

  loadingText: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center' as const,
    color: '#e5e7eb',
    fontSize: 13,
  },
});
