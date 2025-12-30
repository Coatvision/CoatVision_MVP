import { useEffect, useState } from 'react';
import { ScrollView, Pressable, StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';
import { ThemedText, ThemedView } from '@/components/Themed';
import { listJobs, addJob, addPanel } from '@/src/config/storage/jobs';

export default function JobsScreen() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await listJobs();
      setJobs(data);
      setLoading(false);
    })();
  }, []);

  async function handleCreateDemo() {
    const job = await addJob({ status: 'in_progress', package: 'Standard', initial_dc: 0.65, estimated_time_minutes: 240 });
    // Legg til noen paneler med demo-verdier
    await addPanel(job.id, { name: 'hood', area_m2: 1.4, initial_dc: 0.6, final_dc: 0.4, cqi: 0.72, cvi: 0.70 });
    await addPanel(job.id, { name: 'left_front_door', area_m2: 1.2, initial_dc: 0.55, final_dc: 0.35, cqi: 0.75, cvi: 0.72 });
    const data = await listJobs();
    setJobs(data);
  }

  if (loading) return <ThemedText>Laster jobber...</ThemedText>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <ThemedText style={styles.title}>Jobber</ThemedText>
        <Pressable style={styles.createBtn} onPress={handleCreateDemo}>
          <ThemedText style={styles.createBtnText}>+ Demo-jobb</ThemedText>
        </Pressable>
      </View>
      {jobs.length === 0 && <ThemedText>Ingen jobber enda.</ThemedText>}
      {jobs.map(j => (
        <Link key={j.id} href={`/jobs/${j.id}` as any} asChild>
          <Pressable style={styles.card}>
            <ThemedText style={styles.cardTitle}>Jobb {j.id}</ThemedText>
            <ThemedText>{j.package || 'Uten pakke'}</ThemedText>
            <ThemedText>Status: {j.status}</ThemedText>
          </Pressable>
        </Link>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 8 },
  card: { backgroundColor: '#222', padding: 12, borderRadius: 8 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  createBtn: { backgroundColor: '#1e5f2b', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  createBtnText: { fontWeight: '600' },
  cardTitle: { fontSize: 16, fontWeight: '500' },
});
