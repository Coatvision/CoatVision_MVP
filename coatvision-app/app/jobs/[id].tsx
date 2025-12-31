import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ThemedText, ThemedView } from '@/components/Themed';
import { getJob, getPanelsForJob } from '@/src/config/storage/jobs';
import { computeCVI, computeCQI, estimatePrice } from '@/src/core/formulas';

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [job, setJob] = useState<any | null>(null);
  const [panels, setPanels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const j = await getJob(id);
      const p = await getPanelsForJob(id);
      setJob(j);
      setPanels(p);
      setLoading(false);
    })();
  }, [id]);

  const aggregates = useMemo(() => {
    if (!panels.length) return { avgCVI: null, avgCQI: null };
    const avgCVI = panels.reduce((a, p) => a + (p.cvi || 0), 0) / panels.length;
    const avgCQI = panels.reduce((a, p) => a + (p.cqi || 0), 0) / panels.length;
    return { avgCVI, avgCQI };
  }, [panels]);

  const price = useMemo(() => {
    if (!job) return null;
    return estimatePrice({
      dc: job.final_dc ?? job.initial_dc ?? 0.5,
      dirtLevel: 'medium',
      procedure: job.package || 'Standard',
      timeMinutes: job.estimated_time_minutes || 180,
      laborRate: 900,
    });
  }, [job]);

  if (loading) return <ThemedText>Laster jobb...</ThemedText>;
  if (!job) return <ThemedText>Fant ikke jobb.</ThemedText>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedView style={styles.card}>
        <ThemedText style={styles.title}>Jobb {job.id}</ThemedText>
        <ThemedText>Pakke: {job.package || '–'}</ThemedText>
        <ThemedText>Status: {job.status}</ThemedText>
        <ThemedText>DC start: {job.initial_dc ?? '–'}</ThemedText>
        <ThemedText>DC slutt: {job.final_dc ?? '–'}</ThemedText>
        <ThemedText>CQI snitt: {aggregates.avgCQI?.toFixed(2) ?? '–'}</ThemedText>
        <ThemedText>CVI snitt: {aggregates.avgCVI?.toFixed(2) ?? '–'}</ThemedText>
        {price && (
          <View style={styles.priceBox}>
            <ThemedText>Est. pris: {price.price} NOK</ThemedText>
          </View>
        )}
      </ThemedView>
      <ThemedText style={styles.subtitle}>Paneler</ThemedText>
      {panels.length === 0 && <ThemedText>Ingen paneler registrert.</ThemedText>}
      {panels.map(p => (
        <ThemedView key={p.id} style={styles.panelCard}>
          <ThemedText style={styles.panelName}>{p.name}</ThemedText>
          <ThemedText>Area: {p.area_m2 ?? '–'} m²</ThemedText>
          <ThemedText>DC init: {p.initial_dc ?? '–'}</ThemedText>
          <ThemedText>DC slutt: {p.final_dc ?? '–'}</ThemedText>
          <ThemedText>CQI: {p.cqi?.toFixed(2) ?? '–'}</ThemedText>
          <ThemedText>CVI: {p.cvi?.toFixed(2) ?? '–'}</ThemedText>
        </ThemedView>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  card: { backgroundColor: '#222', padding: 16, borderRadius: 10, gap: 6 },
  title: { fontSize: 20, fontWeight: '600' },
  subtitle: { fontSize: 18, fontWeight: '500', marginTop: 12 },
  panelCard: { backgroundColor: '#1a1a1a', padding: 12, borderRadius: 8, gap: 4 },
  panelName: { fontWeight: '600' },
  priceBox: { marginTop: 8 },
});
