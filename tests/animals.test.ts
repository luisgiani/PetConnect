import { describe, expect, it } from "vitest";
import { DemoAnimalRepository } from "@/features/animals/repositories/demo-animal.repository";
import { newAnimalSchema } from "@/features/animals/schemas/animal.schema";
import { MAX_ANIMAL_PHOTOS, MAX_PHOTO_SIZE_BYTES } from "@/features/animals/photo.constants";

const photo = (index: number, fileSize = 1000) => ({
  uri: `file:///photo-${index}.jpg`,
  fileSize,
  width: 100,
  height: 100,
});

const validAnimal = {
  name: "Mel",
  species: "cachorro" as const,
  breed: "SRD",
  city: "Campinas",
  state: "sp",
  photos: [photo(1)],
  existingPhotoPaths: [],
  ageMonths: 24,
  size: "medio" as const,
  healthStatus: "saudavel" as const,
  description: "Animal dócil e saudável procurando um novo lar.",
};

describe("regras de anúncios", () => {
  it("exige pelo menos uma foto e aceita até cinco", () => {
    expect(newAnimalSchema.safeParse({ ...validAnimal, photos: [], existingPhotoPaths: [] }).success).toBe(false);
    expect(newAnimalSchema.safeParse({
      ...validAnimal,
      photos: Array.from({ length: MAX_ANIMAL_PHOTOS }, (_, index) => photo(index)),
    }).success).toBe(true);
    expect(newAnimalSchema.safeParse({
      ...validAnimal,
      photos: Array.from({ length: MAX_ANIMAL_PHOTOS + 1 }, (_, index) => photo(index)),
    }).success).toBe(false);
  });

  it("rejeita foto acima do limite antes da compressão", () => {
    expect(newAnimalSchema.safeParse({
      ...validAnimal,
      photos: [photo(1, MAX_PHOTO_SIZE_BYTES + 1)],
    }).success).toBe(false);
  });
});

describe("filtros da demonstração", () => {
  it("filtra cidade parcialmente e estado sem diferenciar maiúsculas", async () => {
    const repository = new DemoAnimalRepository();
    const results = await repository.listAvailable({ city: "camp", state: "sp" });

    expect(results).toHaveLength(1);
    expect(results[0]?.name).toBe("Thor");
  });
});
