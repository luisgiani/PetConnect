import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/features/auth/AuthProvider";

export default function HomeScreen() {
  const { loading, session } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.mark}><Text style={styles.markText}>P</Text></View>
        <Text style={styles.brand}>Pet<Text style={styles.brandAccent}>Connect</Text></Text>
        <Text style={styles.eyebrow}>ADOÇÃO COM AFETO</Text>
        <Text style={styles.tagline}>Encontre uma nova amizade{`\n`}para chamar de sua.</Text>
        <Text style={styles.note}>Animais esperando por um lar responsável e cheio de carinho.</Text>
      </View>
      <View style={styles.actions}>
        <Link href="/animals" asChild>
          <PrimaryButton title="Encontrar um animal" />
        </Link>
        <Link href="/animals/new" asChild>
          <PrimaryButton title="Divulgar um animal" variant="secondary" />
        </Link>
      </View>
      {!loading ? (
        <Link href={session ? "/account" : "/auth/login"} style={styles.accountLink}>
          {session ? "Acessar minha conta  →" : "Já tenho uma conta  →"}
        </Link>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    backgroundColor: "#fff8f0",
    gap: 24,
  },
  hero: { alignItems: "center", backgroundColor: "#fff0e8", borderRadius: 28, paddingHorizontal: 26, paddingVertical: 30, width: "100%" },
  mark: { alignItems: "center", backgroundColor: "#b85c38", borderRadius: 18, height: 54, justifyContent: "center", marginBottom: 14, transform: [{ rotate: "-8deg" }], width: 54 },
  markText: { color: "#fff", fontSize: 30, fontWeight: "900", transform: [{ rotate: "8deg" }] },
  brand: { color: "#3f2d2a", fontSize: 38, fontWeight: "900", letterSpacing: -1 },
  brandAccent: { color: "#e98973" },
  eyebrow: { color: "#a6533d", fontSize: 11, fontWeight: "800", letterSpacing: 2, marginTop: 18 },
  tagline: { color: "#3f2d2a", fontSize: 25, fontWeight: "800", lineHeight: 32, marginTop: 10, textAlign: "center" },
  note: { color: "#776761", fontSize: 15, lineHeight: 22, marginTop: 14, maxWidth: 330, textAlign: "center" },
  actions: { gap: 12, width: "100%" },
  accountLink: { color: "#b85c38", fontSize: 15, fontWeight: "800", padding: 8 },
});

