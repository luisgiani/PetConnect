import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { MAX_PHOTO_SIZE_BYTES } from "@/features/animals/photo.constants";
import { prepareAnimalPhoto } from "@/features/animals/photo.service";
import type { Animal, AnimalFilters, AnimalRepository, NewAnimal } from "@/features/animals/types";

type AnimalRow = Database["public"]["Tables"]["animals"]["Row"];
const animalPhotoBucket = "animal-photos";

export class SupabaseAnimalRepository implements AnimalRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async listAvailable(filters: AnimalFilters = {}): Promise<Animal[]> {
    let query = this.client
      .from("animals")
      .select("*")
      .eq("status", "available")
      .order("created_at", { ascending: false });

    if (filters.species) query = query.eq("species", filters.species);
    if (filters.size) query = query.eq("size", filters.size);
    if (filters.city?.trim()) query = query.ilike("city", `%${filters.city.trim()}%`);
    if (filters.state?.trim()) query = query.eq("state", filters.state.trim().toUpperCase());

    const { data, error } = await query;

    if (error) throw error;
    return data.map((row) => mapAnimal(row, (path) => this.getPhotoUrl(path)));
  }

  async listMine(): Promise<Animal[]> {
    const { data: userData, error: authError } = await this.client.auth.getUser();
    if (authError) throw authError;
    if (!userData.user) throw new Error("Entre na sua conta para ver seus anúncios.");

    const { data, error } = await this.client
      .from("animals")
      .select("*")
      .eq("owner_id", userData.user.id)
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
    if (!data) return null;
    const [animal] = await this.withDonorContacts([mapAnimal(data, (path) => this.getPhotoUrl(path))]);
    return animal;
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

  async update(id: string, input: NewAnimal, retainedPhotoPaths: string[]): Promise<Animal> {
    const { data: userData, error: authError } = await this.client.auth.getUser();
    if (authError) throw authError;
    if (!userData.user) throw new Error("Entre na sua conta para editar anúncios.");

    const { data: current, error: currentError } = await this.client
      .from("animals")
      .select("*")
      .eq("id", id)
      .eq("owner_id", userData.user.id)
      .single();
    if (currentError) throw currentError;

    const currentPhotoPaths = current.photo_paths;
    if (retainedPhotoPaths.some((path) => !currentPhotoPaths.includes(path))) {
      throw new Error("A lista de fotos contém arquivos que não pertencem a este anúncio.");
    }

    const storage = this.client.storage.from(animalPhotoBucket);
    const uploadedPaths: string[] = [];
    const uploadBatchId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    let updateCommitted = false;

    try {
      const newPhotoPaths: string[] = [];
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
        newPhotoPaths.push(path);
      }

      const nextPhotoPaths = [...retainedPhotoPaths, ...newPhotoPaths];
      const { data, error } = await this.client
        .from("animals")
        .update({
          name: input.name,
          species: input.species,
          breed: input.breed || null,
          city: input.city,
          state: input.state,
          photo_paths: nextPhotoPaths,
          age_months: input.ageMonths,
          size: input.size,
          health_status: input.healthStatus,
          description: input.description,
        })
        .eq("id", id)
        .eq("owner_id", userData.user.id)
        .select("*")
        .single();

      if (error) throw error;
      updateCommitted = true;

      const removedPhotoPaths = currentPhotoPaths.filter((path) => !retainedPhotoPaths.includes(path));
      if (removedPhotoPaths.length) {
        const { error: cleanupError } = await storage.remove(removedPhotoPaths);
        if (cleanupError) {
          throw new Error(`Anúncio atualizado, mas não foi possível remover fotos substituídas: ${cleanupError.message}`);
        }
      }

      return mapAnimal(data, (path) => this.getPhotoUrl(path));
    } catch (error) {
      const { error: cleanupError } = !updateCommitted && uploadedPaths.length
        ? await storage.remove(uploadedPaths)
        : { error: null };
      if (cleanupError) {
        const message = error instanceof Error ? error.message : "Falha ao atualizar o anúncio.";
        throw new Error(`${message} Também não foi possível limpar as novas fotos enviadas: ${cleanupError.message}`);
      }
      throw error;
    }
  }

  async setStatus(id: string, status: Animal["status"]): Promise<Animal> {
    const { data: userData, error: authError } = await this.client.auth.getUser();
    if (authError) throw authError;
    if (!userData.user) throw new Error("Entre na sua conta para gerenciar anúncios.");

    const { data, error } = await this.client
      .from("animals")
      .update({ status })
      .eq("id", id)
      .eq("owner_id", userData.user.id)
      .select("*")
      .single();
    if (error) throw error;
    return mapAnimal(data, (path) => this.getPhotoUrl(path));
  }

  private getPhotoUrl(path: string): string {
    return this.client.storage.from(animalPhotoBucket).getPublicUrl(path).data.publicUrl;
  }

  private async withDonorContacts(animals: Animal[]): Promise<Animal[]> {
    if (animals.length === 0) return animals;

    const { data: sessionData, error: sessionError } = await this.client.auth.getSession();
    if (sessionError) throw sessionError;
    if (!sessionData.session) return animals;

    const { data: contacts, error } = await this.client.rpc("get_animal_contacts", {
      p_animal_ids: animals.map((animal) => animal.id),
    });
    if (error) {
      const contactError = error.code === "PGRST202"
        ? "O acesso seguro ao contato ainda não foi habilitado neste banco. Aplique a migration 20261025000000_add_controlled_animal_contacts.sql."
        : error.message;
      return animals.map((animal) => ({
        ...animal,
        contactError,
      }));
    }

    const contactsByAnimalId = new Map(contacts.map((contact) => [contact.animal_id, contact]));
    return animals.map((animal) => {
      const contact = contactsByAnimalId.get(animal.id);
      return {
        ...animal,
        donorName: contact?.donor_name ?? null,
        donorPhone: contact?.donor_phone ?? null,
        contactError: null,
      };
    });
  }
}

function mapAnimal(row: AnimalRow, getPhotoUrl: (path: string) => string): Animal {
  return {
    id: row.id,
    ownerId: row.owner_id,
    donorName: null,
    donorPhone: null,
    contactError: null,
    name: row.name,
    species: row.species,
    breed: row.breed,
    city: row.city,
    state: row.state,
    photos: row.photo_paths.map(getPhotoUrl),
    photoPaths: row.photo_paths,
    ageMonths: row.age_months,
    size: row.size,
    healthStatus: row.health_status,
    description: row.description,
    status: row.status,
    createdAt: row.created_at,
  };
}
