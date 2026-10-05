import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { StateMessage } from "@/components/StateMessage";
import { useAnimal } from "@/features/animals/hooks/useAnimals";

export default function AnimalDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: animal, error, isPending } = useAnimal(id);

  if (isPending) return <StateMessage message="Carregando detalhes..." loading />;
  if (error) return <StateMessage message={`Não foi possível carregar o animal: ${error.message}`} />;
  if (!animal) return <StateMessage message="Animal não encontrado ou indisponível." />;

  const age = animal.ageMonths < 12
    ? `${animal.ageMonths} ${animal.ageMonths === 1 ? "mês" : "meses"}`
    : `${Math.floor(animal.ageMonths / 12)} ${Math.floor(animal.ageMonths / 12) === 1 ? "ano" : "anos"}`;

  return (
    <>
      <Stack.Screen options={{ title: animal.name }} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.emoji}>{animal.species === "gato" ? "🐱" : "🐶"}</Text>
        </View>
        <Text style={styles.name}>{animal.name}</Text>
        <View style={styles.facts}>
          <Text style={styles.fact}>Idade: {age}</Text>
          <Text style={styles.fact}>Raça: {animal.breed || "Não informada"}</Text>
          <Text style={styles.fact}>Porte: {animal.size}</Text>
          <Text style={styles.fact}>Saúde: {healthLabel(animal.healthStatus)}</Text>
        </View>
        <Text style={styles.sectionTitle}>Sobre {animal.name}</Text>
        <Text style={styles.description}>{animal.description}</Text>
        <Text style={styles.contactNote}>O contato com o responsável estará disponível após a implementação das contas de usuário.</Text>
      </ScrollView>
    </>
  );
}

function healthLabel(status: string): string {
  if (status === "saudavel") return "Saudável";
  if (status === "em_tratamento") return "Em tratamento";
  return "Não informado";
}

const styles = StyleSheet.create({
  container: { gap: 18, padding: 20, width: "100%", maxWidth: 760, alignSelf: "center" },
  hero: { alignItems: "center", backgroundColor: "#fff0dc", borderRadius: 20, height: 240, justifyContent: "center" },
  emoji: { fontSize: 112 },
  name: { color: "#593a8a", fontSize: 28, fontWeight: "800" },
  facts: { backgroundColor: "#fff", borderRadius: 14, gap: 10, padding: 16 },
  fact: { color: "#493d57", fontSize: 16 },
  sectionTitle: { color: "#30283a", fontSize: 19, fontWeight: "700" },
  description: { color: "#62596a", fontSize: 16, lineHeight: 24 },
  contactNote: { backgroundColor: "#f0e8ff", borderRadius: 12, color: "#593a8a", lineHeight: 21, padding: 14 },
});
