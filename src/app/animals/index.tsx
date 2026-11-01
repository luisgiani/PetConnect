import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { AnimalCard } from "@/components/AnimalCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { StateMessage } from "@/components/StateMessage";
import { useAuth } from "@/features/auth/AuthProvider";
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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { data, error, isPending, refetch, isRefetching } = useAnimals(activeFilters);
  const { profile } = useAuth();
  const hasActiveFilters = Object.values(activeFilters).some(Boolean);
  const prioritizedData = [...(data ?? [])].sort((first, second) =>
    locationScore(second, profile?.city, profile?.state) - locationScore(first, profile?.city, profile?.state),
  );
  const hasRegionalPriority = Boolean(profile?.city || profile?.state) && !activeFilters.city && !activeFilters.state;

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
    setFiltersOpen(false);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heading}>
        <Text style={styles.kicker}>PETCONNECT / ADOÇÃO</Text>
        <Text style={styles.title}>Encontre seu novo amigo</Text>
        <Text style={styles.subtitle}>Conheça os animais que estão esperando por um lar.</Text>
        {hasRegionalPriority ? (
          <Text style={styles.regionalNote}>Anúncios mais próximos de {profile?.city || profile?.state} aparecem primeiro.</Text>
        ) : null}
      </View>

      <View style={styles.quickBar}>
        <View>
          <Text style={styles.quickLabel}>Animais disponíveis</Text>
          <Text style={styles.quickHint}>{hasActiveFilters ? "Filtros aplicados" : "Veja todos os anúncios"}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: filtersOpen }}
          onPress={() => setFiltersOpen((current) => !current)}
          style={({ pressed }) => [styles.filterButton, pressed && styles.pressed]}
        >
          <Text style={styles.filterButtonText}>{filtersOpen ? "Fechar filtros" : "Filtrar"}</Text>
        </Pressable>
      </View>

      <View style={styles.quickChoiceRow}>
        <FilterChoice
          label="Todos os animais"
          selected={!hasActiveFilters}
          onPress={clearFilters}
        />
      </View>

      {filtersOpen ? <View style={styles.filters}>
        <View style={styles.filterHeader}>
          <View>
            <Text style={styles.filterTitle}>Refine sua busca</Text>
            <Text style={styles.filterHint}>Escolha uma ou mais opções</Text>
          </View>
          {hasActiveFilters ? (
            <Pressable accessibilityRole="button" onPress={clearFilters}>
              <Text style={styles.clearText}>Limpar</Text>
            </Pressable>
          ) : null}
        </View>

        <Text style={styles.filterLabel}>Espécie</Text>
        <View style={styles.choices}>
          {speciesOptions.map((option) => (
            <FilterChoice
              key={option.value}
              label={option.label}
              selected={draftFilters.species === option.value}
              onPress={() => setDraftFilters((current) => ({ ...current, species: current.species === option.value ? undefined : option.value }))}
            />
          ))}
        </View>

        <Text style={styles.filterLabel}>Porte</Text>
        <View style={styles.choices}>
          {sizeOptions.map((option) => (
            <FilterChoice
              key={option.value}
              label={option.label}
              selected={draftFilters.size === option.value}
              onPress={() => setDraftFilters((current) => ({ ...current, size: current.size === option.value ? undefined : option.value }))}
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
        <PrimaryButton title="Aplicar filtros" onPress={() => { applyFilters(); setFiltersOpen(false); }} />
      </View> : null}

      {isPending ? <StateMessage message="Carregando animais..." loading /> : null}
      {error ? (
        <View>
          <StateMessage message={`Não foi possível carregar os animais: ${error.message}`} />
          <PrimaryButton title="Tentar novamente" onPress={() => void refetch()} disabled={isRefetching} />
        </View>
      ) : null}
      {!isPending && !error && data?.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>⌕</Text>
          <StateMessage message={hasActiveFilters
            ? "Nenhum animal encontrado com esses filtros."
            : "Ainda não há animais disponíveis."}
          />
          {hasActiveFilters ? (
            <>
              <Text style={styles.emptyHint}>Tente remover algum filtro ou ampliar a região da busca.</Text>
              <PrimaryButton title="Ver todos os animais" variant="secondary" onPress={clearFilters} />
            </>
          ) : null}
        </View>
      ) : null}
      {prioritizedData.length ? (
        <View style={styles.list}>
          {prioritizedData.map((animal) => <AnimalCard key={animal.id} animal={animal} />)}
        </View>
      ) : null}

      <Link href="/animals/new" asChild>
        <PrimaryButton title="＋  Cadastrar animal" variant="secondary" />
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff8f0", gap: 14, padding: 20, width: "100%", maxWidth: 760, alignSelf: "center" },
  heading: { gap: 6, marginBottom: 4 },
  kicker: { color: "#e98973", fontSize: 11, fontWeight: "800", letterSpacing: 1.5 },
  title: { color: "#3f2d2a", fontSize: 28, fontWeight: "900", letterSpacing: -0.5 },
  subtitle: { color: "#88756d", fontSize: 15, lineHeight: 22 },
  regionalNote: { color: "#31705b", fontSize: 13, fontWeight: "700", marginTop: 4 },
  quickBar: { alignItems: "center", backgroundColor: "#fff0e8", borderRadius: 18, flexDirection: "row", justifyContent: "space-between", padding: 15 },
  quickLabel: { color: "#3f2d2a", fontSize: 16, fontWeight: "800" },
  quickHint: { color: "#a6533d", fontSize: 13, marginTop: 3 },
  filterButton: { backgroundColor: "#b85c38", borderRadius: 10, paddingHorizontal: 15, paddingVertical: 10 },
  filterButtonText: { color: "#fff", fontSize: 14, fontWeight: "800" },
  quickChoiceRow: { flexDirection: "row" },
  filters: { backgroundColor: "#fff", borderColor: "#ead8cd", borderRadius: 20, borderWidth: 1, gap: 12, padding: 17, shadowColor: "#604b45", shadowOpacity: 0.06, shadowRadius: 10 },
  filterHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  filterTitle: { color: "#3f2d2a", fontSize: 18, fontWeight: "700" },
  filterHint: { color: "#88756d", fontSize: 13, marginTop: 3 },
  clearText: { color: "#b85c38", fontSize: 14, fontWeight: "600", padding: 8 },
  filterLabel: { color: "#604b45", fontSize: 14, fontWeight: "600" },
  choices: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  choice: { backgroundColor: "#fff8f0", borderColor: "#ead8cd", borderRadius: 18, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 8 },
  choiceSelected: { backgroundColor: "#ffe8dc", borderColor: "#e8a18e" },
  choiceText: { color: "#776761", fontSize: 14 },
  choiceTextSelected: { color: "#b85c38", fontWeight: "700" },
  locationFilters: { flexDirection: "row", gap: 10 },
  cityInput: { flex: 1 },
  stateInput: { width: 84 },
  input: { backgroundColor: "#fff8f0", borderColor: "#ead8cd", borderRadius: 10, borderWidth: 1, color: "#3f2d2a", height: 44, marginTop: 6, paddingHorizontal: 12 },
  list: { gap: 12 },
  emptyState: { alignItems: "center", backgroundColor: "#fff", borderColor: "#ead8cd", borderRadius: 20, borderWidth: 1, gap: 8, padding: 22 },
  emptyIcon: { color: "#e98973", fontSize: 34, fontWeight: "800" },
  emptyHint: { color: "#88756d", fontSize: 14, lineHeight: 20, textAlign: "center" },
  pressed: { opacity: 0.8 },
});

function locationScore(animal: { city: string | null; state: string | null }, city?: string | null, state?: string | null): number {
  const sameCity = Boolean(city && animal.city && city.trim().toLocaleLowerCase("pt-BR") === animal.city.trim().toLocaleLowerCase("pt-BR"));
  const sameState = Boolean(state && animal.state && state.trim().toUpperCase() === animal.state.trim().toUpperCase());
  if (sameCity) return 2;
  if (sameState) return 1;
  return 0;
}

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

