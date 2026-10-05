import { DemoAnimalRepository } from "@/features/animals/repositories/demo-animal.repository";
import { SupabaseAnimalRepository } from "@/features/animals/repositories/supabase-animal.repository";
import type { AnimalRepository } from "@/features/animals/types";
import { createSupabaseClient } from "@/lib/supabase/client";

const dataSource = process.env.EXPO_PUBLIC_DATA_SOURCE;

function createRepository(): AnimalRepository {
  if (dataSource === "demo") return new DemoAnimalRepository();
  if (dataSource === "supabase") return new SupabaseAnimalRepository(createSupabaseClient());
  throw new Error("Defina EXPO_PUBLIC_DATA_SOURCE como 'demo' ou 'supabase' no arquivo .env.");
}

export const animalRepository = createRepository();
