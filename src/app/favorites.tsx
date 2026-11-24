import { ScrollView, StyleSheet, Text, View } from "react-native";
import { AnimalCard } from "@/components/AnimalCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { StateMessage } from "@/components/StateMessage";
import { useAnimals } from "@/features/animals/hooks/useAnimals";
import { useFavorites } from "@/features/animals/FavoritesProvider";
import { colors } from "@/theme/colors";

export default function FavoritesScreen() {
  const { favoriteIds, isLoading: favoritesLoading, error: favoritesError } = useFavorites();
  const { data, error, isPending, refetch, isRefetching } = useAnimals();
  const favoriteAnimals = (data ?? []).filter((animal) => favoriteIds.includes(animal.id));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heading}>
        <Text style={styles.kicker}>SUA LISTA</Text>
        <Text style={styles.title}>Animais salvos</Text>
        <Text style={styles.subtitle}>Anúncios que você quer acompanhar.</Text>
      </View>
      {favoritesError ? <StateMessage message={`Não foi possível carregar seus favoritos: ${favoritesError}`} /> : null}
      {error ? (
        <View style={styles.stateContainer}>
          <StateMessage message={`Não foi possível carregar os animais: ${error.message}`} />
          <PrimaryButton title="Tentar novamente" onPress={() => void refetch()} disabled={isRefetching} />
        </View>
      ) : null}
      {(favoritesLoading || isPending) && !error ? <StateMessage message="Carregando seus favoritos..." loading /> : null}
      {!favoritesLoading && !isPending && !error && !favoritesError && favoriteIds.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.heart}>♡</Text>
          <Text style={styles.emptyTitle}>Seus favoritos aparecem aqui</Text>
          <Text style={styles.emptyText}>Toque no coração de um anúncio para salvá-lo e encontrá-lo depois.</Text>
        </View>
      ) : null}
      {!isPending && !error && !favoritesError && favoriteIds.length > 0 && favoriteAnimals.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Nenhum anúncio salvo está disponível</Text>
          <Text style={styles.emptyText}>Os anúncios podem ter sido removidos ou marcados como adotados.</Text>
        </View>
      ) : null}
      {favoriteAnimals.map((animal) => <AnimalCard key={animal.id} animal={animal} />)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { alignSelf: "center", backgroundColor: colors.canvas, gap: 14, maxWidth: 760, padding: 20, width: "100%" },
  heading: { gap: 6, marginBottom: 4 },
  kicker: { color: colors.pink, fontSize: 11, fontWeight: "800", letterSpacing: 1.5 },
  title: { color: colors.navy, fontSize: 28, fontWeight: "900", letterSpacing: -0.5 },
  subtitle: { color: colors.textSecondary, fontSize: 15, lineHeight: 22 },
  stateContainer: { gap: 12 },
  emptyState: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 20, borderWidth: 1, gap: 8, padding: 24 },
  heart: { color: colors.pink, fontSize: 42, fontWeight: "700" },
  emptyTitle: { color: colors.navy, fontSize: 18, fontWeight: "800", textAlign: "center" },
  emptyText: { color: colors.textSecondary, fontSize: 14, lineHeight: 21, textAlign: "center" },
});
