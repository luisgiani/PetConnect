import type { Animal, AnimalRepository, NewAnimal } from "@/features/animals/types";

export class AnimalService {
  constructor(private readonly repository: AnimalRepository) {}

  listAvailable(): Promise<Animal[]> {
    return this.repository.listAvailable();
  }

  getById(id: string): Promise<Animal | null> {
    if (!id.trim()) throw new Error("O identificador do animal é obrigatório.");
    return this.repository.getById(id);
  }

  create(animal: NewAnimal): Promise<Animal> {
    return this.repository.create(animal);
  }
}
