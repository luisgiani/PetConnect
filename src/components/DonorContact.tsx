import { Link } from "expo-router";
import { useState } from "react";
import { Linking, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/features/auth/AuthProvider";

type DonorContactProps = {
  donorName: string | null;
  donorPhone: string | null;
  donorCity: string | null;
  donorState: string | null;
  donorBio: string | null;
  contactError?: string | null;
  returnTo?: string;
};

export function DonorContact({
  donorName,
  donorPhone,
  donorCity,
  donorState,
  donorBio,
  contactError,
  returnTo = "/animals",
}: DonorContactProps) {
  const auth = useAuth();
  const requiresLogin = auth.available && !auth.session;
  const [whatsappError, setWhatsappError] = useState<string | null>(null);

  async function openWhatsApp() {
    if (!donorPhone) return;

    setWhatsappError(null);
    const phone = normalizeWhatsAppPhone(donorPhone);
    const message = encodeURIComponent("Olá! Tenho interesse em adotar este animal anunciado no PetConnect.");
    const appUrl = `whatsapp://send?phone=${phone}&text=${message}`;
    const webUrl = `https://web.whatsapp.com/send?phone=${phone}&text=${message}`;

    try {
      if (Platform.OS === "web") {
        await Linking.openURL(webUrl);
        return;
      }

      await Linking.openURL(appUrl);
    } catch {
      try {
        await Linking.openURL(webUrl);
      } catch {
        setWhatsappError("Não foi possível abrir o WhatsApp. Verifique se o aplicativo ou o WhatsApp Web está disponível.");
      }
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contato do responsável</Text>
      {auth.available && auth.loading ? (
        <Text style={styles.text}>Verificando acesso ao contato...</Text>
      ) : requiresLogin ? (
        <Link href={{ pathname: "/auth/login", params: { returnTo } }} style={styles.link}>
          Entre na sua conta para ver o contato.
        </Link>
      ) : contactError ? (
        <Text accessibilityRole="alert" style={styles.error}>
          Não foi possível carregar o contato: {contactError}
        </Text>
      ) : donorName ? (
        <>
          <Text style={styles.text}>Nome: {donorName}</Text>
          {donorCity || donorState ? <Text style={styles.text}>Localização: {formatLocation(donorCity, donorState)}</Text> : null}
          {donorBio ? <Text style={styles.bio}>{donorBio}</Text> : null}
        </>
      ) : (
        <Text style={styles.text}>Contato não disponível.</Text>
      )}
      {!requiresLogin && !auth.loading && donorPhone ? (
        <Link href={`tel:${donorPhone.replace(/[^\d+]/g, "")}`} style={styles.phone}>
          Telefone: {donorPhone}
        </Link>
      ) : !requiresLogin && !auth.loading && donorName ? (
        <Text style={styles.text}>Telefone não informado.</Text>
      ) : null}
      {!requiresLogin && !auth.loading && donorPhone ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Conversar com o responsável pelo WhatsApp"
          onPress={() => void openWhatsApp()}
          style={({ pressed }) => [styles.whatsappButton, pressed && styles.pressed]}
        >
          <Text style={styles.whatsappLabel}>Conversar pelo WhatsApp</Text>
        </Pressable>
      ) : null}
      {whatsappError ? <Text accessibilityRole="alert" style={styles.error}>{whatsappError}</Text> : null}
    </View>
  );
}

function normalizeWhatsAppPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("55") ? digits : `55${digits}`;
}

function formatLocation(city: string | null, state: string | null): string {
  if (city && state) return `${city} - ${state}`;
  return city || state || "";
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#f0e8ff", borderRadius: 12, gap: 6, padding: 12 },
  title: { color: "#30283a", fontSize: 14, fontWeight: "700" },
  text: { color: "#62596a", fontSize: 14 },
  phone: { color: "#593a8a", fontSize: 14, fontWeight: "700", textDecorationLine: "underline" },
  link: { color: "#593a8a", fontSize: 14, fontWeight: "600" },
  error: { color: "#b3261e", fontSize: 14, lineHeight: 20 },
  bio: { color: "#62596a", fontSize: 14, lineHeight: 20, marginTop: 2 },
  whatsappButton: { alignItems: "center", backgroundColor: "#25d366", borderRadius: 10, minHeight: 44, justifyContent: "center", paddingHorizontal: 14 },
  whatsappLabel: { color: "#fff", fontSize: 14, fontWeight: "700" },
  pressed: { opacity: 0.75 },
});
