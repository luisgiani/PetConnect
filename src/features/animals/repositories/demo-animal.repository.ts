import type { Animal, AnimalFilters, AnimalRepository, NewAnimal } from "@/features/animals/types";

const demoAnimals: Animal[] = [
  {
    id: "demo-mel",
    ownerId: "demo-doador",
    name: "Mel",
    species: "cachorro",
    breed: "SRD",
    city: "São Paulo",
    state: "SP",
    photos: [],
    photoPaths: [],
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
    city: "Campinas",
    state: "SP",
    photos: [],
    photoPaths: [],
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
    city: "Santos",
    state: "SP",
    photos: [],
    photoPaths: [],
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

  async listAvailable(filters: AnimalFilters = {}): Promise<Animal[]> {
    const city = filters.city?.trim().toLocaleLowerCase("pt-BR");
    const state = filters.state?.trim().toUpperCase();

    return this.animals.filter((animal) =>
      animal.status === "available"
      && (!filters.species || animal.species === filters.species)
      && (!filters.size || animal.size === filters.size)
      && (!city || animal.city?.toLocaleLowerCase("pt-BR").includes(city))
      && (!state || animal.state === state),
    );
  }

  async getById(id: string): Promise<Animal | null> {
    return this.animals.find((animal) => animal.id === id) ?? null;
  }

  async listMine(): Promise<Animal[]> {
    return this.animals.filter((animal) => animal.ownerId === "demo-doador");
  }

  async create(input: NewAnimal): Promise<Animal> {
    const animal: Animal = {
      ...input,
      id: `demo-${Date.now()}`,
      ownerId: "demo-doador",
      status: "available",
      createdAt: new Date().toISOString(),
      photos: input.photos.map((photo) => photo.uri),
      photoPaths: input.photos.map((photo) => photo.uri),
    };
    this.animals.unshift(animal);
    return animal;
  }

  async update(id: string, input: NewAnimal, retainedPhotoPaths: string[]): Promise<Animal> {
    const index = this.animals.findIndex((animal) => animal.id === id);
    if (index === -1) throw new Error("Anúncio não encontrado.");

    const current = this.animals[index];
    const updated: Animal = {
      ...current,
      ...input,
      photos: [...retainedPhotoPaths, ...input.photos.map((photo) => photo.uri)],
      photoPaths: [...retainedPhotoPaths, ...input.photos.map((photo) => photo.uri)],
    };
    this.animals[index] = updated;
    return updated;
  }

  async setStatus(id: string, status: Animal["status"]): Promise<Animal> {
    const animal = this.animals.find((item) => item.id === id);
    if (!animal) throw new Error("Anúncio não encontrado.");
    animal.status = status;
    return animal;
  }
}
