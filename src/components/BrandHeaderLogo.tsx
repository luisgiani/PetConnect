import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { colors } from "@/theme/colors";

export function BrandHeaderLogo() {
  return (
    <Pressable
      accessibilityLabel="PetConnect"
      accessibilityRole="button"
      onPress={() => router.replace("/")}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <View style={styles.mark}>
        <Svg width={30} height={30} viewBox="0 0 128 88">
          <Path d="M8 50C8 31 22 17 43 17C60 17 73 27 73 42V72C73 82 66 88 55 88H43C30 88 22 80 22 68V48" fill={colors.surface} stroke={colors.navy} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          <Circle cx="57" cy="31" r="5" fill={colors.navy} />
          <Path d="M73 44C73 28 87 18 102 20C117 22 125 34 125 49V72C125 82 117 88 106 88H88M78 30L80 8C81 3 87 2 91 6L104 20M119 29L118 8C118 3 112 2 108 6L100 20" fill="none" stroke={colors.navy} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          <Circle cx="96" cy="45" r="5" fill={colors.surface} />
          <Circle cx="116" cy="45" r="5" fill={colors.surface} />
          <Path d="M106 53L102 58H110L106 53ZM106 58V64M106 64C101 69 96 70 91 70M106 64C111 69 116 70 121 70" fill="none" stroke={colors.pink} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <Circle cx="8" cy="54" r="6" fill={colors.violet} />
        </Svg>
      </View>
      <Text style={styles.brand}>Pet<Text style={styles.brandAccent}>Connect</Text></Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", flexDirection: "row", gap: 8, minHeight: 44, paddingHorizontal: 8 },
  mark: { alignItems: "center", backgroundColor: colors.lilac, borderColor: "#DED7FF", borderRadius: 12, borderWidth: 1, height: 34, justifyContent: "center", overflow: "hidden", width: 34 },
  brand: { color: colors.navy, fontSize: 17, fontWeight: "900", letterSpacing: -0.5 },
  brandAccent: { color: colors.violet },
  pressed: { opacity: 0.75 },
});
