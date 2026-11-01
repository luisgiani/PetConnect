import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { DonorContact } from "@/components/DonorContact";
import { StateMessage } from "@/components/StateMessage";
import { useAnimal } from "@/features/animals/hooks/useAnimals";

export default function AnimalDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const { data: animal, error, isPending } = useAnimal(id);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    setPhotoIndex(0);
  }, [animal?.id]);

  if (isPending) return <StateMessage message="Carregando detalhes..." loading />;
  if (error) return <StateMessage message={`Não foi possível carregar o animal: ${error.message}`} />;
  if (!animal) return <StateMessage message="Animal não encontrado ou indisponível." />;

  const age = animal.ageMonths < 12
    ? `${animal.ageMonths} ${animal.ageMonths === 1 ? "mês" : "meses"}`
    : `${Math.floor(animal.ageMonths / 12)} ${Math.floor(animal.ageMonths / 12) === 1 ? "ano" : "anos"}`;
  const photoWidth = Math.min(Math.max(width - 40, 280), 720);
  const photoHeight = Math.min(Math.max(photoWidth * 0.56, 250), 400);
  const photoCount = animal.photos.length;

  return (
    <>
      <Stack.Screen options={{ title: animal.name }} />
      <ScrollView contentContainerStyle={styles.container}>
        {photoCount ? (
          <View style={[styles.photoGallery, { width: photoWidth, height: photoHeight }]}>
            <Image
              accessibilityLabel={`Foto ${photoIndex + 1} de ${animal.name}`}
              source={{ uri: animal.photos[photoIndex] }}
              resizeMode="cover"
              style={styles.hero}
            />
            {photoCount > 1 ? (
              <>
                {photoIndex > 0 ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Ver foto anterior"
                    onPress={() => setPhotoIndex((current) => current - 1)}
                    style={[styles.arrowButton, styles.previousButton]}
                  >
                    <Chevron direction="previous" />
                  </Pressable>
                ) : null}
                {photoIndex < photoCount - 1 ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Ver próxima foto"
                    onPress={() => setPhotoIndex((current) => current + 1)}
                    style={[styles.arrowButton, styles.nextButton]}
                  >
                    <Chevron direction="next" />
                  </Pressable>
                ) : null}
                <View accessibilityLiveRegion="polite" style={styles.photoCounter}>
                  <Text style={styles.photoCounterText}>{photoIndex + 1} / {photoCount}</Text>
                </View>
              </>
            ) : null}
          </View>
        ) : (
          <View style={[styles.heroPlaceholder, { width: photoWidth, height: photoHeight }]}>
            <Text style={styles.emoji}>{animal.species === "gato" ? "🐱" : "🐶"}</Text>
          </View>
        )}
        <View style={styles.heading}>
          <Text style={styles.name}>{animal.name}</Text>
          <View style={styles.locationBadge}>
            <Text style={styles.locationIcon}>⌖</Text>
            <Text style={styles.locationText}>{formatLocation(animal.city, animal.state)}</Text>
          </View>
        </View>
        <View style={styles.facts}>
          <DetailFact label="Idade" value={age} />
          <DetailFact label="Raça" value={animal.breed || "Não informada"} />
          <DetailFact label="Porte" value={formatSize(animal.size)} />
          <DetailFact label="Saúde" value={healthLabel(animal.healthStatus)} />
        </View>
        <View style={styles.descriptionCard}>
          <Text style={styles.sectionTitle}>Sobre {animal.name}</Text>
          <Text style={styles.description}>{animal.description}</Text>
        </View>
        <DonorContact
          donorName={animal.donorName}
          donorPhone={animal.donorPhone}
          donorCity={animal.donorCity}
          donorState={animal.donorState}
          donorBio={animal.donorBio}
          contactError={animal.contactError}
          returnTo={`/animals/${animal.id}`}
        />
      </ScrollView>
    </>
  );
}

function healthLabel(status: string): string {
  if (status === "saudavel") return "Saudável";
  if (status === "em_tratamento") return "Em tratamento";
  return "Não informado";
}

function formatLocation(city: string | null, state: string | null): string {
  if (city && state) return `${city} - ${state}`;
  return city || state || "Não informada";
}

function formatSize(size: string): string {
  return size === "medio" ? "Médio" : size === "pequeno" ? "Pequeno" : "Grande";
}

function DetailFact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue}>{value}</Text>
    </View>
  );
}

function Chevron({ direction }: { direction: "previous" | "next" }) {
  return (
    <View style={[styles.chevron, direction === "previous" && styles.chevronPrevious]}>
      <View style={[styles.chevronArm, styles.chevronTop]} />
      <View style={[styles.chevronArm, styles.chevronBottom]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 18, padding: 20, width: "100%", maxWidth: 760, alignSelf: "center" },
  photoGallery: { alignSelf: "center", backgroundColor: "#ffead8", borderRadius: 20, overflow: "hidden", position: "relative" },
  hero: { backgroundColor: "#ffead8", height: "100%", width: "100%" },
  arrowButton: { alignItems: "center", backgroundColor: "rgba(48, 40, 58, 0.78)", borderColor: "rgba(255, 255, 255, 0.8)", borderRadius: 24, borderWidth: 1, height: 48, justifyContent: "center", position: "absolute", top: "50%", transform: [{ translateY: -24 }], width: 48 },
  previousButton: { left: 12 },
  nextButton: { right: 12 },
  chevron: { height: 18, justifyContent: "center", position: "relative", width: 12 },
  chevronPrevious: { transform: [{ scaleX: -1 }] },
  chevronArm: { backgroundColor: "#fff", borderRadius: 1, height: 2, position: "absolute", right: 0, width: 10 },
  chevronTop: { top: 4, transform: [{ rotate: "45deg" }] },
  chevronBottom: { bottom: 4, transform: [{ rotate: "-45deg" }] },
  photoCounter: { alignSelf: "center", backgroundColor: "rgba(48, 40, 58, 0.72)", borderRadius: 14, bottom: 12, paddingHorizontal: 12, paddingVertical: 5, position: "absolute" },
  photoCounterText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  heroPlaceholder: { alignItems: "center", alignSelf: "center", backgroundColor: "#ffead8", borderRadius: 20, justifyContent: "center" },
  emoji: { fontSize: 112 },
  heading: { gap: 8 },
  name: { color: "#3f2d2a", fontSize: 30, fontWeight: "800" },
  locationBadge: { alignItems: "center", alignSelf: "flex-start", backgroundColor: "#ffe8dc", borderRadius: 16, flexDirection: "row", gap: 6, paddingHorizontal: 12, paddingVertical: 7 },
  locationIcon: { color: "#b85c38", fontSize: 16, fontWeight: "700" },
  locationText: { color: "#b85c38", fontSize: 14, fontWeight: "600" },
  facts: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  fact: { backgroundColor: "#fff", borderColor: "#ead8cd", borderRadius: 12, borderWidth: 1, flexBasis: "48%", flexGrow: 1, gap: 5, minWidth: 120, padding: 14 },
  factLabel: { color: "#88756d", fontSize: 13 },
  factValue: { color: "#3f2d2a", fontSize: 16, fontWeight: "700" },
  descriptionCard: { backgroundColor: "#fff", borderColor: "#ead8cd", borderRadius: 14, borderWidth: 1, gap: 10, padding: 16 },
  sectionTitle: { color: "#3f2d2a", fontSize: 19, fontWeight: "700" },
  description: { color: "#776761", fontSize: 16, lineHeight: 25 },
});

