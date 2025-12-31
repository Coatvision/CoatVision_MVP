// components/coatvision/LoadingCard.tsx
import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';

interface LoadingCardProps {
  mode: 'image' | 'live';
}

export function LoadingCard({ mode }: LoadingCardProps) {
  const text =
    mode === 'image'
      ? 'Analyserer bildet – ser etter dekning, high spots og avvik…'
      : 'Analyserer panel – ser etter dekning, high spots og avvik…';

  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" color="#22c55e" />
      <ThemedText style={styles.text}>{text}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(15,23,42,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.4)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  text: {
    fontSize: 13,
    flex: 1,
  },
});
