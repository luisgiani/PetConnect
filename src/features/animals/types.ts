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

export type AnimalFilters = {
  species?: AnimalSpecies;
  size?: AnimalSize;
  city?: string;
  state?: string;
};

export type Animal = {
  id: string;
  ownerId: string;
  donorName: string | null;
  donorPhone: string | null;
  donorCity: string | null;
  donorState: string | null;
  donorBio: string | null;
  contactError?: string | null;
  name: string;
  species: AnimalSpecies;
  breed: string | null;
  city: string | null;
  state: string | null;
  photos: string[];
  photoPaths: string[];
  ageMonths: number;
  size: AnimalSize;
  healthStatus: AnimalHealth;
  description: string;
  status: AnimalStatus;
  createdAt: string;
};

export type NewAnimal = Omit<
  Animal,
  "id" | "ownerId" | "donorName" | "donorPhone" | "donorCity" | "donorState" | "donorBio" | "contactError"
  | "status" | "createdAt" | "city" | "state" | "photos" | "photoPaths"
> & {
  city: string;
  state: string;
  photos: AnimalPhotoInput[];
};

export type AnimalRepository = {
  listAvailable(filters?: AnimalFilters): Promise<Animal[]>;
  listMine(): Promise<Animal[]>;
  getById(id: string): Promise<Animal | null>;
  create(animal: NewAnimal): Promise<Animal>;
  update(id: string, animal: NewAnimal, retainedPhotoPaths: string[]): Promise<Animal>;
  setStatus(id: string, status: AnimalStatus): Promise<Animal>;
};
