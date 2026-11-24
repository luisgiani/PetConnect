import { useState } from "react";
import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AnimalCard } from "@/components/AnimalCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { StateMessage } from "@/components/StateMessage";
import { useAuth } from "@/features/auth/AuthProvider";
import { useFavorites } from "@/features/animals/FavoritesProvider";
import { filterAnimalsBySearch } from "@/features/animals/search";
import { useAnimals } from "@/features/animals/hooks/useAnimals";
import type { AnimalFilters, AnimalSize, AnimalSpecies } from "@/features/animals/types";
import { colors } from "@/theme/colors";

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
  const [searchText, setSearchText] = useState("");
  const { width } = useWindowDimensions();
  const { data, error, isPending, refetch, isRefetching } = useAnimals(activeFilters);
  const { profile } = useAuth();
  const { error: favoritesError } = useFavorites();
  const isWideLayout = width >= 900;
  const hasActiveFilters = Object.values(activeFilters).some(Boolean);
  const prioritizedData = [...(data ?? [])].sort((first, second) =>
    locationScore(second, profile?.city, profile?.state) - locationScore(first, profile?.city, profile?.state),
  );
  const filteredData = filterAnimalsBySearch(prioritizedData, searchText);
  const hasRegionalPriority = Boolean(profile?.city || profile?.state) && !activeFilters.city && !activeFilters.state;
  const showEmptyResults = !isPending && !error && Boolean(data?.length) && filteredData.length === 0;
  const showNoAnimals = !isPending && !error && data?.length === 0;

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

  function clearSearchAndFilters() {
    setSearchText("");
    clearFilters();
  }

  function applyQuickSpecies(species: AnimalSpecies) {
    setActiveFilters((current) => ({ ...current, species: current.species === species ? undefined : species }));
    setDraftFilters((current) => ({ ...current, species: current.species === species ? undefined : species }));
  }

  function applyNearbyFilter() {
    if (!profile?.city && !profile?.state) return;
    if (isNearbyFilterActive(activeFilters, profile.city, profile.state)) {
      setActiveFilters((current) => ({ ...current, city: undefined, state: undefined }));
      setDraftFilters((current) => ({ ...current, city: "", state: "" }));
      return;
    }
    const city = profile.city?.trim() || undefined;
    const state = profile.state?.trim().toUpperCase() || undefined;
    setActiveFilters((current) => ({ ...current, city, state }));
    setDraftFilters((current) => ({ ...current, city: city ?? "", state: state ?? "" }));
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.heading}>
          <Text style={styles.title}>Encontre seu novo amigo</Text>
          <Text style={styles.subtitle}>Conheça animais que estão à procura de um lar.</Text>
          {hasRegionalPriority ? (
            <Text style={styles.regionalNote}>Anúncios mais próximos de {profile?.city || profile?.state} aparecem primeiro.</Text>
          ) : null}
        </View>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            accessibilityLabel="Buscar animais por nome, raça ou cidade"
            autoCapitalize="none"
            onChangeText={setSearchText}
            placeholder="Buscar por nome, raça ou cidade"
            returnKeyType="search"
            style={styles.searchInput}
            value={searchText}
          />
          {searchText ? (
            <Pressable
              accessibilityLabel="Limpar busca"
              accessibilityRole="button"
              onPress={() => setSearchText("")}
              style={styles.clearSearchButton}
            >
              <Text style={styles.clearSearchText}>×</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.quickBar}>
          <View>
            <Text style={styles.quickLabel}>Animais disponíveis</Text>
            <Text style={styles.quickHint}>
              {searchText.trim()
                ? isPending ? "Buscando..." : `${filteredData.length} ${filteredData.length === 1 ? "resultado" : "resultados"}`
                : hasActiveFilters ? "Filtros aplicados" : "Veja todos os anúncios"}
            </Text>
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
          <FilterChoice label="Todos" selected={!hasActiveFilters} onPress={clearFilters} />
          <FilterChoice
            label="Cachorros"
            selected={activeFilters.species === "cachorro"}
            onPress={() => applyQuickSpecies("cachorro")}
          />
          <FilterChoice
            label="Gatos"
            selected={activeFilters.species === "gato"}
            onPress={() => applyQuickSpecies("gato")}
          />
          <FilterChoice
            label="Perto de mim"
            selected={isNearbyFilterActive(activeFilters, profile?.city, profile?.state)}
            disabled={!profile?.city && !profile?.state}
            onPress={applyNearbyFilter}
          />
        </View>
        {!profile?.city && !profile?.state ? (
          <View style={styles.nearbyPrompt}>
            <Text style={styles.nearbyHint}>Filtre os anúncios pela sua região.</Text>
            <Link href="/account" asChild>
              <Pressable accessibilityRole="link" style={styles.locationLink}>
                <Text style={styles.locationLinkText}>Adicionar minha cidade</Text>
              </Pressable>
            </Link>
          </View>
        ) : null}
        {favoritesError ? <StateMessage message={`Não foi possível acessar seus favoritos: ${favoritesError}`} /> : null}

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
              placeholder="Ex.: SP"
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
        {showNoAnimals || showEmptyResults ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>⌕</Text>
          <StateMessage
            message={searchText.trim()
              ? `Nenhum animal corresponde a "${searchText.trim()}".`
              : hasActiveFilters ? "Nenhum animal encontrado com esses filtros." : "Ainda não há animais disponíveis."}
          />
          {hasActiveFilters || searchText.trim() ? (
            <>
              <Text style={styles.emptyHint}>Remova algum filtro ou tente outros termos de busca.</Text>
              <PrimaryButton title="Limpar busca e filtros" variant="secondary" onPress={clearSearchAndFilters} />
            </>
          ) : null}
        </View>
        ) : null}
        {filteredData.length ? (
        <View style={[styles.list, isWideLayout && styles.listGrid]}>
          {filteredData.map((animal) => (
            <View key={animal.id} style={isWideLayout ? styles.gridItem : undefined}>
              <AnimalCard animal={animal} />
            </View>
          ))}
        </View>
        ) : null}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.canvas, flex: 1 },
  container: { backgroundColor: colors.canvas, gap: 14, padding: 20, paddingBottom: 32, width: "100%", maxWidth: 1120, alignSelf: "center" },
  heading: { gap: 6, marginBottom: 4 },
  title: { color: colors.navy, fontSize: 28, fontWeight: "900", letterSpacing: -0.5 },
  subtitle: { color: colors.textSecondary, fontSize: 15, lineHeight: 22 },
  regionalNote: { color: colors.success, fontSize: 13, fontWeight: "700", marginTop: 4 },
  searchBox: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 14, borderWidth: 1, flexDirection: "row", minHeight: 48, paddingHorizontal: 13 },
  searchIcon: { color: colors.violetDark, fontSize: 23, lineHeight: 26, marginRight: 9 },
  searchInput: { color: colors.text, flex: 1, fontSize: 15, minHeight: 46, paddingVertical: 8 },
  clearSearchButton: { alignItems: "center", height: 36, justifyContent: "center", width: 36 },
  clearSearchText: { color: colors.textSecondary, fontSize: 24, lineHeight: 28 },
  quickBar: { alignItems: "center", backgroundColor: colors.lilac, borderColor: "#DED7FF", borderRadius: 18, borderWidth: 1, flexDirection: "row", justifyContent: "space-between", padding: 15 },
  quickLabel: { color: colors.navy, fontSize: 16, fontWeight: "800" },
  quickHint: { color: colors.violetDark, fontSize: 13, marginTop: 3 },
  filterButton: { backgroundColor: colors.violet, borderRadius: 10, paddingHorizontal: 15, paddingVertical: 10 },
  filterButtonText: { color: "#fff", fontSize: 14, fontWeight: "800" },
  quickChoiceRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  nearbyPrompt: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: -8 },
  nearbyHint: { color: colors.textSecondary, fontSize: 13 },
  locationLink: { minHeight: 32, justifyContent: "center", paddingHorizontal: 4 },
  locationLinkText: { color: colors.violetDark, fontSize: 13, fontWeight: "700", textDecorationLine: "underline" },
  filters: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 20, borderWidth: 1, gap: 12, padding: 17, shadowColor: colors.navy, shadowOpacity: 0.06, shadowRadius: 10 },
  filterHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  filterTitle: { color: colors.text, fontSize: 18, fontWeight: "700" },
  filterHint: { color: colors.textSecondary, fontSize: 13, marginTop: 3 },
  clearText: { color: colors.violetDark, fontSize: 14, fontWeight: "700", padding: 8 },
  filterLabel: { color: colors.navyLight, fontSize: 14, fontWeight: "600" },
  choices: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  choice: { backgroundColor: colors.canvas, borderColor: colors.border, borderRadius: 18, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 8 },
  choiceSelected: { backgroundColor: colors.lilac, borderColor: "#BFB3FF" },
  choiceDisabled: { opacity: 0.55 },
  choiceText: { color: colors.textSecondary, fontSize: 14 },
  choiceTextSelected: { color: colors.violetDark, fontWeight: "700" },
  choiceTextDisabled: { color: colors.textSecondary },
  locationFilters: { flexDirection: "row", gap: 10 },
  cityInput: { flex: 1 },
  stateInput: { width: 84 },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 10, borderWidth: 1, color: colors.text, height: 44, marginTop: 6, paddingHorizontal: 12 },
  list: { gap: 12 },
  listGrid: { alignItems: "stretch", flexDirection: "row", flexWrap: "wrap" },
  gridItem: { flexBasis: "48%", flexGrow: 1, minWidth: 280 },
  emptyState: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 20, borderWidth: 1, gap: 8, padding: 22 },
  emptyIcon: { color: colors.pink, fontSize: 34, fontWeight: "800" },
  emptyHint: { color: colors.textSecondary, fontSize: 14, lineHeight: 20, textAlign: "center" },
  pressed: { opacity: 0.8 },
});

function locationScore(animal: { city: string | null; state: string | null }, city?: string | null, state?: string | null): number {
  const sameCity = Boolean(city && animal.city && city.trim().toLocaleLowerCase("pt-BR") === animal.city.trim().toLocaleLowerCase("pt-BR"));
  const sameState = Boolean(state && animal.state && state.trim().toUpperCase() === animal.state.trim().toUpperCase());
  if (sameCity) return 2;
  if (sameState) return 1;
  return 0;
}

function FilterChoice({ label, selected, disabled = false, onPress }: {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.choice, selected && styles.choiceSelected, disabled && styles.choiceDisabled]}
    >
      <Text style={[styles.choiceText, selected && styles.choiceTextSelected, disabled && styles.choiceTextDisabled]}>{label}</Text>
    </Pressable>
  );
}

function isNearbyFilterActive(filters: AnimalFilters, city?: string | null, state?: string | null): boolean {
  if (!city && !state) return false;
  const sameCity = city
    ? filters.city?.trim().toLocaleLowerCase("pt-BR") === city.trim().toLocaleLowerCase("pt-BR")
    : !filters.city;
  const sameState = state
    ? filters.state?.trim().toUpperCase() === state.trim().toUpperCase()
    : !filters.state;
  return Boolean(filters.city || filters.state) && sameCity && sameState;
}
