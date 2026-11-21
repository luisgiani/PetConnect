import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export function HeaderAccountButton() {
  return (
    <Pressable
      accessibilityLabel="Abrir minha conta"
      accessibilityRole="button"
      hitSlop={8}
      onPress={() => router.push("/account")}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <View style={styles.icon} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <View style={styles.head} />
        <View style={styles.shoulders} />
      </View>
      <Text style={styles.label}>Minha conta</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: "center", backgroundColor: "#fff0e8", borderColor: "#ead8cd", borderRadius: 22, borderWidth: 1, flexDirection: "row", gap: 7, justifyContent: "center", marginRight: 8, minHeight: 38, paddingHorizontal: 12 },
  icon: { alignItems: "center", backgroundColor: "#b85c38", borderRadius: 12, height: 24, justifyContent: "flex-end", overflow: "hidden", width: 24 },
  head: { backgroundColor: "#fff8f0", borderRadius: 5, height: 7, marginBottom: 2, width: 7 },
  shoulders: { backgroundColor: "#fff8f0", borderTopLeftRadius: 7, borderTopRightRadius: 7, height: 7, width: 14 },
  label: { color: "#8f452f", fontSize: 13, fontWeight: "800" },
  pressed: { opacity: 0.78, transform: [{ scale: 0.97 }] },
});
