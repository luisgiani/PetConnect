import { router } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";

export function HeaderHomeButton() {
  return (
    <Pressable
      accessibilityLabel="Voltar para a tela inicial"
      accessibilityRole="button"
      hitSlop={8}
      onPress={() => router.replace("/")}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.label}>Início</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: "center", justifyContent: "center", minHeight: 44, minWidth: 52, paddingHorizontal: 8 },
  label: { color: "#b85c38", fontSize: 14, fontWeight: "700" },
  pressed: { opacity: 0.7 },
});

