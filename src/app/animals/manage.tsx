import { Link, Stack } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { AnimalCard } from "@/components/AnimalCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { StateMessage } from "@/components/StateMessage";
import { useMyAnimals, useSetAnimalStatus } from "@/features/animals/hooks/useAnimals";
import type { AnimalStatus } from "@/features/animals/types";
import { useAuth } from "@/features/auth/AuthProvider";

export default function ManageAnimalsScreen() {
  const auth = useAuth();
  const isDemo = !auth.available;
  const isDonor = auth.profile?.profileType === "doador_ong";
  const canLoadAnimals = isDemo || Boolean(auth.session && isDonor);
  const animalsQuery = useMyAnimals(canLoadAnimals);
  const updateStatus = useSetAnimalStatus();
  const [actionError, setActionError] = useState<string | null>(null);

  async function changeStatus(id: string, status: AnimalStatus) {
    setActionError(null);
    try {
      await updateStatus.mutateAsync({ id, status });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Não foi possível atualizar o anúncio.");
    }
  }

  if (auth.available && (auth.loading || auth.profileLoading)) {
    return <StateMessage message="Verificando sua conta..." loading />;
  }
  if (auth.available && !auth.session) {
    return (
      <View style={styles.stateContainer}>
        <StateMessage message="Entre na sua conta de doador/ONG para gerenciar os anúncios." />
        <Link href="/auth/login" asChild><PrimaryButton title="Entrar" /></Link>
      </View>
    );
  }
  if (auth.available && !isDonor) {
    return <View style={styles.stateContainer}><StateMessage message="A área de anúncios é exclusiva para perfis de doador/ONG." /></View>;
  }

  const animals = animalsQuery.data ?? [];

  return (
    <>
      <Stack.Screen options={{ title: "Meus anúncios" }} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.heading}>
          <Text style={styles.title}>Meus anúncios</Text>
          <Text style={styles.subtitle}>Gerencie os animais publicados pela sua conta.</Text>
        </View>
        <Link href="/animals/new" asChild>
          <PrimaryButton title="＋  Cadastrar animal" variant="secondary" />
        </Link>

        {animalsQuery.isPending ? <StateMessage message="Carregando seus anúncios..." loading /> : null}
        {animalsQuery.error ? (
          <View style={styles.stateContainer}>
            <StateMessage message={`Não foi possível carregar seus anúncios: ${animalsQuery.error.message}`} />
            <PrimaryButton title="Tentar novamente" onPress={() => void animalsQuery.refetch()} disabled={animalsQuery.isRefetching} />
          </View>
        ) : null}
        {actionError ? <Text accessibilityRole="alert" style={styles.error}>{actionError}</Text> : null}
        {animalsQuery.data && animals.length === 0 ? (
          <View style={styles.stateContainer}>
            <StateMessage message="Você ainda não publicou nenhum animal." />
          </View>
        ) : null}

        {animals.map((animal) => (
          <View key={animal.id} style={styles.item}>
            <AnimalCard animal={animal} />
            <View style={styles.statusRow}>
              <Text style={[styles.status, animal.status === "available" ? styles.available : styles.adopted]}>
                {animal.status === "available" ? "Disponível" : "Adotado"}
              </Text>
              <Link href={{ pathname: "/animals/new", params: { animalId: animal.id } }} asChild>
                <PrimaryButton title="Editar" variant="secondary" disabled={updateStatus.isPending} />
              </Link>
              <PrimaryButton
                title={animal.status === "available" ? "Marcar adotado" : "Reabrir anúncio"}
                onPress={() => void changeStatus(animal.id, animal.status === "available" ? "adopted" : "available")}
                disabled={updateStatus.isPending}
              />
            </View>
          </View>
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16, padding: 20, width: "100%", maxWidth: 760, alignSelf: "center" },
  stateContainer: { gap: 14, padding: 20, width: "100%", maxWidth: 560, alignSelf: "center" },
  heading: { gap: 6, marginBottom: 4 },
  title: { color: "#3f2d2a", fontSize: 24, fontWeight: "800" },
  subtitle: { color: "#88756d", fontSize: 15, lineHeight: 22 },
  item: { backgroundColor: "#fff", borderColor: "#ead8cd", borderRadius: 16, borderWidth: 1, gap: 12, padding: 10 },
  statusRow: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: 8 },
  status: { borderRadius: 14, fontSize: 13, fontWeight: "700", marginRight: "auto", overflow: "hidden", paddingHorizontal: 10, paddingVertical: 6 },
  available: { backgroundColor: "#e6f3eb", color: "#31705b" },
  adopted: { backgroundColor: "#ffe8dc", color: "#b85c38" },
  error: { color: "#b3261e", lineHeight: 21 },
});

