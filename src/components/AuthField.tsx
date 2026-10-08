import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";

type AuthFieldProps = TextInputProps & {
  label: string;
  error?: string;
};

export function AuthField({ label, error, ...inputProps }: AuthFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        autoCapitalize="none"
        style={[styles.input, error && styles.inputError]}
        {...inputProps}
      />
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 7 },
  label: { color: "#30283a", fontSize: 15, fontWeight: "700" },
  input: { backgroundColor: "#fff", borderColor: "#e5dce9", borderRadius: 10, borderWidth: 1, color: "#30283a", minHeight: 46, paddingHorizontal: 12 },
  inputError: { borderColor: "#b3261e" },
  error: { color: "#b3261e", fontSize: 13 },
});
