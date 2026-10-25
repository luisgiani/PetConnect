import type { Animal, AnimalFilters, AnimalRepository, NewAnimal } from "@/features/animals/types";

export class AnimalService {
  constructor(private readonly repository: AnimalRepository) {}

  listAvailable(filters?: AnimalFilters): Promise<Animal[]> {
    return this.repository.listAvailable(filters);
  }

  listMine(): Promise<Animal[]> {
    return this.repository.listMine();
  }

  getById(id: string): Promise<Animal | null> {
    if (!id.trim()) throw new Error("O identificador do animal é obrigatório.");
    return this.repository.getById(id);
  }

  create(animal: NewAnimal): Promise<Animal> {
    return this.repository.create(animal);
  }
}
