import type { Animal, AnimalRepository, NewAnimal } from "@/features/animals/types";

const demoAnimals: Animal[] = [
  {
    id: "demo-mel",
    ownerId: "demo-doador",
    name: "Mel",
    species: "cachorro",
    breed: "SRD",
    ageMonths: 24,
    size: "medio",
    healthStatus: "saudavel",
    description: "Mel é uma cachorrinha dócil, carinhosa e muito brincalhona. Se dá bem com pessoas e outros animais.",
    status: "available",
    createdAt: "2026-01-15T12:00:00.000Z",
  },
  {
    id: "demo-thor",
    ownerId: "demo-doador",
    name: "Thor",
    species: "gato",
    breed: "Sem raça definida",
    ageMonths: 12,
    size: "pequeno",
    healthStatus: "saudavel",
    description: "Thor é curioso e gosta de companhia. Está procurando um lar seguro e cheio de carinho.",
    status: "available",
    createdAt: "2026-01-16T12:00:00.000Z",
  },
  {
    id: "demo-luna",
    ownerId: "demo-doador",
    name: "Luna",
    species: "cachorro",
    breed: "SRD",
    ageMonths: 6,
    size: "pequeno",
    healthStatus: "nao_informado",
    description: "Luna é uma filhote alegre que adora brincar e está pronta para conhecer sua nova família.",
    status: "available",
    createdAt: "2026-01-17T12:00:00.000Z",
  },
];

export class DemoAnimalRepository implements AnimalRepository {
  private readonly animals = [...demoAnimals];

  async listAvailable(): Promise<Animal[]> {
    return this.animals.filter((animal) => animal.status === "available");
  }

  async getById(id: string): Promise<Animal | null> {
    return this.animals.find((animal) => animal.id === id) ?? null;
  }

  async create(input: NewAnimal): Promise<Animal> {
    const animal: Animal = {
      ...input,
      id: `demo-${Date.now()}`,
      ownerId: "demo-doador",
      status: "available",
      createdAt: new Date().toISOString(),
    };
    this.animals.unshift(animal);
    return animal;
  }
}
