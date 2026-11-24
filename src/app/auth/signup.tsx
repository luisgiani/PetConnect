import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router, Stack } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { AuthField } from "@/components/AuthField";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/features/auth/AuthProvider";
import { formatBrazilPhone, onlyLettersAndSpaces, phoneDigits } from "@/features/auth/profile.formatters";
import { signUpSchema, type SignUpFormInput } from "@/features/auth/schemas/auth.schema";
import type { ProfileType } from "@/features/auth/types";
import { getAuthErrorMessage } from "@/features/auth/auth-error";
import { colors } from "@/theme/colors";

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
        name: input.name.trim(),
        phone: phoneDigits(input.phone) || null,
      });
      if (needsConfirmation) {
        router.replace({ pathname: "/auth/confirmation", params: { email: input.email } });
      } else {
        router.replace("/animals");
      }
    } catch (error) {
      setSubmitError(getAuthErrorMessage(error, "Não foi possível criar a conta."));
    }
  });

  return (
    <>
      <Stack.Screen options={{ title: "Criar conta" }} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Criar conta</Text>
        <Text style={styles.intro}>Confirme seu e-mail para ativar a conta.</Text>
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
            <AuthField autoCapitalize="words" label="Nome" onBlur={onBlur} onChangeText={(text) => onChange(onlyLettersAndSpaces(text))} value={value} error={errors.name?.message} />
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
              <AuthField keyboardType="phone-pad" label="Telefone para contato" onBlur={onBlur} onChangeText={(text) => onChange(formatBrazilPhone(text))} value={value} error={errors.phone?.message} />
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
  title: { color: colors.navy, fontSize: 27, fontWeight: "900" },
  intro: { color: colors.textSecondary, lineHeight: 22 },
  notice: { color: colors.warningText, backgroundColor: colors.warningSurface, borderRadius: 10, lineHeight: 21, padding: 12 },
  field: { gap: 8 },
  label: { color: colors.navy, fontSize: 15, fontWeight: "700" },
  options: { flexDirection: "row", gap: 10 },
  option: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 12, borderWidth: 1, flex: 1, padding: 13 },
  optionSelected: { backgroundColor: colors.lilac, borderColor: "#BFB3FF" },
  optionText: { color: colors.textSecondary, textAlign: "center" },
  optionTextSelected: { color: colors.violetDark, fontWeight: "700" },
  error: { color: colors.danger, lineHeight: 21 },
  footer: { color: colors.textSecondary, textAlign: "center" },
  link: { color: colors.violetDark, fontWeight: "700", textAlign: "center" },
});
