import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText, ThemedView } from '@/components/Themed';

type Message = {
  id: string;
  from: 'user' | 'bot';
  text: string;
};

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function LyxbotScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      from: 'bot',
      text:
        'Hei! Jeg er LYXbot – en vennlig assistent for bil, bilpleie og detailing. ' +
        'Spør meg om vask, polering, coating, interiør, vedlikehold, eller bare en bilpleie-vits. 🚗✨',
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const userMsg: Message = {
      id: createId(),
      from: 'user',
      text: trimmed,
    };

    setInput('');
    setMessages(prev => [...prev, userMsg]);
    setSending(true);

    try {
      const replyText = buildDummyReply(trimmed);
      const botMsg: Message = {
        id: createId(),
        from: 'bot',
        text: replyText,
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setSending(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          LYXbot
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          her han du spørre om alt du lurer på innen detailing, bilpleie og coatingsS.{' '}
          {'\n'}
          LYXbot er en «detailers beste venn» – men holder seg til bil og bilpleie.
        </ThemedText>

        <ThemedView style={styles.chatCard}>
          <ScrollView
            style={styles.messagesScroll}
            contentContainerStyle={styles.messagesContent}
          >
            {messages.map(msg => (
              <View
                key={msg.id}
                style={[
                  styles.messageRow,
                  msg.from === 'user' ? styles.messageRowUser : styles.messageRowBot,
                ]}
              >
                <ThemedView
                  style={[
                    styles.messageBubble,
                    msg.from === 'user'
                      ? styles.messageBubbleUser
                      : styles.messageBubbleBot,
                  ]}
                >
                  <ThemedText style={styles.messageText}>{msg.text}</ThemedText>
                </ThemedView>
              </View>
            ))}
          </ScrollView>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Spør om vask, polish, coating, produkter ..."
              placeholderTextColor="#6b7280"
              value={input}
              onChangeText={setInput}
              multiline
            />
            <Pressable
              style={[
                styles.sendButton,
                (!input.trim() || sending) && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!input.trim() || sending}
            >
              <ThemedText style={styles.sendButtonText}>
                {sending ? '...' : 'Send'}
              </ThemedText>
            </Pressable>
          </View>

          <ThemedText style={styles.hintText}>
            Dette er en tidlig testversjon. Ekte AI-modell kobles til senere – alt holdes
            uansett innen temaene bil, bilpleie og detailing.
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

/**
 * Enkel «dummy-AI» for nå.
 * Vi holder oss til bil/bilpleie, og har noen spesial-svar + en generell fallback.
 */
function buildDummyReply(userText: string): string {
  const lower = userText.toLowerCase();

  if (lower.includes('vits') || lower.includes('vits?') || lower.includes('joke')) {
    return (
      'Selvsagt! Her er en bilpleie-vits:\n\n' +
      'Hvorfor liker detailere ikke dårlige bøtter?\n' +
      '— Fordi de alltid etterlater «swirl-følelser»! 😅'
    );
  }

  if (lower.includes('coating')) {
    return (
      'Coating-tips:\n' +
      '• Sørg for grundig vask, avfetting og evt. polering først.\n' +
      '• Bruk god belysning og jobb på små paneler om gangen.\n' +
      '• Tørk av innenfor anbefalt «flash time» for produktet.\n' +
      '• Etter påføring: la bilen stå tørt og uten regn i minst 12–24 timer.'
    );
  }

  if (lower.includes('vask') || lower.includes('forvask')) {
    return (
      'Vaskerutine som er trygg for lakken:\n' +
      '1️⃣ Forvask med skum eller forvaskmiddel – la kjemien jobbe.\n' +
      '2️⃣ Høytrykk, nedenfra og opp, så topp ned.\n' +
      '3️⃣ 2-bøtte-metode med god såpe og vaskehanske.\n' +
      '4️⃣ Egen bøtte/hanske til felger.\n' +
      '5️⃣ Skånsom tørk med god mikrofiber og eventuelt tørkehjelp.'
    );
  }

  if (lower.includes('polish') || lower.includes('polering') || lower.includes('riper')) {
    return (
      'Poleringstips:\n' +
      '• Start mildt: myk pute og fin polish – jobb deg opp ved behov.\n' +
      '• Test alltid en «test-spot» før du kjører hele bilen.\n' +
      '• Tørk godt av polish-rester og kontroller i sterkt lys.\n' +
      '• Husk at lakk er begrenset – målet er forbedring, ikke perfeksjon på én dag.'
    );
  }

  if (
    lower.includes('interiør') ||
    lower.includes('skinn') ||
    lower.includes('tekst')
  ) {
    return (
      'Interiør-tips:\n' +
      '• Støvsug grundig før du bruker våte produkter.\n' +
      '• På skinn: bruk skånsom rens + conditioner laget for skinn.\n' +
      '• Unngå glatte, blanke produkter på ratt og pedaler – det skal være grep.'
    );
  }

  // Fallback – generell, vennlig respons
  return (
    'Bra spørsmål! 🔧\n' +
    'Jeg er spesialisert på bil, bilpleie og detailing. ' +
    'Du kan spørre meg om vask, felgrens, polering, coating, interiør, vedlikehold, ' +
    'produktvalg, eller be om en ny bilpleie-vits. 😊'
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  title: {
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    opacity: 0.9,
    textAlign: 'center',
  },
  chatCard: {
    flex: 1,
    marginTop: 12,
    borderRadius: 20,
    padding: 12,
    gap: 8,
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 8,
    gap: 8,
  },
  messageRow: {
    flexDirection: 'row',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowBot: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  messageBubbleUser: {
    backgroundColor: '#22c55e',
  },
  messageBubbleBot: {
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#22c55e33',
  },
  messageText: {
    fontSize: 14,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#e5e7eb',
  },
  sendButton: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    fontWeight: '600',
  },
  hintText: {
    fontSize: 11,
    opacity: 0.7,
    marginTop: 4,
    textAlign: 'center',
  },
});
