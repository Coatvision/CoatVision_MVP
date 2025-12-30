import { useState } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
} from "react-native";
import { useRouter } from "expo-router";

import { ThemedText, ThemedView } from "@/components/Themed";

// Bildet du viste (logo / LYXvision-bil).
// Stien er fra: coatvision-app/app/(tabs)/partners.tsx → ../../bilder-index/logo.webp
const HERO_IMAGE = require("../../bilder-index/logo.webp");

export default function PartnersScreen() {
  const router = useRouter();

  // Skjema-felt – bare UI (ingen lagring ennå i MVP)
  const [producerName, setProducerName] = useState("");
  const [productName, setProductName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [productType, setProductType] = useState("");

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* HERO / TECH-INTRO */}
      <ThemedView style={styles.heroCard}>
        <View style={styles.heroContent}>
          <View style={styles.heroTextBlock}>
            <View style={styles.badge}>
              <ThemedText style={styles.badgeText}>
                Produsentportal · LYXvision / CoatVision
              </ThemedText>
            </View>

            <ThemedText type="title" style={styles.heroTitle}>
              Se coating slik øyet aldri har gjort før – sammen med deg.
            </ThemedText>

            <ThemedText style={styles.heroSubtitle}>
              LYXvision er et teknisk system for produsenter som vil koble
              egne produkter, rutiner og treningsdata rett inn i en
              AI-drevet plattform. Du er med og former hvordan systemet
              tenker – i stedet for å bare tilpasse deg en ferdig løsning.
            </ThemedText>

            <View style={styles.chipRow}>
              <TechChip label="Eget, dedikert datasett" />
              <TechChip label="Tilpasset dine produkter" />
              <TechChip label="Klar for AR/VR-briller" />
            </View>
          </View>

          <Image
            source={HERO_IMAGE}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>
      </ThemedView>

      {/* SKJEMA – BLI MED FRA STARTEN */}
      <ThemedView style={styles.formCard}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Bli med fra starten
        </ThemedText>
        <ThemedText style={styles.sectionLead}>
          Fyll ut informasjonen under hvis du er interessert i å bygge et
          eget datasett for dine coating-produkter. Vi tar kontakt for en
          teknisk prat om hvordan LYXvision kan kobles på porteføljen din.
        </ThemedText>

        <View style={styles.inputGroup}>
          <InputLabel>Produsentnavn</InputLabel>
          <StyledInput
            placeholder="F.eks. Nordic Coatings"
            value={producerName}
            onChangeText={setProducerName}
          />
        </View>

        <View style={styles.inputGroup}>
          <InputLabel>Produktnavn</InputLabel>
          <StyledInput
            placeholder="F.eks. Pro Coat v2"
            value={productName}
            onChangeText={setProductName}
          />
        </View>

        <View style={styles.inputGroup}>
          <InputLabel>Firma</InputLabel>
          <StyledInput
            placeholder="Juridisk navn på selskap"
            value={companyName}
            onChangeText={setCompanyName}
          />
        </View>

        <View style={styles.inputGroup}>
          <InputLabel>Type produkt</InputLabel>
          <StyledInput
            placeholder="Coating, primer, toppcoat, vedlikeholdsprodukt …"
            value={productType}
            onChangeText={setProductType}
          />
        </View>

        <Pressable
          style={styles.primaryButton}
          onPress={() => {
            // MVP: bare en bekreftelse – ingen backend koblet ennå
            alert(
              "Takk! I MVP-versjonen lagres ikke skjemaet ennå – men dette er grunnlaget for produsent-onboarding."
            );
          }}
        >
          <ThemedText style={styles.primaryButtonText}>
            Registrer interesse
          </ThemedText>
        </Pressable>
      </ThemedView>

      {/* HVA KAN DU GJØRE I PORTALEN? */}
      <ThemedView style={styles.infoCard}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Hva kan du gjøre i portalen?
        </ThemedText>

        <BulletPoint>
          Registrere coating-produkter, primere, toppcoats og
          vedlikeholdsprodukter – strukturert i serier og familier.
        </BulletPoint>
        <BulletPoint>
          Laste opp bilder og video av riktig påføring, buffing og
          sluttkontroll for å trene AI-modellen på akkurat dine produkter.
        </BulletPoint>
        <BulletPoint>
          Definere anbefalte arbeidsprosesser, herdetider og
          kontrollpunkter som vises direkte til detailere i appen.
        </BulletPoint>
        <BulletPoint>
          På sikt: få innsikt i hvordan produktene brukes i felt – aggregert
          statistikk, typiske feilmønstre og bedre grunnlag for utvikling av
          både produkter og system.
        </BulletPoint>
      </ThemedView>

      {/* ALLEREDE PARTNER – BEHOLDER FUNKSJONENE */}
      <ThemedView style={styles.actionsCard}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Allerede partner?
        </ThemedText>
        <ThemedText style={styles.sectionLead}>
          Har du allerede tilgang til portalen, kan du gå direkte til
          administrasjon av produktdata og opplasting av treningssett.
        </ThemedText>

        <Pressable
          style={styles.primaryButton}
          onPress={() => router.push("/partners-products")}
        >
          <ThemedText style={styles.primaryButtonText}>
            Administrer produkter
          </ThemedText>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.push("/partners-upload-data")}
        >
          <ThemedText style={styles.secondaryButtonText}>
            Last opp treningsdata
          </ThemedText>
        </Pressable>
      </ThemedView>
    </ScrollView>
  );
}

/* Hjelpe-komponenter (enkle typer for å unngå TS-trøbbel) */

function InputLabel({ children }: { children: any }) {
  return <ThemedText style={styles.inputLabel}>{children}</ThemedText>;
}

function StyledInput(props: any) {
  return (
    <TextInput
      {...props}
      placeholderTextColor="#6b7280"
      style={styles.textInput}
    />
  );
}

function BulletPoint({ children }: { children: any }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.bulletDot} />
      <ThemedText style={styles.bulletText}>{children}</ThemedText>
    </View>
  );
}

function TechChip({ label }: { label: string }) {
  return (
    <View style={styles.chip}>
      <ThemedText style={styles.chipText}>{label}</ThemedText>
    </View>
  );
}

/* STYLES */

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },

  // HERO
  heroCard: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#22c55e33",
    backgroundColor: "rgba(15,23,42,0.95)",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
  },
  heroContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  heroTextBlock: {
    flex: 1,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#22c55e1a",
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  heroTitle: {
    marginBottom: 6,
  },
  heroSubtitle: {
    lineHeight: 20,
    opacity: 0.9,
  },
  heroImage: {
    width: 160,
    height: 160,
    marginLeft: 8,
    borderRadius: 20,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#22c55e55",
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#0b11201a",
  },
  chipText: {
    fontSize: 11,
  },

  // FORM
  formCard: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: "rgba(15,23,42,0.9)",
    borderWidth: 1,
    borderColor: "#1f2933",
  },
  sectionTitle: {
    marginBottom: 6,
  },
  sectionLead: {
    marginBottom: 10,
    lineHeight: 20,
    opacity: 0.95,
  },
  inputGroup: {
    marginTop: 6,
  },
  inputLabel: {
    marginBottom: 4,
    fontSize: 12,
    opacity: 0.8,
  },
  textInput: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#374151",
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "rgba(15,23,42,0.9)",
  },

  primaryButton: {
    marginTop: 14,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    fontWeight: "600",
  },

  // INFO
  infoCard: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: "rgba(15,23,42,0.9)",
    borderWidth: 1,
    borderColor: "#1f2933",
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 6,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    marginTop: 8,
    marginRight: 8,
    backgroundColor: "#22c55e",
  },
  bulletText: {
    flex: 1,
    lineHeight: 20,
  },

  // ACTIONS
  actionsCard: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: "rgba(15,23,42,0.9)",
    borderWidth: 1,
    borderColor: "#1f2933",
    marginBottom: 32,
  },
  secondaryButton: {
    marginTop: 8,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#22c55e",
  },
  secondaryButtonText: {
    fontWeight: "600",
  },
});
