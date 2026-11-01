import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/features/auth/AuthProvider";

const emailOtpTypes: readonly string[] = ["signup", "email"];

function isEmailOtpType(value: string): value is "signup" | "email" {
  return emailOtpTypes.includes(value);
}

function getString(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function AuthCallbackScreen() {
  const auth = useAuth();
  const params = useLocalSearchParams<{ code?: string | string[]; token_hash?: string | string[]; type?: string | string[]; error_description?: string | string[] }>();
  const [message, setMessage] = useState("Confirmando seu e-mail...");
  const [error, setError] = useState<string | null>(null);
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    const code = getString(params.code);
    const tokenHash = getString(params.token_hash);
    const type = getString(params.type);
    const authError = getString(params.error_description);
    if (authError) {
      processed.current = true;
      setError(authError);
      setMessage("Não foi possível confirmar o e-mail.");
      return;
    }

    if (!code && !(tokenHash && type && isEmailOtpType(type))) {
      if (auth.loading) return;
      processed.current = true;
      if (auth.session) {
        setMessage("E-mail confirmado. Abrindo sua conta...");
        router.replace("/account");
      } else {
        setError("Não foi possível obter uma sessão. Tente entrar com seu e-mail e senha.");
        setMessage("A confirmação terminou sem iniciar uma sessão.");
      }
      return;
    }

    processed.current = true;
    void (async () => {
      try {
        if (code) {
          await auth.exchangeCodeForSession(code);
        } else if (tokenHash && type && isEmailOtpType(type)) {
          await auth.verifyEmailToken(tokenHash, type);
        } else {
          throw new Error("O link de confirmação está incompleto ou expirou.");
        }
        setMessage("E-mail confirmado. Abrindo seu perfil...");
        router.replace("/account");
      } catch (callbackError) {
        setError(callbackError instanceof Error ? callbackError.message : "Não foi possível confirmar o e-mail.");
        setMessage("Não foi possível confirmar o e-mail.");
      }
    })();
  }, [auth, auth.loading, auth.session, params.code, params.error_description, params.token_hash, params.type]);

  return (
    <>
      <Stack.Screen options={{ title: "Confirmação de e-mail" }} />
      <View style={styles.container}>
        <Text style={styles.title}>{message}</Text>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {error ? <PrimaryButton title="Ir para entrar" onPress={() => router.replace("/auth/login")} /> : null}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 18, justifyContent: "center", padding: 24, width: "100%", maxWidth: 560, alignSelf: "center" },
  title: { color: "#b85c38", fontSize: 23, fontWeight: "800" },
  error: { color: "#b3261e", lineHeight: 22 },
});

