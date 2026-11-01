import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

type StateMessageProps = {
  message: string;
  loading?: boolean;
};

export function StateMessage({ message, loading = false }: StateMessageProps) {
  return (
    <View accessibilityLiveRegion="polite" style={styles.container}>
      {loading ? <ActivityIndicator color="#a6533d" /> : null}
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: 12, padding: 24 },
  message: { color: "#776761", fontSize: 16, textAlign: "center" },
});

