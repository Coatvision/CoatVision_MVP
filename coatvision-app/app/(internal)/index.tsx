import React from "react";
import { ScrollView, View, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText, ThemedView } from "@/components/Themed";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* HERO / TOPP */}
      <ThemedView style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <ThemedText style={styles.heroBadge}>LYXvision</ThemedText>
          <ThemedText style={styles.heroSubBadge}>CoatVision Core</ThemedText>
        </View>

        <ThemedText type="title" style={styles.heroTitle}>
          Se coating slik øyet aldri har gjort før.
        </ThemedText>

        <ThemedText style={styles.heroText}>
          LYXvision / CoatVision analyserer lakken og viser hvor det er coating –
          og hvor det mangler. Mindre gjetting, mer kontroll og tryggere
          levering til kunden.
        </ThemedText>

        <Pressable
          style={styles.primaryButton}
          onPress={() => router.push("/analyze")}
        >
          <ThemedText style={styles.primaryButtonText}>
            Last opp &amp; analyser bilder
          </ThemedText>
        </Pressable>
      </ThemedView>

      {/* MODUL: Optimal bruk av tid */}
      <InfoCard
        title="Optimal bruk av tid"
        highlight="Argumentet for å velge CoatVision"
        body={[
          "CoatVision hjelper deg å bruke tiden der den faktisk gir verdi. I stedet for å stå og gjette deg frem med lamper og vinkler, får du et visuelt kart over hvor det er coating – og hvor det mangler.",
          "Du ser avvikene mens panelet fortsatt er vått. Mindre omarbeid, færre overraskelser og mer forutsigbare jobber.",
        ]}
        footerText="Live kamera-modus er første byggekloss – og blir senere koblet til AR/BR-briller."
        ctaLabel="Åpne live kamera-modus"
        onPress={() => router.push("/analyze")}
      />

      {/* MODUL: Datasett & trening */}
      <InfoCard
        title="Datasett & trening"
        highlight="Bygget på ekte bilpaneler – ikke tilfeldige internettbilder"
        body={[
          "Treningssettet for CoatVision bygges opp av skaperen av systemet – med egne paneler, egne coatinger og ekte feilbilder.",
          "Målet er at hver produsent kan få sitt eget datasett: produkter, farger og typiske utfordringer – slik at AI-en faktisk kjenner deres system.",
        ]}
        footerText="Vi søker coating-produsenter og verksteder som vil være med og forme neste generasjon kvalitetssikring."
        ctaLabel="Les mer / bli partner"
        onPress={() => router.push("/partners")}
      />

      {/* MODUL: Hvem er LYXvision laget for? */}
      <InfoCard
        title="Hvem er LYXvision laget for?"
        highlight="Laget for detailere – av detailere"
        body={[
          "LYXvision startet som et sideprosjekt i hallen: Hvordan ser vi egentlig om coatingen ligger jevnt? Hvordan dokumenterer vi jobben på en måte både vi og kunden forstår?",
          "Systemet er bygget på reisen fra nybegynner til profesjonell detailer – og videre til å utvikle verktøy for hele bransjen.",
        ]}
        footerText="LYXvision er laget for verksteder, coatingspesialister og produsenter som vil løfte kvalitet og dokumentasjon."
        ctaLabel="Se løsninger for verksted & produsenter"
        onPress={() => router.push("/partners")}
      />

      {/* MODUL: LYXbot */}
      <InfoCard
        title="LYXbot"
        highlight="Detailerens beste venn"
        body={[
          "LYXbot er en AI-assistent som er spesialisert på bilpleie og detailing – ikke alt mulig annet.",
          "Den kan hjelpe med valg av poleringssteg, produkter, herdetid, vedlikehold og tips til kundedialog og rapporter.",
        ]}
        footerText="Planen er at LYXbot skal kunne bruke dine egne rutiner og produkter som grunnlag for svarene."
        ctaLabel="Åpne LYXbot"
        onPress={() => router.push("/LYXbot")}
      />

      {/* MODUL: AI-drevet bildeanalyse */}
      <InfoCard
        title="AI-drevet bildeanalyse"
        highlight="Fra mobil til egen AR-brille"
        body={[
          "Første steg er bildeanalyse via mobil/nettbrett – panel for panel. Systemet lærer seg hvordan coating ser ut hos deg.",
          "På sikt er målet at hver produsent og hvert verksted skal kunne få en egen kalibrert AR-/BR-brille, tilpasset lysforhold og produkter i deres lokaler.",
        ]}
        footerText="CoatVision Core er analyse-motoren som bygges nå – resten kommer lag for lag etter hvert som datasettet vokser."
        ctaLabel="Test AI-bildeanalyse"
        onPress={() => router.push("/analyze")}
      />

      {/* STATUS / FOOTER */}
      <ThemedView style={styles.statusCard}>
        <ThemedText style={styles.statusTitle}>Status</ThemedText>
        <ThemedText style={styles.statusText}>
          LYXvision er i aktiv utvikling. Dagens versjon er en teknisk demo med
          enkel analyse. Etter hvert som datasettet og partnernettverket vokser,
          blir modellen smartere – uten at du mister kontrollen på gulvet.
        </ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

/** Gjenbrukbar infokort-komponent */
type InfoCardProps = {
  title: string;
  highlight?: string;
  body: string[];
  footerText?: string;
  ctaLabel?: string;
  onPress?: () => void;
};

function InfoCard({
  title,
  highlight,
  body,
  footerText,
  ctaLabel,
  onPress,
}: InfoCardProps) {
  return (
    <ThemedView style={styles.infoCard}>
      <ThemedText type="subtitle" style={styles.infoTitle}>
        {title}
      </ThemedText>

      {highlight && (
        <ThemedText style={styles.infoHighlight}>{highlight}</ThemedText>
      )}

      {body.map((paragraph, idx) => (
        <ThemedText key={idx} style={styles.infoBody}>
          {paragraph}
        </ThemedText>
      ))}

      {footerText && (
        <ThemedText style={styles.infoFooterText}>{footerText}</ThemedText>
      )}

      {ctaLabel && onPress && (
        <Pressable style={styles.secondaryButton} onPress={onPress}>
          <ThemedText style={styles.secondaryButtonText}>{ctaLabel}</ThemedText>
        </Pressable>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },

  /* HERO */
  heroCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 8,
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  heroBadge: {
    fontWeight: "700",
  },
  heroSubBadge: {
    fontSize: 12,
    opacity: 0.8,
  },
  heroTitle: {
    marginBottom: 8,
  },
  heroText: {
    marginBottom: 16,
  },
  primaryButton: {
    marginTop: 4,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  primaryButtonText: {
    fontWeight: "600",
  },

  /* INFOKORT */
  infoCard: {
    borderRadius: 20,
    padding: 16,
    marginTop: 8,
  },
  infoTitle: {
    marginBottom: 4,
  },
  infoHighlight: {
    fontSize: 12,
    marginBottom: 8,
  },
  infoBody: {
    marginBottom: 6,
  },
  infoFooterText: {
    marginTop: 4,
    marginBottom: 8,
    fontSize: 12,
  },
  secondaryButton: {
    marginTop: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },

  /* STATUS */
  statusCard: {
    borderRadius: 16,
    padding: 14,
    marginTop: 8,
  },
  statusTitle: {
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
  },
});
