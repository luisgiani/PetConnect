import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Redirect, Stack, usePathname } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { HeaderHomeButton } from "@/components/HeaderHomeButton";
import { BrandHeaderLogo } from "@/components/BrandHeaderLogo";
import { AuthProvider, useAuth } from "@/features/auth/AuthProvider";
import { FavoritesProvider } from "@/features/animals/FavoritesProvider";
import { BottomNavigation } from "@/components/BottomNavigation";
import { getProfileHomeRoute, getRoleRedirect } from "@/features/auth/role-navigation";
import { colors } from "@/theme/colors";

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
        <FavoritesProvider>
          <StatusBar style="dark" />
          <RootNavigator />
        </FavoritesProvider>
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
        <ActivityIndicator color={colors.violet} />
        <Text style={styles.loadingText}>Verificando sua sessão...</Text>
      </View>
    );
  }
  if (!auth.session && !isPublicRoute) return <Redirect href="/auth/login" />;
  if (auth.session && auth.profileLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.violet} />
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
        <Text style={styles.loadingText}>Não foi possível carregar seu perfil. Tente novamente em instantes.</Text>
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

  const showBottomNavigation = Boolean(auth.session && auth.profile) && !pathname.startsWith("/auth/");

  return (
    <View style={styles.navigator}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.navy,
          headerTitleStyle: { fontWeight: "700" },
          headerRight: () => <HeaderHomeButton />,
          contentStyle: { backgroundColor: colors.canvas },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="animals/index"
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen name="animals/new" options={{ title: "Cadastrar animal", headerRight: () => null }} />
        <Stack.Screen
          name="animals/manage"
          options={{ title: "", headerTitle: "", headerBackVisible: false, headerLeft: () => <BrandHeaderLogo />, headerRight: () => null, gestureEnabled: false }}
        />
        <Stack.Screen name="animals/[id]" options={{ title: "Detalhes do animal", headerRight: () => null }} />
        <Stack.Screen
          name="favorites"
          options={{ title: "Favoritos", headerBackVisible: false, headerLeft: () => null, headerRight: () => null }}
        />
        <Stack.Screen
          name="account"
          options={{ title: "Perfil", headerBackVisible: false, headerLeft: () => null, headerRight: () => null }}
        />
        <Stack.Screen name="auth/login" options={{ title: "Entrar", headerShown: false }} />
        <Stack.Screen name="auth/signup" options={{ title: "Criar conta" }} />
        <Stack.Screen name="auth/confirmation" options={{ title: "Confirme seu e-mail" }} />
        <Stack.Screen name="auth/callback" options={{ title: "Confirmação de e-mail" }} />
      </Stack>
      {showBottomNavigation ? <BottomNavigation /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  navigator: { backgroundColor: colors.canvas, flex: 1 },
  loading: { alignItems: "center", backgroundColor: colors.canvas, flex: 1, gap: 12, justifyContent: "center" },
  loadingText: { color: colors.textSecondary, fontSize: 15 },
});
