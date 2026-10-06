import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { Animal, AnimalRepository, NewAnimal } from "@/features/animals/types";

type AnimalRow = Database["public"]["Tables"]["animals"]["Row"];

export class SupabaseAnimalRepository implements AnimalRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async listAvailable(): Promise<Animal[]> {
    const { data, error } = await this.client
      .from("animals")
      .select("*")
      .eq("status", "available")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data.map(mapAnimal);
  }

  async getById(id: string): Promise<Animal | null> {
    const { data, error } = await this.client
      .from("animals")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data ? mapAnimal(data) : null;
  }

  async create(input: NewAnimal): Promise<Animal> {
    const { data: userData, error: authError } = await this.client.auth.getUser();
    if (authError) throw authError;
    if (!userData.user) throw new Error("Entre na sua conta para cadastrar um animal.");

    const { data, error } = await this.client
      .from("animals")
      .insert({
        owner_id: userData.user.id,
        name: input.name,
        species: input.species,
        breed: input.breed || null,
        age_months: input.ageMonths,
        size: input.size,
        health_status: input.healthStatus,
        description: input.description,
      })
      .select("*")
      .single();

    if (error) throw error;
    return mapAnimal(data);
  }
}

function mapAnimal(row: AnimalRow): Animal {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    species: row.species,
    breed: row.breed,
    ageMonths: row.age_months,
    size: row.size,
    healthStatus: row.health_status,
    description: row.description,
    status: row.status,
    createdAt: row.created_at,
  };
}
