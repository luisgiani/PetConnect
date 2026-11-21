import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";

type StateMessageProps = {
  message: string;
  loading?: boolean;
};

export function StateMessage({ message, loading = false }: StateMessageProps) {
  return (
    <View accessibilityLiveRegion="polite" style={styles.container}>
      {loading ? <ActivityIndicator color={colors.violet} /> : null}
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: 12, padding: 24 },
  message: { color: colors.textSecondary, fontSize: 16, textAlign: "center" },
});
