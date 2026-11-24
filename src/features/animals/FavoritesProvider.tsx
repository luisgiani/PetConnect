import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useAuth } from "@/features/auth/AuthProvider";
import { parseFavoriteIds, toggleFavoriteId } from "@/features/animals/favorites";

type FavoritesContextValue = {
  favoriteIds: string[];
  isLoading: boolean;
  error: string | null;
  isFavorite(id: string): boolean;
  toggleFavorite(id: string): Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const storageKey = profile ? `petconnect:favorites:${profile.id}` : null;
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const favoriteIdsRef = useRef<string[]>([]);
  const storageKeyRef = useRef<string | null>(storageKey);
  const writeQueue = useRef<Promise<void>>(Promise.resolve());
  storageKeyRef.current = storageKey;

  useEffect(() => {
    let active = true;
    favoriteIdsRef.current = [];
    setFavoriteIds([]);
    setError(null);

    if (!storageKey) {
      setLoadedKey(null);
      return () => { active = false; };
    }

    setLoadedKey(null);
    void AsyncStorage.getItem(storageKey).then((value) => {
      const parsed = parseFavoriteIds(value);
      if (!active) return;
      favoriteIdsRef.current = parsed;
      setFavoriteIds(parsed);
      setLoadedKey(storageKey);
    }).catch((loadError: unknown) => {
      if (!active) return;
      setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar seus favoritos.");
      setLoadedKey(storageKey);
    });

    return () => { active = false; };
  }, [storageKey]);

  const toggleFavorite = useCallback((id: string) => {
    if (!storageKey || loadedKey !== storageKey) {
      return Promise.reject(new Error("Aguarde o carregamento dos favoritos."));
    }
    if (error) return Promise.reject(new Error(error));

    const targetKey = storageKey;
    const operation = writeQueue.current.then(async () => {
      const current = favoriteIdsRef.current;
      const next = toggleFavoriteId(current, id);
      await AsyncStorage.setItem(targetKey, JSON.stringify(next));
      if (storageKeyRef.current === targetKey) {
        favoriteIdsRef.current = next;
        setFavoriteIds(next);
        setError(null);
      }
    });

    writeQueue.current = operation.catch(() => undefined);
    return operation.catch((writeError: unknown) => {
      const message = writeError instanceof Error ? writeError.message : "Não foi possível salvar o favorito.";
      if (storageKeyRef.current === targetKey) setError(message);
      throw new Error(message);
    });
  }, [error, loadedKey, storageKey]);

  const visibleFavoriteIds = storageKey && loadedKey === storageKey ? favoriteIds : [];
  const value: FavoritesContextValue = {
    favoriteIds: visibleFavoriteIds,
    isLoading: Boolean(storageKey && loadedKey !== storageKey),
    error: storageKey && loadedKey === storageKey ? error : null,
    isFavorite: (id) => visibleFavoriteIds.includes(id),
    toggleFavorite,
  };

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites deve ser usado dentro de FavoritesProvider.");
  return context;
}
