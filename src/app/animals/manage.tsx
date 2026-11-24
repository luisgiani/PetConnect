import { Link, Stack } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { AnimalCard } from "@/components/AnimalCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { StateMessage } from "@/components/StateMessage";
import { useMyAnimals, useSetAnimalStatus } from "@/features/animals/hooks/useAnimals";
import type { AnimalStatus } from "@/features/animals/types";
import { useAuth } from "@/features/auth/AuthProvider";
import { colors } from "@/theme/colors";

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
      <Stack.Screen options={{ title: "" }} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.heading}>
          <Text style={styles.title}>Meus anúncios</Text>
          <Text style={styles.subtitle}>Gerencie os animais publicados pela sua conta.</Text>
        </View>
        {animalsQuery.data ? (
          <View style={styles.summaryRow}>
            <SummaryCard
              label="Disponíveis"
              value={animals.filter((animal) => animal.status === "available").length}
              tone="available"
            />
            <SummaryCard
              label="Adotados"
              value={animals.filter((animal) => animal.status === "adopted").length}
              tone="adopted"
            />
          </View>
        ) : null}
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
            <Text style={styles.emptyIcon}>♡</Text>
            <Text style={styles.emptyTitle}>Sua jornada começa aqui</Text>
            <StateMessage message="Você ainda não publicou nenhum animal para adoção." />
            <Link href="/animals/new" asChild>
              <PrimaryButton title="Cadastrar animal para adoção" />
            </Link>
          </View>
        ) : null}

        {animals.length > 0 ? (
          <Link href="/animals/new" asChild>
            <PrimaryButton title="＋  Cadastrar animal" variant="secondary" />
          </Link>
        ) : null}

        {animals.map((animal) => (
          <View key={animal.id} style={styles.item}>
            <AnimalCard animal={animal} interactive={false} />
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
  title: { color: colors.navy, fontSize: 24, fontWeight: "900" },
  subtitle: { color: colors.textSecondary, fontSize: 15, lineHeight: 22 },
  summaryRow: { flexDirection: "row", gap: 10 },
  summaryCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 16, borderWidth: 1, flex: 1, gap: 5, padding: 14 },
  summaryLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: "600" },
  summaryValue: { fontSize: 24, fontWeight: "900" },
  summaryAvailable: { color: colors.success },
  summaryAdopted: { color: colors.violetDark },
  item: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 16, borderWidth: 1, gap: 12, padding: 10 },
  statusRow: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: 8 },
  status: { borderRadius: 14, fontSize: 13, fontWeight: "700", marginRight: "auto", overflow: "hidden", paddingHorizontal: 10, paddingVertical: 6 },
  available: { backgroundColor: colors.successSurface, color: colors.success },
  adopted: { backgroundColor: colors.lilac, color: colors.violetDark },
  error: { color: colors.danger, lineHeight: 21 },
  emptyIcon: { color: colors.pink, fontSize: 44, fontWeight: "700", textAlign: "center" },
  emptyTitle: { color: colors.navy, fontSize: 21, fontWeight: "900", textAlign: "center" },
});

function SummaryCard({ label, value, tone }: {
  label: string;
  value: number;
  tone: "available" | "adopted";
}) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, tone === "available" ? styles.summaryAvailable : styles.summaryAdopted]}>
        {value}
      </Text>
    </View>
  );
}
