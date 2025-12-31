import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{ title: 'LYXvision' }}
      />
      <Tabs.Screen
        name="analyze"
        options={{ title: 'Analyser' }}
      />
      <Tabs.Screen
        name="explore"
        options={{ title: 'Utforsk' }}
      />
      <Tabs.Screen
        name="history"
        options={{ title: 'Historikk' }}
      />
      <Tabs.Screen
        name="lyxbot"
        options={{ title: 'LYXbot' }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profil' }}
      />
    </Tabs>
  );
}
