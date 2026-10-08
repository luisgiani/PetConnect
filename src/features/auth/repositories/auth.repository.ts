import * as Linking from "expo-linking";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { SignInInput, SignUpInput } from "@/features/auth/types";

export class AuthRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async signIn(input: SignInInput) {
    const { data, error } = await this.client.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) throw error;
    return data;
  }

  async signUp(input: SignUpInput) {
    const { data, error } = await this.client.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        emailRedirectTo: Linking.createURL("auth/callback"),
        data: {
          name: input.name,
          profile_type: input.profileType,
          phone: input.phone,
        },
      },
    });

    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await this.client.auth.signOut();
    if (error) throw error;
  }

  async exchangeCodeForSession(code: string) {
    const { error } = await this.client.auth.exchangeCodeForSession(code);
    if (error) throw error;
  }

  async verifyEmailToken(tokenHash: string, type: "signup" | "email") {
    const { error } = await this.client.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (error) throw error;
  }
}
