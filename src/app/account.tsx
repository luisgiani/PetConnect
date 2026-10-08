import { Link, router, Stack } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/features/auth/AuthProvider";

export default function AccountScreen() {
  const auth = useAuth();
  const [signOutError, setSignOutError] = useState<string | null>(null);

  async function onSignOut() {
    setSignOutError(null);
    try {
      await auth.signOut();
      router.replace("/");
    } catch (error) {
      setSignOutError(error instanceof Error ? error.message : "Não foi possível sair da conta.");
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: "Minha conta" }} />
      <View style={styles.container}>
        {auth.loading || auth.profileLoading ? <Text style={styles.message}>Carregando conta...</Text> : null}
        {!auth.available ? (
          <Text style={styles.message}>A autenticação está disponível quando o app estiver configurado para usar o Supabase.</Text>
        ) : null}
        {auth.available && !auth.loading && !auth.session ? (
          <>
            <Text style={styles.message}>Entre ou crie uma conta para continuar.</Text>
            <Link href="/auth/login" asChild><PrimaryButton title="Entrar" /></Link>
            <Link href="/auth/signup" asChild><PrimaryButton title="Criar conta" variant="secondary" /></Link>
          </>
        ) : null}
        {auth.profile ? (
          <>
            <Text style={styles.title}>Olá, {auth.profile.name}</Text>
            <Text style={styles.message}>Perfil: {auth.profile.profileType === "doador_ong" ? "Doador/ONG" : "Adotante"}</Text>
            <Text style={styles.message}>{auth.session?.user.email}</Text>
            {auth.profile.profileType === "doador_ong" ? (
              <Text style={styles.message}>Telefone cadastrado: {auth.profile.phone || "Não informado"}</Text>
            ) : null}
            <PrimaryButton title="Sair da conta" onPress={() => void onSignOut()} />
          </>
        ) : null}
        {auth.error ? <Text accessibilityRole="alert" style={styles.error}>{auth.error}</Text> : null}
        {signOutError ? <Text accessibilityRole="alert" style={styles.error}>{signOutError}</Text> : null}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 16, justifyContent: "center", padding: 24, width: "100%", maxWidth: 560, alignSelf: "center" },
  title: { color: "#593a8a", fontSize: 27, fontWeight: "800" },
  message: { color: "#493d57", fontSize: 16, lineHeight: 23 },
  error: { color: "#b3261e", lineHeight: 22 },
});
