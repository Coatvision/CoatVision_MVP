import { useEffect, useState } from 'react';
import {
  Alert,
  TextInput,
  Pressable,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText, ThemedView } from '@/components/Themed';
import { supabase } from '@/lib/supabaseClient';

export default function ProfileScreen() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);

  // 1) Hent innlogget bruker + profil
  useEffect(() => {
    const loadProfile = async () => {
      setLoadingProfile(true);

      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData.user) {
        console.error('No user, redirecting to /login', userError);
        router.replace('/login');
        return;
      }

      const user = userData.user;

      // Hent profil med samme id som auth-bruker
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Load profile error', error);
        Alert.alert('Feil', 'Klarte ikke å hente profilen din.');
      } else if (!data) {
        // Ingen rad ennå → lag en tom
        const { error: insertError } = await supabase.from('profiles').insert({
          id: user.id,
          full_name: '',
          phone: '',
        });
        if (insertError) {
          console.error('Insert empty profile error', insertError);
        }
      } else {
        setFullName(data.full_name ?? '');
        setPhone(data.phone ?? '');
      }

      setLoadingProfile(false);
    };

    loadProfile();
  }, [router]);

  // 2) Lagre profil (update)
  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Navn mangler', 'Skriv inn fullt navn før du lagrer.');
      return;
    }

    try {
      setSaving(true);

      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        router.replace('/login');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          phone: phone.trim(),
        })
        .eq('id', user.id);

      if (error) {
        console.error('Update profile error', error);
        Alert.alert('Feil ved lagring', error.message);
      } else {
        Alert.alert('Lagret', 'Profilen din er oppdatert.', [
          { text: 'Gå til analyse', onPress: () => router.replace('/analyze') },
          { text: 'OK' },
        ]);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loadingProfile) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator />
        <ThemedText style={styles.infoText}>Laster profilen din…</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Profil
      </ThemedText>
      <ThemedText style={styles.infoText}>
        Fyll inn navn og telefonnummer. Dette lagres i Supabase-tabellen
        <ThemedText style={{ fontWeight: 'bold' }}> profiles</ThemedText>.
      </ThemedText>

      <TextInput
        style={styles.input}
        placeholder="Fullt navn"
        placeholderTextColor="#6b7280"
        value={fullName}
        onChangeText={setFullName}
      />

      <TextInput
        style={styles.input}
        placeholder="Telefonnummer"
        placeholderTextColor="#6b7280"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <View style={styles.buttonRow}>
        <Pressable
          style={[styles.button, styles.primaryButton]}
          onPress={handleSave}
          disabled={saving}
        >
          <ThemedText style={styles.buttonText}>
            {saving ? 'Lagrer…' : 'Lagre profil'}
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  infoText: {
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    color: '#e5e7eb',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#22c55e',
  },
  buttonText: {
    fontWeight: '600',
    color: '#e5e7eb',
  },
});
