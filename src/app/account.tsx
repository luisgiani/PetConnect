import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router, Stack } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { AuthField } from "@/components/AuthField";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/features/auth/AuthProvider";
import { formatBrazilPhone, onlyLetters, onlyLettersAndSpaces, phoneDigits } from "@/features/auth/profile.formatters";
import { profileSchema, type ProfileFormInput } from "@/features/auth/schemas/profile.schema";

export default function AccountScreen() {
  const auth = useAuth();
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProfileFormInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", phone: "", city: "", state: "", bio: "" },
  });

  useEffect(() => {
    if (!auth.profile) return;
    reset({
      name: auth.profile.name,
      phone: formatBrazilPhone(auth.profile.phone ?? ""),
      city: auth.profile.city ?? "",
      state: auth.profile.state ?? "",
      bio: auth.profile.bio ?? "",
    });
  }, [auth.profile, reset]);

  async function onSignOut() {
    setSignOutError(null);
    try {
      await auth.signOut();
      router.replace("/");
    } catch (error) {
      setSignOutError(error instanceof Error ? error.message : "Não foi possível sair da conta.");
    }
  }

  const onSave = handleSubmit(async (input) => {
    setSaveMessage(null);
    setSaveError(null);
    const digits = phoneDigits(input.phone);
    if (auth.profile?.profileType === "doador_ong" && digits.length !== 10 && digits.length !== 11) {
      setSaveError("O perfil doador/ONG precisa ter um telefone válido.");
      return;
    }
    try {
      await auth.updateProfile({
        name: input.name.trim(),
        phone: digits || null,
        city: input.city.trim() || null,
        state: input.state.trim().toUpperCase() || null,
        bio: input.bio.trim() || null,
      });
      setSaveMessage("Perfil atualizado com sucesso.");
      setIsEditing(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Não foi possível atualizar o perfil.");
    }
  });

  return (
    <>
      <Stack.Screen options={{ title: "Minha conta" }} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {auth.loading || auth.profileLoading ? <Text style={styles.message}>Carregando conta...</Text> : null}
        {!auth.available ? <Text style={styles.message}>A autenticação está disponível quando o app estiver configurado para usar o Supabase.</Text> : null}
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
            {!isEditing ? (
              <View style={styles.profileCard}>
                <Text style={styles.profileValue}>Telefone: {auth.profile.phone || "Não informado"}</Text>
                <Text style={styles.profileValue}>Localização: {formatLocation(auth.profile.city, auth.profile.state)}</Text>
                <Text style={styles.profileValue}>Biografia: {auth.profile.bio || "Não informada"}</Text>
                {saveMessage ? <Text style={styles.success}>{saveMessage}</Text> : null}
                <PrimaryButton title="Editar perfil" onPress={() => {
                  setSaveMessage(null);
                  setSaveError(null);
                  setIsEditing(true);
                }} />
              </View>
            ) : (
              <View style={styles.formCard}>
                <Text style={styles.sectionTitle}>Editar perfil</Text>
                <Controller control={control} name="name" render={({ field }) => (
                  <AuthField label="Nome" autoCapitalize="words" value={field.value} onBlur={field.onBlur} onChangeText={(value) => field.onChange(onlyLettersAndSpaces(value))} error={errors.name?.message} />
                )} />
                <Controller control={control} name="phone" render={({ field }) => (
                  <AuthField label="Telefone" keyboardType="phone-pad" value={field.value} onBlur={field.onBlur} onChangeText={(value) => field.onChange(formatBrazilPhone(value))} error={errors.phone?.message} />
                )} />
                <View style={styles.locationRow}>
                  <View style={styles.cityField}>
                    <Controller control={control} name="city" render={({ field }) => (
                      <AuthField label="Cidade" autoCapitalize="words" value={field.value} onBlur={field.onBlur} onChangeText={(value) => field.onChange(onlyLettersAndSpaces(value))} error={errors.city?.message} />
                    )} />
                  </View>
                  <View style={styles.stateField}>
                    <Controller control={control} name="state" render={({ field }) => (
                      <AuthField label="UF" autoCapitalize="characters" maxLength={2} value={field.value} onBlur={field.onBlur} onChangeText={(value) => field.onChange(onlyLetters(value))} error={errors.state?.message} />
                    )} />
                  </View>
                </View>
                <Controller control={control} name="bio" render={({ field }) => (
                  <AuthField label="Biografia (opcional)" multiline numberOfLines={4} textAlignVertical="top" value={field.value} onBlur={field.onBlur} onChangeText={field.onChange} error={errors.bio?.message} />
                )} />
                {saveError ? <Text accessibilityRole="alert" style={styles.error}>{saveError}</Text> : null}
                <PrimaryButton title={isSubmitting ? "Salvando..." : "Salvar alterações"} onPress={() => void onSave()} disabled={isSubmitting} />
                <PrimaryButton title="Cancelar" variant="secondary" onPress={() => {
                  reset();
                  setSaveMessage(null);
                  setSaveError(null);
                  setIsEditing(false);
                }} disabled={isSubmitting} />
              </View>
            )}
            {auth.profile.profileType === "doador_ong" ? (
              <Link href="/animals/manage" asChild><PrimaryButton title="Gerenciar meus anúncios" variant="secondary" /></Link>
            ) : null}
            <PrimaryButton title="Sair da conta" onPress={() => void onSignOut()} />
          </>
        ) : null}
        {auth.error ? <Text accessibilityRole="alert" style={styles.error}>{auth.error}</Text> : null}
        {signOutError ? <Text accessibilityRole="alert" style={styles.error}>{signOutError}</Text> : null}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16, padding: 24, width: "100%", maxWidth: 560, alignSelf: "center" },
  title: { color: "#b85c38", fontSize: 27, fontWeight: "800" },
  message: { color: "#604b45", fontSize: 16, lineHeight: 23 },
  formCard: { backgroundColor: "#fff", borderColor: "#ead8cd", borderRadius: 16, borderWidth: 1, gap: 14, padding: 16 },
  profileCard: { backgroundColor: "#fff", borderColor: "#ead8cd", borderRadius: 16, borderWidth: 1, gap: 10, padding: 16 },
  sectionTitle: { color: "#3f2d2a", fontSize: 20, fontWeight: "800" },
  profileValue: { color: "#604b45", fontSize: 15, lineHeight: 22 },
  locationRow: { flexDirection: "row", gap: 10 },
  cityField: { flex: 1 },
  stateField: { width: 84 },
  success: { color: "#31705b", lineHeight: 22 },
  error: { color: "#b3261e", lineHeight: 22 },
});

function formatLocation(city: string | null, state: string | null): string {
  if (city && state) return `${city} - ${state}`;
  return city || state || "Não informada";
}

