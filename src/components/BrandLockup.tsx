import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { colors } from "@/theme/colors";

export function BrandLockup() {
  return (
    <View accessibilityLabel="PetConnect" style={styles.container}>
      <View style={styles.mark} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Svg width={72} height={72} viewBox="0 0 128 88">
          <Path d="M8 50C8 31 22 17 43 17C60 17 73 27 73 42V72C73 82 66 88 55 88H43C30 88 22 80 22 68V48" fill={colors.surface} stroke={colors.navy} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M21 43C30 49 43 51 56 47" fill="none" stroke={colors.navy} strokeWidth="6" strokeLinecap="round" />
          <Circle cx="57" cy="31" r="4" fill={colors.navy} />
          <Path d="M73 44C73 28 87 18 102 20C117 22 125 34 125 49V72C125 82 117 88 106 88H88" fill={colors.navy} stroke={colors.navy} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M78 30L80 8C81 3 87 2 91 6L104 20" fill={colors.navy} stroke={colors.navy} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M119 29L118 8C118 3 112 2 108 6L100 20" fill={colors.navy} stroke={colors.navy} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          <Circle cx="96" cy="45" r="5" fill={colors.surface} />
          <Circle cx="116" cy="45" r="5" fill={colors.surface} />
          <Path d="M106 53L102 58H110L106 53Z" fill={colors.pink} />
          <Path d="M106 58V64M106 64C101 69 96 70 91 70M106 64C111 69 116 70 121 70M84 58H70M84 68H72M128 58H118M128 68H118" fill="none" stroke={colors.surface} strokeWidth="4" strokeLinecap="round" />
          <Circle cx="91" cy="24" r="5" fill={colors.pink} />
          <Circle cx="8" cy="54" r="6" fill={colors.violet} />
        </Svg>
      </View>
      <Text style={styles.brand}>Pet<Text style={styles.brandAccent}>Connect</Text></Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: 10, marginBottom: 2 },
  mark: { alignItems: "center", backgroundColor: colors.lilac, borderRadius: 24, height: 88, justifyContent: "center", overflow: "hidden", width: 88 },
  brand: { color: colors.navy, fontSize: 30, fontWeight: "900", letterSpacing: -1 },
  brandAccent: { color: colors.violet },
});
