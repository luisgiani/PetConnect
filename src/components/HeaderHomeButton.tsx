import { router } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import { useAuth } from "@/features/auth/AuthProvider";
import { colors } from "@/theme/colors";

export function HeaderHomeButton() {
  const { profile } = useAuth();
  const isDonor = profile?.profileType === "doador_ong";
  return (
    <Pressable
      accessibilityLabel={isDonor ? "Voltar para meus anúncios" : "Voltar para os animais"}
      accessibilityRole="button"
      hitSlop={8}
      onPress={() => router.replace(isDonor ? "/animals/manage" : "/animals")}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.label}>{isDonor ? "Meus anúncios" : "Animais"}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: "center", justifyContent: "center", minHeight: 44, minWidth: 52, paddingHorizontal: 8 },
  label: { color: colors.violetDark, fontSize: 14, fontWeight: "700" },
  pressed: { opacity: 0.7 },
});
