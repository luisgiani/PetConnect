import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/features/auth/AuthProvider";

export default function HomeScreen() {
  const { loading, session } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>Pet<Text style={styles.brandAccent}>Connect</Text></Text>
      <Text style={styles.illustration}>🐶　🐱</Text>
      <Text style={styles.tagline}>Conectando corações,{`\n`}mudando vidas.</Text>
      <Link href="/animals" asChild>
        <PrimaryButton title="🐾  Adotar um animal" />
      </Link>
      <Link href="/animals/new" asChild>
        <PrimaryButton title="＋  Cadastrar animal" variant="secondary" />
      </Link>
      {!loading ? (
        <Link href={session ? "/account" : "/auth/login"} style={styles.accountLink}>
          {session ? "Minha conta" : "Entrar ou criar conta"}
        </Link>
      ) : null}
      <Text style={styles.note}>Uma nova história pode começar hoje.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    gap: 18,
  },
  brand: { color: "#593a8a", fontSize: 42, fontWeight: "800" },
  brandAccent: { color: "#d56c9b" },
  illustration: { fontSize: 72, marginVertical: 12 },
  tagline: { color: "#493d57", fontSize: 20, lineHeight: 29, textAlign: "center" },
  note: { color: "#766d7e", fontSize: 14, marginTop: 14 },
  accountLink: { color: "#593a8a", fontSize: 15, fontWeight: "700", padding: 8 },
});
