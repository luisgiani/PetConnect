import { router, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/features/auth/AuthProvider";
import { colors } from "@/theme/colors";

type NavigationItem = {
  href: "/animals" | "/animals/manage" | "/animals/new" | "/favorites" | "/account";
  label: string;
  icon: string;
};

export function BottomNavigation() {
  const { profile } = useAuth();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const isDonor = profile?.profileType === "doador_ong";
  const items: NavigationItem[] = isDonor
    ? [
      { href: "/animals/manage", label: "Anúncios", icon: "▣" },
      { href: "/animals/new", label: "Publicar", icon: "＋" },
      { href: "/account", label: "Perfil", icon: "○" },
    ]
    : [
      { href: "/animals", label: "Explorar", icon: "⌕" },
      { href: "/favorites", label: "Salvos", icon: "♡" },
      { href: "/account", label: "Perfil", icon: "○" },
    ];

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {items.map((item) => {
        const selected = pathname === item.href
          || (item.href === "/animals" && pathname.startsWith("/animals/") && !isDonor)
          || (item.href === "/animals/manage" && pathname.startsWith("/animals/manage"));
        return (
          <Pressable
            key={item.href}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => router.replace(item.href)}
            style={({ pressed }) => [styles.item, pressed && styles.pressed]}
          >
            <Text style={[styles.icon, selected && styles.selectedText]}>{item.icon}</Text>
            <Text style={[styles.label, selected && styles.selectedText]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    elevation: 5,
    flexDirection: "row",
    justifyContent: "space-around",
    alignSelf: "center",
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingTop: 8,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    width: "92%",
    maxWidth: 560,
  },
  item: { alignItems: "center", flex: 1, gap: 3, minHeight: 48, justifyContent: "center" },
  icon: { color: colors.textSecondary, fontSize: 21, fontWeight: "700", lineHeight: 24 },
  label: { color: colors.textSecondary, fontSize: 11, fontWeight: "600" },
  selectedText: { color: colors.violetDark },
  pressed: { opacity: 0.65 },
});
