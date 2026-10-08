import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { UserProfile } from "@/features/auth/types";

export class ProfileRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async getById(id: string): Promise<UserProfile | null> {
    const { data, error } = await this.client
      .from("profiles")
      .select("id, name, profile_type, phone, created_at")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      profileType: data.profile_type,
      phone: data.phone,
      createdAt: data.created_at,
    };
  }
}
