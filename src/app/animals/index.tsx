import { Link } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { AnimalCard } from "@/components/AnimalCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { StateMessage } from "@/components/StateMessage";
import { useAnimals } from "@/features/animals/hooks/useAnimals";

export default function AnimalsScreen() {
  const { data, error, isPending, refetch, isRefetching } = useAnimals();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heading}>
        <Text style={styles.title}>Encontre seu novo amigo</Text>
        <Text style={styles.subtitle}>Conheça os animais que estão esperando por um lar.</Text>
      </View>

      {isPending ? <StateMessage message="Carregando animais..." loading /> : null}
      {error ? (
        <View>
          <StateMessage message={`Não foi possível carregar os animais: ${error.message}`} />
          <PrimaryButton title="Tentar novamente" onPress={() => void refetch()} disabled={isRefetching} />
        </View>
      ) : null}
      {!isPending && !error && data?.length === 0 ? (
        <StateMessage message="Ainda não há animais disponíveis. Volte em breve!" />
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
  list: { gap: 12 },
});
