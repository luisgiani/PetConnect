import { Link } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { Animal } from "@/features/animals/types";

type AnimalCardProps = { animal: Animal };

export function AnimalCard({ animal }: AnimalCardProps) {
  return (
    <View style={styles.card}>
      <Link href={{ pathname: "/animals/[id]", params: { id: animal.id } }} asChild>
        <Pressable accessibilityRole="link" style={styles.animalLink}>
          {animal.photos[0]
            ? <Image source={{ uri: animal.photos[0] }} resizeMode="cover" style={styles.avatar} />
            : <View style={styles.avatar}><Text style={styles.emoji}>{animal.species === "gato" ? "🐱" : "🐶"}</Text></View>}
          <View style={styles.details}>
            <Text style={styles.name}>{animal.name}</Text>
            <Text style={styles.subtitle}>{formatAge(animal.ageMonths)} · {animal.breed || labelSpecies(animal.species)}</Text>
            <Text style={styles.location}>⌖ {formatLocation(animal.city, animal.state)}</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </Pressable>
      </Link>
    </View>
  );
}

function formatAge(months: number): string {
  if (months < 12) return `${months} ${months === 1 ? "mês" : "meses"}`;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  return remainingMonths === 0 ? `${years} ${years === 1 ? "ano" : "anos"}` : `${years}a ${remainingMonths}m`;
}

function labelSpecies(species: Animal["species"]): string {
  return species === "cachorro" ? "Cachorro" : species === "gato" ? "Gato" : "Outro";
}

function formatLocation(city: string | null, state: string | null): string {
  if (city && state) return `${city} - ${state}`;
  return city || state || "Localização não informada";
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderColor: "#ead8cd",
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
    padding: 10,
  },
  animalLink: {
    alignItems: "center",
    flexDirection: "row",
    gap: 15,
  },
  avatar: {
    backgroundColor: "#ffead8",
    borderRadius: 16,
    height: 88,
    width: 88,
  },
  emoji: {
    alignItems: "center",
    fontSize: 42,
    textAlign: "center",
    textAlignVertical: "center",
    lineHeight: 88,
  },
  details: { flex: 1, gap: 5 },
  name: { color: "#3f2d2a", fontSize: 19, fontWeight: "800" },
  subtitle: { color: "#88756d", fontSize: 14 },
  location: { color: "#a6533d", fontSize: 14, fontWeight: "700" },
  arrow: { color: "#a6533d", fontSize: 30, fontWeight: "300", paddingHorizontal: 4 },
});

