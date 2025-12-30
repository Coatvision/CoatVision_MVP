// components/LyxbotIntro.tsx
import { StyleSheet, View } from "react-native";
import { ThemedText, ThemedView } from "@/components/Themed";

export default function LyxbotIntro() {
  return (
    <ThemedView style={styles.card}>
      <ThemedText type="title">LYXbot – detailerens beste venn</ThemedText>

      <ThemedText style={styles.lead}>
        LYXbot er en AI-assistent som er spesialisert på bilpleie og detailing –
        ikke alt mulig annet. Den er trent for din hverdag i hallen: paneler,
        polering, coating, vedlikehold og kundedialog.
      </ThemedText>

      <ThemedText style={styles.paragraph}>
        I stedet for å scrolle gjennom forum og chattegrupper hver gang du
        lurer på noe, kan du spørre LYXbot – direkte i appen. Den hjelper deg å
        velge riktig poleringssteg, produkter, puter, herdetid og rutiner, og
        kan foreslå hvordan du forklarer jobben til kunden på en enkel og
        profesjonell måte.
      </ThemedText>

      <View style={styles.bulletList}>
        <View style={styles.bulletItem}>
          <ThemedText style={styles.bulletTitle}>
            Alltid tilgjengelig
          </ThemedText>
          <ThemedText style={styles.bulletText}>
            Perfekt for deg som ofte jobber alene – LYXbot er kollegaen som
            alltid har tid til et spørsmål.
          </ThemedText>
        </View>

        <View style={styles.bulletItem}>
          <ThemedText style={styles.bulletTitle}>
            Praktiske svar – ikke teori
          </ThemedText>
          <ThemedText style={styles.bulletText}>
            Få konkrete forslag til steg, produkter og teknikk basert på
            situasjonen du beskriver – ikke bare generelle tips.
          </ThemedText>
        </View>

        <View style={styles.bulletItem}>
          <ThemedText style={styles.bulletTitle}>
            Fokus på lønnsomhet
          </ThemedText>
          <ThemedText style={styles.bulletText}>
            Bruk LYXbot til å planlegge pakkene dine, argumenter mot kunden og
            lage rapporter som viser verdien av jobben du gjør.
          </ThemedText>
        </View>
      </View>

      <ThemedText style={styles.paragraph}>
        Målet er at LYXbot skal føles som en erfaren detailer du kan spørre om
        alt – fra «hvilken kombo skal jeg teste nå?» til «hvordan forklarer jeg
        denne jobben for kunden?». For mange små verksteder blir dette den
        ekstra personen på laget – uten at du trenger å ansette noen.
      </ThemedText>

      <ThemedText style={styles.highlight}>
        Kort sagt: hvis du driver alene, eller bare vil ha en ekstra trygghet i
        hverdagen – LYXbot er laget for deg. Prøv den på neste bil, og se hvor
        mye enklere det føles å ta gode valg underveis.
      </ThemedText>

      <ThemedText style={styles.footerNote}>
        LYXbot utvikles videre sammen med detailere og produsenter – hver
        samtale gjør assistenten litt smartere og mer tilpasset bransjen vår.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  lead: {
    marginTop: 8,
    marginBottom: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  paragraph: {
    marginBottom: 12,
    fontSize: 13,
    lineHeight: 20,
  },
  bulletList: {
    marginVertical: 8,
    gap: 12,
  },
  bulletItem: {
    borderLeftWidth: 2,
    paddingLeft: 10,
  },
  bulletTitle: {
    fontWeight: "600",
    marginBottom: 2,
  },
  bulletText: {
    fontSize: 13,
    lineHeight: 18,
  },
  highlight: {
    marginTop: 4,
    marginBottom: 8,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
  },
  footerNote: {
    fontSize: 12,
    opacity: 0.8,
    marginTop: 4,
  },
});
