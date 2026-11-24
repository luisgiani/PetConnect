import type { Animal } from "@/features/animals/types";

type SearchableAnimal = Pick<Animal, "name" | "breed" | "city" | "state">;

export function filterAnimalsBySearch<T extends SearchableAnimal>(animals: readonly T[], query: string): T[] {
  const terms = normalizeSearch(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [...animals];

  return animals.filter((animal) => {
    const searchableText = normalizeSearch(
      [animal.name, animal.breed, animal.city, animal.state].filter(Boolean).join(" "),
    );
    return terms.every((term) => searchableText.includes(term));
  });
}

function normalizeSearch(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}
