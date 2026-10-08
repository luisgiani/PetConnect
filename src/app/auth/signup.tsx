import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router, Stack } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { AuthField } from "@/components/AuthField";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/features/auth/AuthProvider";
import { signUpSchema, type SignUpFormInput } from "@/features/auth/schemas/auth.schema";
import type { ProfileType } from "@/features/auth/types";

const profileOptions: { value: ProfileType; label: string }[] = [
  { value: "adotante", label: "Adotante" },
  { value: "doador_ong", label: "Doador/ONG" },
];

export default function SignUpScreen() {
  const auth = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { control, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<SignUpFormInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "", profileType: "adotante", phone: "" },
  });
  const profileType = watch("profileType");

  const onSubmit = handleSubmit(async (input) => {
    setSubmitError(null);
    try {
      const needsConfirmation = await auth.signUp({
        ...input,
        phone: input.phone.trim() || null,
      });
      if (needsConfirmation) {
        router.replace({ pathname: "/auth/confirmation", params: { email: input.email } });
      } else {
        router.replace("/account");
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Não foi possível criar a conta.");
    }
  });

  return (
    <>
      <Stack.Screen options={{ title: "Criar conta" }} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Criar conta</Text>
        <Text style={styles.intro}>Você precisará confirmar seu e-mail antes de acessar a conta.</Text>
        {!auth.available ? (
          <Text accessibilityRole="alert" style={styles.notice}>
            Para habilitar o cadastro, defina EXPO_PUBLIC_DATA_SOURCE=supabase e configure as credenciais no .env.
          </Text>
        ) : null}

        <View style={styles.field}>
          <Text style={styles.label}>Tipo de perfil</Text>
          <View style={styles.options}>
            {profileOptions.map((option) => {
              const selected = option.value === profileType;
              return (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  key={option.value}
                  onPress={() => setValue("profileType", option.value, { shouldValidate: true })}
                  style={[styles.option, selected && styles.optionSelected]}
                >
                  <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <AuthField autoCapitalize="words" label="Nome" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.name?.message} />
          )}
        />
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
            <AuthField autoComplete="new-password" label="Senha (mínimo de 8 caracteres)" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.password?.message} secureTextEntry />
          )}
        />
        {profileType === "doador_ong" ? (
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <AuthField keyboardType="phone-pad" label="Telefone para contato" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.phone?.message} />
            )}
          />
        ) : null}
        {submitError ? <Text accessibilityRole="alert" style={styles.error}>{submitError}</Text> : null}
        {auth.error ? <Text accessibilityRole="alert" style={styles.error}>{auth.error}</Text> : null}
        <PrimaryButton title={isSubmitting ? "Criando conta..." : "Criar conta"} onPress={() => void onSubmit()} disabled={!auth.available || isSubmitting} />
        <Text style={styles.footer}>Já tem uma conta?</Text>
        <Link href="/auth/login" style={styles.link}>Entrar</Link>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { gap: 17, padding: 24, width: "100%", maxWidth: 560, alignSelf: "center" },
  title: { color: "#593a8a", fontSize: 27, fontWeight: "800" },
  intro: { color: "#62596a", lineHeight: 22 },
  notice: { color: "#7a5100", backgroundColor: "#fff2cc", borderRadius: 10, lineHeight: 21, padding: 12 },
  field: { gap: 8 },
  label: { color: "#30283a", fontSize: 15, fontWeight: "700" },
  options: { flexDirection: "row", gap: 10 },
  option: { backgroundColor: "#fff", borderColor: "#e5dce9", borderRadius: 10, borderWidth: 1, flex: 1, padding: 13 },
  optionSelected: { backgroundColor: "#f0e8ff", borderColor: "#b69bdf" },
  optionText: { color: "#62596a", textAlign: "center" },
  optionTextSelected: { color: "#593a8a", fontWeight: "700" },
  error: { color: "#b3261e", lineHeight: 21 },
  footer: { color: "#62596a", textAlign: "center" },
  link: { color: "#593a8a", fontWeight: "700", textAlign: "center" },
});
