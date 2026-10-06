import { Pressable, StyleSheet, Text } from "react-native";

type PrimaryButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
};

export function PrimaryButton({
  title,
  onPress,
  variant = "primary",
  disabled = false,
}: PrimaryButtonProps) {
  const secondary = variant === "secondary";
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary ? styles.secondary : styles.primary,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={[styles.label, secondary && styles.secondaryLabel]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: 20,
    width: "100%",
  },
  primary: { backgroundColor: "#e9dcff", borderColor: "#cfb8f4" },
  secondary: { backgroundColor: "#d9f1e8", borderColor: "#a9d7c5" },
  label: { color: "#593a8a", fontSize: 16, fontWeight: "700" },
  secondaryLabel: { color: "#276b59" },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.75 },
});
