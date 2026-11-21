import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export function BrandHeaderLogo() {
  return (
    <Pressable
      accessibilityLabel="PetConnect"
      accessibilityRole="button"
      onPress={() => router.replace("/")}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <View style={styles.mark}>
        <Text style={styles.paw}>🐾</Text>
      </View>
      <Text style={styles.brand}>Pet<Text style={styles.brandAccent}>Connect</Text></Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", flexDirection: "row", gap: 8, minHeight: 44, paddingHorizontal: 8 },
  mark: { alignItems: "center", backgroundColor: "#fff0e8", borderRadius: 12, height: 34, justifyContent: "center", width: 34 },
  paw: { fontSize: 21 },
  brand: { color: "#3f2d2a", fontSize: 17, fontWeight: "900", letterSpacing: -0.5 },
  brandAccent: { color: "#b85c38" },
  pressed: { opacity: 0.75 },
});
