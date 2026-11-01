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
    minHeight: 54,
    paddingHorizontal: 20,
    width: "100%",
  },
  primary: { backgroundColor: "#b85c38", borderColor: "#b85c38", shadowColor: "#3f2d2a", shadowOffset: { height: 3, width: 0 }, shadowOpacity: 0.14, shadowRadius: 5, elevation: 2 },
  secondary: { backgroundColor: "#e6f3eb", borderColor: "#b8dcc8" },
  label: { color: "#fff", fontSize: 16, fontWeight: "800" },
  secondaryLabel: { color: "#31705b" },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
});

