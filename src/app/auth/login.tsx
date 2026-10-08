import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router, Stack, useLocalSearchParams } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AuthField } from "@/components/AuthField";
import { PrimaryButton } from "@/components/PrimaryButton";
import { signInSchema, type SignInFormInput } from "@/features/auth/schemas/auth.schema";
import { useAuth } from "@/features/auth/AuthProvider";

export default function LoginScreen() {
  const auth = useAuth();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignInFormInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (input) => {
    setSubmitError(null);
    try {
      await auth.signIn(input);
      router.replace(returnTo === "/animals/new" ? "/animals/new" : "/account");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Não foi possível entrar.");
    }
  });

  return (
    <>
      <Stack.Screen options={{ title: "Entrar" }} />
      <View style={styles.container}>
        <Text style={styles.title}>Bem-vindo de volta</Text>
        {!auth.available ? (
          <Text accessibilityRole="alert" style={styles.notice}>
            Para usar contas, defina EXPO_PUBLIC_DATA_SOURCE=supabase e configure as credenciais no .env.
          </Text>
        ) : null}
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <AuthField autoComplete="email" keyboardType="email-address" label="E-mail" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.email?.message} />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <AuthField autoComplete="current-password" label="Senha" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.password?.message} secureTextEntry />
          )}
        />
        {submitError ? <Text accessibilityRole="alert" style={styles.error}>{submitError}</Text> : null}
        {auth.error ? <Text accessibilityRole="alert" style={styles.error}>{auth.error}</Text> : null}
        <PrimaryButton title={isSubmitting ? "Entrando..." : "Entrar"} onPress={() => void onSubmit()} disabled={!auth.available || isSubmitting} />
        <Text style={styles.footer}>Ainda não tem uma conta?</Text>
        <Link href="/auth/signup" style={styles.link}>Criar conta</Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 18, justifyContent: "center", padding: 24, width: "100%", maxWidth: 560, alignSelf: "center" },
  title: { color: "#593a8a", fontSize: 27, fontWeight: "800" },
  notice: { color: "#7a5100", backgroundColor: "#fff2cc", borderRadius: 10, lineHeight: 21, padding: 12 },
  error: { color: "#b3261e", lineHeight: 21 },
  footer: { color: "#62596a", textAlign: "center" },
  link: { color: "#593a8a", fontWeight: "700", textAlign: "center" },
});
