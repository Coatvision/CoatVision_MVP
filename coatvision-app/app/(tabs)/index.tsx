import { useRouter } from "expo-router";
import {
  View,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";

import { ThemedText, ThemedView } from "@/components/Themed";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

// NB: hero-bildet ligger i coatvision-app/bilder-index/logo.webp
const HERO_IMAGE = require("../../bilder-index/logo.webp");


export default function IndexScreen() {
  const router = useRouter();

  const goToAnalyze = () => router.push("/analyze");
  const goToLiveCamera = () => router.push("/live");
  const goToPartners = () => router.push("/partners");
  const goToLyxbot = () => router.push("/LYXbot");
  const goToAiAnalysis = () => router.push("/analyze");

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* HERO – LYXvision / CoatVision Core */}
      <ThemedView style={styles.heroCard}>
        <ThemedText type="subtitle">LYXvision</ThemedText>
        <ThemedText style={styles.heroTagline}>CoatVision Core</ThemedText>

        <View style={styles.heroRow}>
          {/* Venstre: tekst + knapp */}
          <View style={styles.heroTextColumn}>
            <ThemedText type="title" style={styles.heroTitle}>
              Se coating slik øyet aldri har gjort før.
            </ThemedText>

            <ThemedText style={styles.heroBody}>
              LYXvision / CoatVision Core er et kamerabasert kvalitetssystem
              som faktisk kan lære hvordan {""}
              <ThemedText style={styles.heroBodyHighlight}>
                din
              </ThemedText>{" "}
              coating ser ut.  
              Du starter enkelt – last opp bilder panel for panel – og bygger
              gradvis opp ditt eget “coating-DNA”, tilpasset produkter,
              lysforhold og lokalet ditt.  
              Ingen ferdig fasit, ingen tilfeldige AI-modeller – du trener det
              selv, i din egen hverdag.
            </ThemedText>

            <Pressable style={styles.primaryButton} onPress={goToAnalyze}>
              <ThemedText style={styles.primaryButtonText}>
                Last opp & analyser bilder
              </ThemedText>
            </Pressable>
          </View>

          {/* Høyre: hero-bilde */}
          <View style={styles.heroImageWrapper}>
            <Image source={HERO_IMAGE} style={styles.heroImage} />
          </View>
        </View>
      </ThemedView>

      {/* Optimal bruk av tid */}
      <ThemedView style={styles.sectionCard}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Optimal bruk av tid
        </ThemedText>
        <ThemedText style={styles.sectionKicker}>
          Argumenter for å velge CoatVision
        </ThemedText>

        <ThemedText style={styles.sectionBody}>
          CoatVision hjelper deg å bruke tiden der den faktisk gir verdi. I
          stedet for å stå og gjette deg frem med lamper og vinkler, får du et
          visuelt kart over hvor det er coating – og hvor det mangler.  
          Du ser avvikene mens panelet fortsatt er vått, slik at du kan
          korrigere der og da. Mindre omarbeid, færre overraskelser og mer
          forutsigbare jobber.
        </ThemedText>

        <ThemedText style={styles.sectionBody}>
          Dette er ikke bare et datasett eller et system. Det er{" "}
          <ThemedText style={styles.heroBodyHighlight}>ditt</ThemedText> datasett
          og ditt system, med treningsmoduler tilpasset deg, dine produkter og
          ditt lokale.  
          Du bygger opp en visuell logg over arbeidet du gjør – slik at både du
          og kunden faktisk ser hva som er gjort.
        </ThemedText>

        <Pressable style={styles.secondaryButton} onPress={goToLiveCamera}>
          <ThemedText style={styles.secondaryButtonText}>
            Åpne live kamera-modus
          </ThemedText>
        </Pressable>
      </ThemedView>

      {/* Datasett & trening */}
      <ThemedView style={styles.sectionCard}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Datasett & trening
        </ThemedText>
        <ThemedText style={styles.sectionKicker}>
          Bygget på ekte bilpaneler – ikke tilfeldige internettbilder
        </ThemedText>

        <ThemedText style={styles.sectionBody}>
          Treningssettet for CoatVision bygges opp av skaperen av systemet – med
          egne paneler, egne coatinger og ekte feilbilder.  
          Hver stripe, hver high spot og hvert miss er dokumentert, kalibrert og
          lagt inn som treningsdata.
        </ThemedText>

        <ThemedText style={styles.sectionBody}>
          Målet er at hver coating-produsent skal kunne få sitt eget datasett:
          produkter, fargekoder og typiske utfordringer – slik at AI-en
          faktisk kjenner deres system.  
          Du får ikke “en generisk AI-modell” – du får et treningsstudio som kan
          formes rundt{" "}
          <ThemedText style={styles.heroBodyHighlight}>
            din
          </ThemedText>{" "}
          produktlinje og dine rutiner.
        </ThemedText>

        <ThemedText style={styles.sectionBody}>
          Som partner får du innsikt i hvordan produktene dine faktisk brukes i
          felt, og kan være med å sette neste standard for dokumentert kvalitet
          i bransjen.
        </ThemedText>

        <Pressable style={styles.secondaryButton} onPress={goToPartners}>
          <ThemedText style={styles.secondaryButtonText}>
            Les mer / bli partner
          </ThemedText>
        </Pressable>
      </ThemedView>

      {/* Hvem er LYXvision laget for? */}
      <ThemedView style={styles.sectionCard}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Hvem er LYXvision laget for?
        </ThemedText>
        <ThemedText style={styles.sectionKicker}>
          Laget for detailere – av detailere
        </ThemedText>

        <ThemedText style={styles.sectionBody}>
          LYXvision startet som et sideprosjekt i hallen:  
          Hvordan ser vi egentlig om coatingen ligger jevnt?  
          Hvordan dokumenterer vi jobben på en måte både vi og kunden forstår?
        </ThemedText>

        <ThemedText style={styles.sectionBody}>
          Systemet er bygget på reisen fra nybegynner til profesjonell
          detailer – med alle usikkerhetene, feilene og læringskurvene som hører
          med.  
          Steg for steg ble behovet for bedre dokumentasjon, enklere
          kvalitetssikring og mer ærlig kommunikasjon med kunden gjort om til et
          konkret verktøy.
        </ThemedText>

        <ThemedText style={styles.sectionBody}>
          LYXvision / CoatVision Core er neste kapittel i den reisen: et
          verktøy laget for verksteder og detailere som vil ta kontroll på
          kvaliteten, bygge tillit – og samtidig gjøre hverdagen mer forutsigbar
          og inspirerende.
        </ThemedText>

        <Pressable style={styles.secondaryButton} onPress={goToPartners}>
          <ThemedText style={styles.secondaryButtonText}>
            Muligheter for verksteder & detailere
          </ThemedText>
        </Pressable>
      </ThemedView>

      {/* LYXbot */}
      <ThemedView style={styles.sectionCard}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          LYXbot – detailerens beste venn
        </ThemedText>
        <ThemedText style={styles.sectionKicker}>
          Spesialisert på bilpleie og detailing – ikke alt mulig annet
        </ThemedText>

        <ThemedText style={styles.sectionBody}>
          LYXbot er en AI-assistent som kun bryr seg om én ting: bilpleie og
          detailing.  
          Den kan hjelpe deg med valg av poleringssteg, produkter, herdetider,
          vedlikeholdsløp og forslag til hvordan du forklarer jobben til kunden.
        </ThemedText>

        <ThemedText style={styles.sectionBody}>
          Jobber du alene, eller i et lite team, blir LYXbot som en ekstra
          kollega i lomma – alltid tilgjengelig, alltid oppdatert på faget.  
          Trenger du et raskt innspill på en lakktilstand, en kombo som kan
          fungere, eller hvordan du bør prise en jobb, kan du bare spørre.
        </ThemedText>

        <ThemedText style={styles.sectionBody}>
          Målet er ikke å erstatte fagfolk – men å gi deg et verktøy som gjør
          det lettere å ta gode faglige valg, kommunisere tydelig med kunder og
          stå tryggere i vurderingene dine.
        </ThemedText>

        <Pressable style={styles.secondaryButton} onPress={goToLyxbot}>
          <ThemedText style={styles.secondaryButtonText}>
            Gå til LYXbot
          </ThemedText>
        </Pressable>
      </ThemedView>

      {/* AI-drevet bildeanalyse */}
      <ThemedView style={styles.sectionCard}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          AI-drevet bildeanalyse
        </ThemedText>
        <ThemedText style={styles.sectionKicker}>
          Fra mobilbilder til kalibrerte AR-/BR-briller
        </ThemedText>

        <ThemedText style={styles.sectionBody}>
          Første steg er enkelt: du tar bilder med mobil eller nettbrett – panel
          for panel – og lar CoatVision analysere hvor det er coating, og hvor
          den mangler.  
          Over tid lærer systemet hvordan coating ser ut hos deg, med dine
          produkter og ditt lys.
        </ThemedText>

        <ThemedText style={styles.sectionBody}>
          Neste steg er der magien virkelig starter: en egen kalibrert AR- eller
          BR-brille for hvert verksted og hver produsent.  
          Brillen tilpasses lysforholdene i lokalet, produktene du bruker og
          ønsket kvalitetsnivå – slik at du ser coatingen i sanntid, direkte i
          synsfeltet.
        </ThemedText>

        <ThemedText style={styles.sectionBody}>
          Dette er ikke magi – det er neste generasjon kvalitetskontroll:
          {""}{" "}
          <ThemedText style={styles.heroBodyHighlight}>
            LYXvision Quality Index
          </ThemedText>{" "}
          – et visuelt språk for kvalitet som både detailere, produsenter og
          kunder kan forstå.
        </ThemedText>

        <Pressable style={styles.secondaryButton} onPress={goToAiAnalysis}>
          <ThemedText style={styles.secondaryButtonText}>
            Utforsk bildeanalyse
          </ThemedText>
        </Pressable>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },

  heroCard: {
    padding: 20,
    borderRadius: 20,
  },
  heroTagline: {
    opacity: 0.7,
    marginBottom: 8,
  },
  heroRow: {
    marginTop: 8,
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  heroTextColumn: {
    flex: 1.2,
    gap: 12,
  },
  heroImageWrapper: {
    flex: 1,
    alignItems: "center",
  },
  heroImage: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 16,
    resizeMode: "cover",
  },
  heroTitle: {
    marginBottom: 4,
  },
  heroBody: {
    opacity: 0.9,
    lineHeight: 20,
  },
  heroBodyHighlight: {
    fontWeight: "700",
  },
  primaryButton: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
  },
  primaryButtonText: {
    fontWeight: "600",
    textAlign: "center",
  },

  sectionCard: {
    padding: 20,
    borderRadius: 20,
    gap: 8,
  },
  sectionTitle: {
    marginBottom: 4,
  },
  sectionKicker: {
    opacity: 0.7,
    marginBottom: 4,
  },
  sectionBody: {
    opacity: 0.9,
    lineHeight: 20,
    marginTop: 4,
  },
  secondaryButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#22c55e",
    alignSelf: "flex-start",
  },
  secondaryButtonText: {
    fontWeight: "600",
  },
});
