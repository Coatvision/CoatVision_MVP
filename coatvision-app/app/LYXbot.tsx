// app/lyxbot.tsx
import React, { useState } from "react";
import { View, TextInput, Pressable, StyleSheet, FlatList } from "react-native";
import { ThemedText, ThemedView } from "@/components/Themed";
import { API_BASE_URL } from "./config"; // bruker app/config.ts
import { lyxbotCommand } from "./api";
import LyxbotIntro from "@/components/coatvision-app/LyxbotIntro";


type ChatMessage = {
  id: string;
  from: "user" | "bot";
  text: string;
};

export default function LyxbotScreen() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    // legg til bruker-melding i loggen
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      from: "user",
      text: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const json = await lyxbotCommand(trimmed);
      console.log("LYXbot response:", json);
      const botText = (json.response as string) || (json.message as string) || JSON.stringify(json);

      const botMsg: ChatMessage = {
        id: Date.now().toString() + "-bot",
        from: "bot",
        text: botText,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Feil mot AI:", err);
      const errMsg: ChatMessage = {
        id: Date.now().toString() + "-err",
        from: "bot",
        text: "Kunne ikke kontakte LYXbot. Sjekk at serveren kjører og at IP-adressen stemmer.",
      };
      setMessages((prev) => [...prev, errMsg]);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        LYXbot – bilpleie-assistent
      </ThemedText>

      {/* intro-bolk på toppen */}
      <LyxbotIntro />

      {/* chat-logg */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={{ paddingVertical: 8 }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.from === "user" ? styles.bubbleUser : styles.bubbleBot,
            ]}
          >
            <ThemedText style={styles.bubbleText}>{item.text}</ThemedText>
          </View>
        )}
      />

      {/* input-rad */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Spør om vask, polering, coating ..."
          value={input}
          onChangeText={setInput}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
        <Pressable style={styles.sendButton} onPress={sendMessage}>
          <ThemedText style={styles.sendButtonText}>Send</ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  title: {
    marginBottom: 4,
  },
  list: {
    flex: 1,
  },
  bubble: {
    padding: 8,
    borderRadius: 12,
    marginVertical: 4,
    maxWidth: "80%",
  },
  bubbleUser: {
    alignSelf: "flex-end",
    backgroundColor: "#22c55e33",
  },
  bubbleBot: {
    alignSelf: "flex-start",
    backgroundColor: "#1f2937",
  },
  bubbleText: {
    fontSize: 13,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  input: {
    flex: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#4b5563",
    color: "#e5e7eb",
  },
  sendButton: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#22c55e",
  },
  sendButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#022c22",
  },
});
