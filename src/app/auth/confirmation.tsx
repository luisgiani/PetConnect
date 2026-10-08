import { Link, Stack, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function EmailConfirmationScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();

  return (
    <>
      <Stack.Screen options={{ title: "Confirme seu e-mail" }} />
      <View style={styles.container}>
        <Text style={styles.title}>Confira sua caixa de entrada</Text>
        <Text style={styles.message}>
          Enviamos um link de confirmação para {email || "o e-mail informado"}. Abra o link no mesmo dispositivo para ativar sua conta.
        </Text>
        <Text style={styles.note}>Se não encontrar a mensagem, confira a pasta de spam.</Text>
        <Link href="/auth/login" style={styles.link}>Voltar para entrar</Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 18, justifyContent: "center", padding: 24, width: "100%", maxWidth: 560, alignSelf: "center" },
  title: { color: "#593a8a", fontSize: 27, fontWeight: "800" },
  message: { color: "#493d57", fontSize: 16, lineHeight: 24 },
  note: { color: "#62596a", lineHeight: 22 },
  link: { color: "#593a8a", fontWeight: "700", textAlign: "center" },
});
