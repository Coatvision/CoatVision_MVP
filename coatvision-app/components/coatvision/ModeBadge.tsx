// components/coatvision/ModeBadge.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { FLAGS } from '@/src/config/flags';

export function ModeBadge() {
  const isRemote = FLAGS.coatVision?.useRemoteApi === true;
  const hasApiUrl = !!FLAGS.coatVision?.apiBaseUrl;
  
  const label = isRemote && hasApiUrl
    ? 'Remote API (automatisk fallback til demo)'
    : 'Demo-modus';
  
  const color = isRemote && hasApiUrl ? '#22c55e' : '#f97316';

  return (
    <View style={[styles.container, { borderColor: color }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <ThemedText style={styles.text}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: 'rgba(15,23,42,0.9)',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    marginRight: 8,
  },
  text: {
    fontSize: 11,
    opacity: 0.9,
  },
});
