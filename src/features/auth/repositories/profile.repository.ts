import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { ProfileUpdateInput, UserProfile } from "@/features/auth/types";

export class ProfileRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async getById(id: string): Promise<UserProfile | null> {
    const { data, error } = await this.client
      .from("profiles")
      .select("id, name, profile_type, phone, city, state, bio, created_at")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      profileType: data.profile_type,
      phone: data.phone,
      city: data.city,
      state: data.state,
      bio: data.bio,
      createdAt: data.created_at,
    };
  }

  async update(id: string, input: ProfileUpdateInput): Promise<UserProfile> {
    const { data, error } = await this.client
      .from("profiles")
      .update({
        name: input.name,
        phone: input.phone,
        city: input.city,
        state: input.state,
        bio: input.bio,
      })
      .eq("id", id)
      .select("id, name, profile_type, phone, city, state, bio, created_at")
      .single();

    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      profileType: data.profile_type,
      phone: data.phone,
      city: data.city,
      state: data.state,
      bio: data.bio,
      createdAt: data.created_at,
    };
  }
}
