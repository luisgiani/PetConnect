import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "@/theme/colors";

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
  primary: { backgroundColor: colors.violet, borderColor: colors.violet, shadowColor: colors.navy, shadowOffset: { height: 3, width: 0 }, shadowOpacity: 0.16, shadowRadius: 7, elevation: 3 },
  secondary: { backgroundColor: colors.lilac, borderColor: "#CFC6FF" },
  label: { color: "#fff", fontSize: 16, fontWeight: "800" },
  secondaryLabel: { color: colors.violetDark },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
});
