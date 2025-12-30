// components/coatvision/ResultCard.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import type { CoatVisionResult } from '@/src/config/api/coatvision';

interface ResultCardProps {
  result: CoatVisionResult;
}

export function ResultCard({ result }: ResultCardProps) {
  const coverage = result.coverage ?? 0;
  const coverageColor = getCoverageColor(coverage);
  const coverageLabel = getCoverageLabel(coverage);

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Analyse-resultat</ThemedText>

      {/* Coverage Badge */}
      <View style={styles.coverageRow}>
        <View style={[styles.coverageBubble, { borderColor: coverageColor }]}>
          <ThemedText style={[styles.coverageValue, { color: coverageColor }]}>
            {Math.round(coverage)}%
          </ThemedText>
          <ThemedText style={styles.coverageLabel}>{coverageLabel}</ThemedText>
        </View>
      </View>

      {/* Warnings */}
      {result.warnings && result.warnings.length > 0 && (
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>⚠️ Advarsler</ThemedText>
          <View style={styles.badgeRow}>
            {result.warnings.map((w, idx) => (
              <View key={`${w}-${idx}`} style={styles.warningBadge}>
                <ThemedText style={styles.warningText}>{w}</ThemedText>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Missing Areas */}
      {result.missingAreas && result.missingAreas.length > 0 && (
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>🔍 Kritiske områder</ThemedText>
          {result.missingAreas.map((area, idx) => (
            <View key={`${area}-${idx}`} style={styles.listItem}>
              <ThemedText style={styles.listBullet}>•</ThemedText>
              <ThemedText style={styles.listText}>{area}</ThemedText>
            </View>
          ))}
        </View>
      )}

      {/* Notes */}
      {result.notes && (
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>📝 Kommentar</ThemedText>
          <ThemedText style={styles.notesText}>{result.notes}</ThemedText>
        </View>
      )}
    </View>
  );
}

function getCoverageColor(coverage: number): string {
  if (coverage >= 90) return '#22c55e'; // grønn
  if (coverage >= 70) return '#eab308'; // gul
  return '#ef4444'; // rød
}

function getCoverageLabel(coverage: number): string {
  if (coverage >= 90) return 'Meget god dekning';
  if (coverage >= 70) return 'OK, sjekk markerte områder';
  return 'Lav dekning – krever oppfølging';
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(15,23,42,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.4)',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  coverageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  coverageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 2,
    backgroundColor: 'rgba(15,23,42,0.9)',
  },
  coverageValue: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  coverageLabel: {
    fontSize: 11,
    marginTop: 2,
    opacity: 0.9,
    textAlign: 'center',
  },
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  warningBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(239,68,68,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.5)',
  },
  warningText: {
    fontSize: 12,
    color: '#fca5a5',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  listBullet: {
    width: 16,
    fontSize: 14,
  },
  listText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  notesText: {
    fontSize: 13,
    lineHeight: 20,
    opacity: 0.95,
  },
});
