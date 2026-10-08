import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AuthRepository } from "@/features/auth/repositories/auth.repository";
import { ProfileRepository } from "@/features/auth/repositories/profile.repository";
import type { SignInInput, SignUpInput, UserProfile } from "@/features/auth/types";
import { createSupabaseClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";

type AuthContextValue = {
  available: boolean;
  loading: boolean;
  profileLoading: boolean;
  session: Session | null;
  profile: UserProfile | null;
  error: string | null;
  signIn(input: SignInInput): Promise<void>;
  signUp(input: SignUpInput): Promise<boolean>;
  signOut(): Promise<void>;
  exchangeCodeForSession(code: string): Promise<void>;
  verifyEmailToken(tokenHash: string, type: "signup" | "email"): Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const dataSource = process.env.EXPO_PUBLIC_DATA_SOURCE;

function getConfiguredClient(): { client: SupabaseClient<Database> | null; error: string | null } {
  if (dataSource !== "supabase") return { client: null, error: null };

  try {
    return { client: createSupabaseClient(), error: null };
  } catch (error) {
    return {
      client: null,
      error: error instanceof Error ? error.message : "Não foi possível configurar a autenticação.",
    };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [clientState] = useState(getConfiguredClient);
  const authRepository = useMemo(
    () => clientState.client ? new AuthRepository(clientState.client) : null,
    [clientState.client],
  );
  const profileRepository = useMemo(
    () => clientState.client ? new ProfileRepository(clientState.client) : null,
    [clientState.client],
  );
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(Boolean(clientState.client));
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState(clientState.error);
  const profileRequestId = useRef(0);
  const sessionUserId = useRef<string | null>(null);

  useEffect(() => {
    const client = clientState.client;
    if (!client) return;

    function applySession(nextSession: Session | null) {
      const nextUserId = nextSession?.user.id ?? null;
      if (sessionUserId.current !== nextUserId) {
        sessionUserId.current = nextUserId;
        setProfile(null);
      }
      setSession(nextSession);
      setError(null);
      setLoading(false);
    }

    const { data: authListener } = client.auth.onAuthStateChange((_event, nextSession) => {
      applySession(nextSession);
    });

    void client.auth.getSession().then(({ data, error: sessionError }) => {
      if (sessionError) {
        setError(sessionError.message);
        setLoading(false);
        return;
      }
      applySession(data.session);
    }).catch((sessionError: unknown) => {
      setError(sessionError instanceof Error ? sessionError.message : "Não foi possível restaurar a sessão.");
      setLoading(false);
    });

    return () => authListener.subscription.unsubscribe();
  }, [clientState.client]);

  useEffect(() => {
    const requestId = ++profileRequestId.current;
    const userId = session?.user.id;
    if (!profileRepository || !userId) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    setProfile(null);
    setProfileLoading(true);
    void profileRepository.getById(userId).then((nextProfile) => {
      if (requestId !== profileRequestId.current) return;
      setProfile(nextProfile);
      setProfileLoading(false);
      if (!nextProfile) {
        setError("O perfil não foi criado. Verifique se a migration de perfis foi aplicada.");
      }
    }).catch((profileError: unknown) => {
      if (requestId !== profileRequestId.current) return;
      setError(profileError instanceof Error ? profileError.message : "Não foi possível carregar o perfil.");
      setProfileLoading(false);
    });
  }, [profileRepository, session?.user.id]);

  const value = useMemo<AuthContextValue>(() => ({
    available: Boolean(authRepository),
    loading,
    profileLoading,
    session,
    profile,
    error,
    async signIn(input) {
      if (!authRepository) throw new Error("Configure o modo Supabase para entrar em uma conta.");
      setError(null);
      await authRepository.signIn(input);
    },
    async signUp(input) {
      if (!authRepository) throw new Error("Configure o modo Supabase para criar uma conta.");
      setError(null);
      const result = await authRepository.signUp(input);
      return result.session === null;
    },
    async signOut() {
      if (!authRepository) throw new Error("A autenticação Supabase não está configurada.");
      setError(null);
      await authRepository.signOut();
    },
    async exchangeCodeForSession(code) {
      if (!authRepository) throw new Error("A autenticação Supabase não está configurada.");
      await authRepository.exchangeCodeForSession(code);
    },
    async verifyEmailToken(tokenHash, type) {
      if (!authRepository) throw new Error("A autenticação Supabase não está configurada.");
      await authRepository.verifyEmailToken(tokenHash, type);
    },
  }), [authRepository, error, loading, profile, profileLoading, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  return context;
}
