import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Animal } from "@/features/animals/types";

type AnimalCardProps = { animal: Animal };

export function AnimalCard({ animal }: AnimalCardProps) {
  return (
    <Link href={{ pathname: "/animals/[id]", params: { id: animal.id } }} asChild>
      <Pressable accessibilityRole="link" style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.emoji}>{animal.species === "gato" ? "🐱" : "🐶"}</Text>
        </View>
        <View style={styles.details}>
          <Text style={styles.name}>{animal.name}</Text>
          <Text style={styles.subtitle}>{formatAge(animal.ageMonths)} · {animal.breed || labelSpecies(animal.species)}</Text>
          <Text style={styles.subtitle}>Porte {animal.size}</Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </Pressable>
    </Link>
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

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#eee3d4",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    padding: 14,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: "#fff0dc",
    borderRadius: 12,
    height: 76,
    justifyContent: "center",
    width: 76,
  },
  emoji: { fontSize: 42 },
  details: { flex: 1, gap: 5 },
  name: { color: "#30283a", fontSize: 18, fontWeight: "700" },
  subtitle: { color: "#726a78", fontSize: 14 },
  arrow: { color: "#7650aa", fontSize: 30, paddingHorizontal: 4 },
});
