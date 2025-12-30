// components/LyxbotIntro.tsx
import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText, ThemedView } from "@/components/Themed";

export default function LyxbotIntro() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.heading}>
        LYXbot – din digitale bilpleiestrateg
      </ThemedText>
      <ThemedText style={styles.body}>
        LYXbot hjelper deg å velge riktig vask, polering og coating basert på
        biltype, lakktype og ønsket finish. Still spørsmål om produkter,
        fremgangsmåte eller pris – og få klare anbefalinger, steg for steg.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  heading: {
    marginBottom: 4,
  },
  body: {
    fontSize: 13,
    lineHeight: 18,
  },
});
