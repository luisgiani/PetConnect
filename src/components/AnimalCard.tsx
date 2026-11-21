import { Link } from "expo-router";
import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import type { Animal } from "@/features/animals/types";

type AnimalCardProps = { animal: Animal; interactive?: boolean };

export function AnimalCard({ animal, interactive = true }: AnimalCardProps) {
  const { width } = useWindowDimensions();
  const photoHeight = Math.min(Math.max((width - 40) * 0.92, 280), 560);
  const content = (
    <>
      <View style={[styles.photoFrame, { height: photoHeight }]}>
        {animal.photos[0] ? (
          <Image
            accessibilityLabel={`Foto de ${animal.name}`}
            source={{ uri: animal.photos[0] }}
            resizeMode="cover"
            style={styles.photo}
          />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.emoji}>{animal.species === "gato" ? "🐱" : "🐶"}</Text>
            <Text style={styles.placeholderLabel}>Foto em breve</Text>
          </View>
        )}
        <View style={styles.photoOverlay}>
          <Text style={styles.statusBadge}>Para adoção</Text>
          {animal.photos.length > 1 ? (
            <Text style={styles.photoCount}>{animal.photos.length} fotos</Text>
          ) : null}
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.metaRow}>
          <Text style={styles.species}>{labelSpecies(animal.species)}</Text>
          <Text style={styles.meta}>{formatAge(animal.ageMonths)} · Porte {formatSize(animal.size)}</Text>
        </View>
        <Text style={styles.name}>{animal.name}</Text>
        <Text style={styles.location}>{formatLocation(animal.city, animal.state)}</Text>
        <Text numberOfLines={2} style={styles.description}>{animal.description}</Text>
        {interactive ? (
          <View style={styles.footer}>
            <Text style={styles.detailsLink}>Conhecer {animal.name}</Text>
            <Text style={styles.arrow}>›</Text>
          </View>
        ) : null}
      </View>
    </>
  );

  return (
    <View style={styles.card}>
      {interactive ? (
        <Link href={{ pathname: "/animals/[id]", params: { id: animal.id } }} asChild>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={`Ver anúncio de ${animal.name}`}
            style={({ pressed }) => [styles.post, pressed && styles.pressed]}
          >
            {content}
          </Pressable>
        </Link>
      ) : <View style={styles.post}>{content}</View>}
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
  return species === "cachorro" ? "Cachorro" : species === "gato" ? "Gato" : "Outro animal";
}

function formatSize(size: Animal["size"]): string {
  return size === "medio" ? "médio" : size;
}

function formatLocation(city: string | null, state: string | null): string {
  if (city && state) return `${city} · ${state}`;
  return city || state || "Localização não informada";
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderColor: "#ead8cd",
    borderRadius: 22,
    borderWidth: 1,
    overflow: "hidden",
  },
  post: { gap: 0 },
  photoFrame: {
    backgroundColor: "#ffead8",
    overflow: "hidden",
    position: "relative",
    width: "100%",
  },
  photo: { height: "100%", width: "100%" },
  photoPlaceholder: { alignItems: "center", flex: 1, justifyContent: "center" },
  emoji: { fontSize: 88 },
  placeholderLabel: { color: "#88756d", fontSize: 14, fontWeight: "600", marginTop: 8 },
  photoOverlay: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    left: 14,
    position: "absolute",
    right: 14,
    top: 14,
  },
  statusBadge: {
    backgroundColor: "#fff8f0",
    borderRadius: 16,
    color: "#a6533d",
    fontSize: 13,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  photoCount: {
    backgroundColor: "rgba(63, 45, 42, 0.78)",
    borderRadius: 16,
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    overflow: "hidden",
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  content: { gap: 7, padding: 17 },
  metaRow: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: 8 },
  species: { color: "#a6533d", fontSize: 13, fontWeight: "800", textTransform: "uppercase" },
  meta: { color: "#88756d", fontSize: 13 },
  name: { color: "#3f2d2a", fontSize: 23, fontWeight: "900" },
  location: { color: "#604b45", fontSize: 14, fontWeight: "600" },
  description: { color: "#776761", fontSize: 14, lineHeight: 21, marginTop: 3 },
  footer: {
    alignItems: "center",
    borderTopColor: "#f0e5dc",
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
    paddingTop: 12,
  },
  detailsLink: { color: "#a6533d", fontSize: 15, fontWeight: "800" },
  arrow: { color: "#a6533d", fontSize: 24, lineHeight: 24 },
  pressed: { opacity: 0.88 },
});
