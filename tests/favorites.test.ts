import { describe, expect, it } from "vitest";
import { parseFavoriteIds, toggleFavoriteId } from "@/features/animals/favorites";

describe("favoritos", () => {
  it("carrega IDs persistidos e trata armazenamento vazio", () => {
    expect(parseFavoriteIds(null)).toEqual([]);
    expect(parseFavoriteIds('["animal-1","animal-2"]')).toEqual(["animal-1", "animal-2"]);
  });

  it("rejeita dados persistidos inválidos", () => {
    expect(() => parseFavoriteIds('{"id":"animal-1"}')).toThrow("formato inválido");
    expect(() => parseFavoriteIds('["animal-1",2]')).toThrow("formato inválido");
  });

  it("adiciona e remove um animal da lista", () => {
    expect(toggleFavoriteId([], "animal-1")).toEqual(["animal-1"]);
    expect(toggleFavoriteId(["animal-1", "animal-2"], "animal-1")).toEqual(["animal-2"]);
  });
});
