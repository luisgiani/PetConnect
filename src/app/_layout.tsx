import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Redirect, Stack, usePathname } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { HeaderHomeButton } from "@/components/HeaderHomeButton";
import { HeaderAccountButton } from "@/components/HeaderAccountButton";
import { BrandHeaderLogo } from "@/components/BrandHeaderLogo";
import { AuthProvider, useAuth } from "@/features/auth/AuthProvider";
import { getProfileHomeRoute, getRoleRedirect } from "@/features/auth/role-navigation";

export default function RootLayout() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 30_000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function RootNavigator() {
  const auth = useAuth();
  const pathname = usePathname();
  const isPublicRoute = [
    "/auth/login",
    "/auth/signup",
    "/auth/confirmation",
    "/auth/callback",
  ].includes(pathname);
  if (auth.loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#b85c38" />
        <Text style={styles.loadingText}>Verificando sua sessão...</Text>
      </View>
    );
  }
  if (!auth.session && !isPublicRoute) return <Redirect href="/auth/login" />;
  if (auth.session && auth.profileLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#b85c38" />
        <Text style={styles.loadingText}>Carregando seu perfil...</Text>
      </View>
    );
  }
  if (auth.session && !auth.profile && auth.error) return <Redirect href="/account" />;
  if (auth.session && (pathname === "/auth/login" || pathname === "/auth/signup")) {
    return <Redirect href={auth.profile ? getProfileHomeRoute(auth.profile.profileType) : "/account"} />;
  }
  if (auth.session && !auth.profile) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Não foi possível carregar seu perfil. Acesse Minha conta para ver os detalhes.</Text>
      </View>
    );
  }
  if (pathname === "/") {
    return <Redirect href={auth.session && auth.profile ? getProfileHomeRoute(auth.profile.profileType) : "/auth/login"} />;
  }
  if (auth.session && auth.profile) {
    const roleRedirect = getRoleRedirect(auth.profile.profileType, pathname);
    if (roleRedirect) return <Redirect href={roleRedirect} />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#fff8f0" },
        headerTintColor: "#b85c38",
        headerTitleStyle: { fontWeight: "700" },
        headerRight: () => <HeaderHomeButton />,
        contentStyle: { backgroundColor: "#fff8f0" },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="animals/index"
        options={{ title: "Animais para adoção", headerBackVisible: false, headerLeft: () => null, headerRight: () => <HeaderAccountButton />, gestureEnabled: false }}
      />
      <Stack.Screen name="animals/new" options={{ title: "Cadastrar animal" }} />
      <Stack.Screen
        name="animals/manage"
        options={{ title: "", headerTitle: "", headerBackVisible: false, headerLeft: () => <BrandHeaderLogo />, headerRight: () => <HeaderAccountButton />, gestureEnabled: false }}
      />
      <Stack.Screen name="animals/[id]" options={{ title: "Detalhes do animal" }} />
      <Stack.Screen name="account" options={{ title: "Minha conta", headerRight: () => null }} />
      <Stack.Screen name="auth/login" options={{ title: "Entrar", headerShown: false }} />
      <Stack.Screen name="auth/signup" options={{ title: "Criar conta" }} />
      <Stack.Screen name="auth/confirmation" options={{ title: "Confirme seu e-mail" }} />
      <Stack.Screen name="auth/callback" options={{ title: "Confirmação de e-mail" }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loading: { alignItems: "center", backgroundColor: "#fff8f0", flex: 1, gap: 12, justifyContent: "center" },
  loadingText: { color: "#604b45", fontSize: 15 },
});
