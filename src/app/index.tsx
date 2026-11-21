import { Redirect } from "expo-router";
import { useAuth } from "@/features/auth/AuthProvider";
import { StateMessage } from "@/components/StateMessage";

export default function HomeScreen() {
  const auth = useAuth();
  if (auth.loading || auth.profileLoading) return <StateMessage message="Carregando sua conta..." loading />;
  if (!auth.session) return <Redirect href="/auth/login" />;
  return <Redirect href={auth.profile?.profileType === "doador_ong" ? "/animals/manage" : "/animals"} />;
}
