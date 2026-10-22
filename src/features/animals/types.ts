export type AnimalSpecies = "cachorro" | "gato" | "outro";
export type AnimalSize = "pequeno" | "medio" | "grande";
export type AnimalHealth = "saudavel" | "em_tratamento" | "nao_informado";
export type AnimalStatus = "available" | "adopted";

export type AnimalPhotoInput = {
  uri: string;
  fileSize: number;
  width: number;
  height: number;
};

export type Animal = {
  id: string;
  ownerId: string;
  name: string;
  species: AnimalSpecies;
  breed: string | null;
  city: string | null;
  state: string | null;
  photos: string[];
  ageMonths: number;
  size: AnimalSize;
  healthStatus: AnimalHealth;
  description: string;
  status: AnimalStatus;
  createdAt: string;
};

export type NewAnimal = Omit<Animal, "id" | "ownerId" | "status" | "createdAt" | "city" | "state" | "photos"> & {
  city: string;
  state: string;
  photos: AnimalPhotoInput[];
};

export type AnimalRepository = {
  listAvailable(): Promise<Animal[]>;
  getById(id: string): Promise<Animal | null>;
  create(animal: NewAnimal): Promise<Animal>;
};
