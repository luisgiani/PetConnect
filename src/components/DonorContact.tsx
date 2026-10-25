import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/features/auth/AuthProvider";

type DonorContactProps = {
  donorName: string | null;
  donorPhone: string | null;
  contactError?: string | null;
  returnTo?: string;
};

export function DonorContact({ donorName, donorPhone, contactError, returnTo = "/animals" }: DonorContactProps) {
  const auth = useAuth();
  const requiresLogin = auth.available && !auth.session;

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
        <Text style={styles.text}>Nome: {donorName}</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#f0e8ff", borderRadius: 12, gap: 6, padding: 12 },
  title: { color: "#30283a", fontSize: 14, fontWeight: "700" },
  text: { color: "#62596a", fontSize: 14 },
  phone: { color: "#593a8a", fontSize: 14, fontWeight: "700", textDecorationLine: "underline" },
  link: { color: "#593a8a", fontSize: 14, fontWeight: "600" },
  error: { color: "#b3261e", fontSize: 14, lineHeight: 20 },
});
