import { describe, expect, it } from "vitest";
import { filterAnimalsBySearch } from "@/features/animals/search";

const animals = [
  { name: "Mel", breed: "Vira-lata", city: "Campinas", state: "SP" },
  { name: "Thor", breed: "Pastor Alemão", city: "São Paulo", state: "SP" },
];

describe("busca de animais", () => {
  it("encontra por nome, raça ou cidade sem diferenciar acentos", () => {
    expect(filterAnimalsBySearch(animals, "MEL").map((animal) => animal.name)).toEqual(["Mel"]);
    expect(filterAnimalsBySearch(animals, "pastor alemao").map((animal) => animal.name)).toEqual(["Thor"]);
    expect(filterAnimalsBySearch(animals, "sao paulo").map((animal) => animal.name)).toEqual(["Thor"]);
  });

  it("exige que todos os termos apareçam e mantém a lista para busca vazia", () => {
    expect(filterAnimalsBySearch(animals, "thor campinas")).toEqual([]);
    expect(filterAnimalsBySearch(animals, "  ")).toEqual(animals);
  });
});
