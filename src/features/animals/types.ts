export type AnimalSpecies = "cachorro" | "gato" | "outro";
export type AnimalSize = "pequeno" | "medio" | "grande";
export type AnimalHealth = "saudavel" | "em_tratamento" | "nao_informado";
export type AnimalStatus = "available" | "adopted";

export type Animal = {
  id: string;
  ownerId: string;
  name: string;
  species: AnimalSpecies;
  breed: string | null;
  ageMonths: number;
  size: AnimalSize;
  healthStatus: AnimalHealth;
  description: string;
  status: AnimalStatus;
  createdAt: string;
};

export type NewAnimal = Omit<Animal, "id" | "ownerId" | "status" | "createdAt">;

export type AnimalRepository = {
  listAvailable(): Promise<Animal[]>;
  getById(id: string): Promise<Animal | null>;
  create(animal: NewAnimal): Promise<Animal>;
};
