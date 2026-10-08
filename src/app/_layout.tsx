import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/features/auth/AuthProvider";

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
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: "#fffaf4" },
            headerTintColor: "#593a8a",
            headerTitleStyle: { fontWeight: "700" },
            contentStyle: { backgroundColor: "#fffaf4" },
          }}
        >
          <Stack.Screen name="index" options={{ title: "PetConnect" }} />
          <Stack.Screen name="animals/index" options={{ title: "Animais para adoção" }} />
          <Stack.Screen name="animals/new" options={{ title: "Cadastrar animal" }} />
          <Stack.Screen name="animals/[id]" options={{ title: "Detalhes do animal" }} />
          <Stack.Screen name="account" options={{ title: "Minha conta" }} />
          <Stack.Screen name="auth/login" options={{ title: "Entrar" }} />
          <Stack.Screen name="auth/signup" options={{ title: "Criar conta" }} />
          <Stack.Screen name="auth/confirmation" options={{ title: "Confirme seu e-mail" }} />
          <Stack.Screen name="auth/callback" options={{ title: "Confirmação de e-mail" }} />
        </Stack>
      </AuthProvider>
    </QueryClientProvider>
  );
}
