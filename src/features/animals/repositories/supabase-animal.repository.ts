import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { MAX_PHOTO_SIZE_BYTES } from "@/features/animals/photo.constants";
import { prepareAnimalPhoto } from "@/features/animals/photo.service";
import type { Animal, AnimalRepository, NewAnimal } from "@/features/animals/types";

type AnimalRow = Database["public"]["Tables"]["animals"]["Row"];
const animalPhotoBucket = "animal-photos";

export class SupabaseAnimalRepository implements AnimalRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async listAvailable(): Promise<Animal[]> {
    const { data, error } = await this.client
      .from("animals")
      .select("*")
      .eq("status", "available")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data.map((row) => mapAnimal(row, (path) => this.getPhotoUrl(path)));
  }

  async getById(id: string): Promise<Animal | null> {
    const { data, error } = await this.client
      .from("animals")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data ? mapAnimal(data, (path) => this.getPhotoUrl(path)) : null;
  }

  async create(input: NewAnimal): Promise<Animal> {
    const { data: userData, error: authError } = await this.client.auth.getUser();
    if (authError) throw authError;
    if (!userData.user) throw new Error("Entre na sua conta para cadastrar um animal.");

    const storage = this.client.storage.from(animalPhotoBucket);
    const uploadedPaths: string[] = [];
    const uploadBatchId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    try {
      const photoPaths: string[] = [];
      for (const [index, photo] of input.photos.entries()) {
        if (photo.fileSize > MAX_PHOTO_SIZE_BYTES) {
          throw new Error("Cada foto deve ter no máximo 5 MB antes da compressão.");
        }

        const body = await prepareAnimalPhoto(photo.uri, photo.width, photo.height);
        const path = `${userData.user.id}/${uploadBatchId}/${index + 1}.jpg`;
        const { error: uploadError } = await storage.upload(path, body, {
          contentType: "image/jpeg",
          upsert: false,
        });
        if (uploadError) throw uploadError;
        uploadedPaths.push(path);
        photoPaths.push(path);
      }

      const { data, error } = await this.client
        .from("animals")
        .insert({
          owner_id: userData.user.id,
          name: input.name,
          species: input.species,
          breed: input.breed || null,
          city: input.city,
          state: input.state,
          photo_paths: photoPaths,
          age_months: input.ageMonths,
          size: input.size,
          health_status: input.healthStatus,
          description: input.description,
        })
        .select("*")
        .single();

      if (error) throw error;
      return mapAnimal(data, (path) => storage.getPublicUrl(path).data.publicUrl);
    } catch (error) {
      const { error: cleanupError } = uploadedPaths.length
        ? await storage.remove(uploadedPaths)
        : { error: null };
      if (cleanupError) {
        const message = error instanceof Error ? error.message : "Falha ao publicar o anúncio.";
        throw new Error(`${message} Também não foi possível limpar as fotos enviadas: ${cleanupError.message}`);
      }
      throw error;
    }
  }

  private getPhotoUrl(path: string): string {
    return this.client.storage.from(animalPhotoBucket).getPublicUrl(path).data.publicUrl;
  }
}

function mapAnimal(row: AnimalRow, getPhotoUrl: (path: string) => string): Animal {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    species: row.species,
    breed: row.breed,
    city: row.city,
    state: row.state,
    photos: row.photo_paths.map(getPhotoUrl),
    ageMonths: row.age_months,
    size: row.size,
    healthStatus: row.health_status,
    description: row.description,
    status: row.status,
    createdAt: row.created_at,
  };
}
