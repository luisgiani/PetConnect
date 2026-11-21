import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { colors } from "@/theme/colors";

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
  label: { color: colors.navy, fontSize: 15, fontWeight: "700" },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 12, borderWidth: 1, color: colors.text, minHeight: 48, paddingHorizontal: 14 },
  inputError: { borderColor: colors.danger },
  error: { color: colors.danger, fontSize: 13 },
});
