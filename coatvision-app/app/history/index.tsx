import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";

import { ThemedText, ThemedView } from "@/components/Themed";
import { supabase } from "@/lib/supabaseClient";

type HistoryRow = {
  id: string;
  user_id: string;
  original_filename: string | null;
  result_filename: string | null;
  edge_coverage_ratio: number | null;
  note: string | null;
  created_at: string;
};

export default function HistoryScreen() {
  const router = useRouter();
  const [items, setItems] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Sørg for at bruker er innlogget og last historikk
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/login");
        return;
      }
      await loadHistory();
    };

    init();
  }, [router]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("analysis_history")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load history", error);
        return;
      }

      setItems((data ?? []) as HistoryRow[]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: HistoryRow }) => (
    <ThemedView style={styles.card}>
      <ThemedText type="subtitle">
        {new Date(item.created_at).toLocaleString()}
      </ThemedText>

      <ThemedText>
        Original: {item.original_filename ?? "ukjent fil"}
      </ThemedText>

      {item.edge_coverage_ratio != null && (
        <ThemedText>
          Kantdekning (dummy):{" "}
          {Math.round(item.edge_coverage_ratio * 100)} %
        </ThemedText>
      )}

      {item.note && <ThemedText>{item.note}</ThemedText>}

      {item.result_filename && (
        <ThemedText style={styles.smallText}>
          Output-fil: {item.result_filename}
        </ThemedText>
      )}
    </ThemedView>
  );

  if (loading && items.length === 0) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator />
        <ThemedText style={{ marginTop: 12 }}>
          Laster historikk…
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Historikk
      </ThemedText>

      {items.length === 0 ? (
        <ThemedText>Ingen analyser lagret ennå.</ThemedText>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ gap: 12, paddingBottom: 32 }}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
  },
  smallText: {
    marginTop: 4,
    opacity: 0.7,
  },
});
