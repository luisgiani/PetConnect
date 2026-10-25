import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { AnimalCard } from "@/components/AnimalCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { StateMessage } from "@/components/StateMessage";
import { useAnimals } from "@/features/animals/hooks/useAnimals";
import type { AnimalFilters, AnimalSize, AnimalSpecies } from "@/features/animals/types";

const speciesOptions: { value: AnimalSpecies; label: string }[] = [
  { value: "cachorro", label: "Cachorro" },
  { value: "gato", label: "Gato" },
  { value: "outro", label: "Outro" },
];

const sizeOptions: { value: AnimalSize; label: string }[] = [
  { value: "pequeno", label: "Pequeno" },
  { value: "medio", label: "Médio" },
  { value: "grande", label: "Grande" },
];

export default function AnimalsScreen() {
  const [draftFilters, setDraftFilters] = useState<AnimalFilters>({});
  const [activeFilters, setActiveFilters] = useState<AnimalFilters>({});
  const { data, error, isPending, refetch, isRefetching } = useAnimals(activeFilters);
  const hasActiveFilters = Object.values(activeFilters).some(Boolean);

  function applyFilters() {
    setActiveFilters({
      ...draftFilters,
      city: draftFilters.city?.trim() || undefined,
      state: draftFilters.state?.trim().toUpperCase() || undefined,
    });
  }

  function clearFilters() {
    setDraftFilters({});
    setActiveFilters({});
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heading}>
        <Text style={styles.title}>Encontre seu novo amigo</Text>
        <Text style={styles.subtitle}>Conheça os animais que estão esperando por um lar.</Text>
      </View>

      <View style={styles.filters}>
        <View style={styles.filterHeader}>
          <Text style={styles.filterTitle}>Encontre por</Text>
          {hasActiveFilters ? (
            <Pressable accessibilityRole="button" onPress={clearFilters}>
              <Text style={styles.clearText}>Limpar filtros</Text>
            </Pressable>
          ) : null}
        </View>

        <Text style={styles.filterLabel}>Espécie</Text>
        <View style={styles.choices}>
          <FilterChoice
            label="Todas"
            selected={!draftFilters.species}
            onPress={() => setDraftFilters((current) => ({ ...current, species: undefined }))}
          />
          {speciesOptions.map((option) => (
            <FilterChoice
              key={option.value}
              label={option.label}
              selected={draftFilters.species === option.value}
              onPress={() => setDraftFilters((current) => ({ ...current, species: option.value }))}
            />
          ))}
        </View>

        <Text style={styles.filterLabel}>Porte</Text>
        <View style={styles.choices}>
          <FilterChoice
            label="Todos"
            selected={!draftFilters.size}
            onPress={() => setDraftFilters((current) => ({ ...current, size: undefined }))}
          />
          {sizeOptions.map((option) => (
            <FilterChoice
              key={option.value}
              label={option.label}
              selected={draftFilters.size === option.value}
              onPress={() => setDraftFilters((current) => ({ ...current, size: option.value }))}
            />
          ))}
        </View>

        <View style={styles.locationFilters}>
          <View style={styles.cityInput}>
            <Text style={styles.filterLabel}>Cidade</Text>
            <TextInput
              accessibilityLabel="Filtrar por cidade"
              onChangeText={(city) => setDraftFilters((current) => ({ ...current, city }))}
              placeholder="Ex.: Campinas"
              style={styles.input}
              value={draftFilters.city ?? ""}
            />
          </View>
          <View style={styles.stateInput}>
            <Text style={styles.filterLabel}>Estado (UF)</Text>
            <TextInput
              accessibilityLabel="Filtrar por estado"
              autoCapitalize="characters"
              maxLength={2}
              onChangeText={(state) => setDraftFilters((current) => ({ ...current, state }))}
              placeholder="Ex: SP"
              style={styles.input}
              value={draftFilters.state ?? ""}
            />
          </View>
        </View>
        <PrimaryButton title="Buscar animais" onPress={applyFilters} />
      </View>

      {isPending ? <StateMessage message="Carregando animais..." loading /> : null}
      {error ? (
        <View>
          <StateMessage message={`Não foi possível carregar os animais: ${error.message}`} />
          <PrimaryButton title="Tentar novamente" onPress={() => void refetch()} disabled={isRefetching} />
        </View>
      ) : null}
      {!isPending && !error && data?.length === 0 ? (
        <StateMessage message={hasActiveFilters
          ? "Nenhum animal corresponde aos filtros. Tente alterar os critérios."
          : "Ainda não há animais disponíveis. Volte em breve!"}
        />
      ) : null}
      {data?.length ? (
        <View style={styles.list}>
          {data.map((animal) => <AnimalCard key={animal.id} animal={animal} />)}
        </View>
      ) : null}

      <Link href="/animals/new" asChild>
        <PrimaryButton title="＋  Cadastrar animal" variant="secondary" />
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 18, padding: 20, width: "100%", maxWidth: 760, alignSelf: "center" },
  heading: { gap: 6, marginBottom: 4 },
  title: { color: "#30283a", fontSize: 24, fontWeight: "800" },
  subtitle: { color: "#726a78", fontSize: 15, lineHeight: 22 },
  filters: { backgroundColor: "#fff", borderColor: "#eee3d4", borderRadius: 16, borderWidth: 1, gap: 12, padding: 16 },
  filterHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  filterTitle: { color: "#30283a", fontSize: 18, fontWeight: "700" },
  clearText: { color: "#593a8a", fontSize: 14, fontWeight: "600", padding: 8 },
  filterLabel: { color: "#493d57", fontSize: 14, fontWeight: "600" },
  choices: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  choice: { backgroundColor: "#fffaf4", borderColor: "#e5dce9", borderRadius: 18, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 8 },
  choiceSelected: { backgroundColor: "#f0e8ff", borderColor: "#b69bdf" },
  choiceText: { color: "#62596a", fontSize: 14 },
  choiceTextSelected: { color: "#593a8a", fontWeight: "700" },
  locationFilters: { flexDirection: "row", gap: 10 },
  cityInput: { flex: 1 },
  stateInput: { width: 84 },
  input: { backgroundColor: "#fffaf4", borderColor: "#e5dce9", borderRadius: 10, borderWidth: 1, color: "#30283a", height: 44, marginTop: 6, paddingHorizontal: 12 },
  list: { gap: 12 },
});

function FilterChoice({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[styles.choice, selected && styles.choiceSelected]}
    >
      <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{label}</Text>
    </Pressable>
  );
}
