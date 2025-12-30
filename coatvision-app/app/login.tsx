import { useState } from 'react';
import { Alert, TextInput, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText, ThemedView } from '@/components/Themed';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email && !phone) {
      Alert.alert('Mangler info', 'Skriv inn e-post eller telefon.');
      return;
    }
    try {
      setLoading(true);
      const body: any = {};
      if (email) body.email = email;
      if (phone) body.phone = phone;
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || 'Login feilet');
      await globalThis.localStorage?.setItem('token', data.access_token);
      Alert.alert('Innlogget', `Bruker ${data.user_id}`);
      router.replace('/profile');
    } catch (e: any) {
      Alert.alert('Feil', e.message || 'Login feilet');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Logg inn til LYXvision
      </ThemedText>

      <TextInput
        style={styles.input}
        placeholder="E-post"
        placeholderTextColor="#6b7280"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Telefon"
        placeholderTextColor="#6b7280"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <View style={styles.buttonRow}>
        <Pressable
          style={[styles.button, styles.primaryButton]}
          onPress={handleLogin}
          disabled={loading}
        >
          <ThemedText style={styles.buttonText}>Logg inn</ThemedText>
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
    marginBottom: 24,
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
