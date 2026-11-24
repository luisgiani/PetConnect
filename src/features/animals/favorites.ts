export function parseFavoriteIds(value: string | null): string[] {
  const parsed: unknown = value === null ? [] : JSON.parse(value);
  if (!Array.isArray(parsed) || parsed.some((id) => typeof id !== "string")) {
    throw new Error("Os favoritos salvos estão em um formato inválido.");
  }
  return parsed;
}

export function toggleFavoriteId(current: readonly string[], id: string): string[] {
  return current.includes(id)
    ? current.filter((favoriteId) => favoriteId !== id)
    : [...current, id];
}
