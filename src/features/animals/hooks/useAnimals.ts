import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimalService } from "@/features/animals/services/animal.service";
import type { AnimalFilters, AnimalStatus, NewAnimal } from "@/features/animals/types";
import { animalRepository } from "@/features/animals/repository";

const animalService = new AnimalService(animalRepository);

export function useAnimals(filters: AnimalFilters = {}) {
  return useQuery({
    queryKey: ["animals", "available", filters],
    queryFn: () => animalService.listAvailable(filters),
  });
}

export function useAnimal(id: string) {
  return useQuery({
    queryKey: ["animals", id],
    queryFn: () => animalService.getById(id),
    enabled: Boolean(id),
  });
}

export function useMyAnimals(enabled: boolean) {
  return useQuery({
    queryKey: ["animals", "mine"],
    queryFn: () => animalService.listMine(),
    enabled,
  });
}

export function useCreateAnimal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (animal: NewAnimal) => animalService.create(animal),
    onSuccess: async (animal) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["animals"] }),
        queryClient.setQueryData(["animals", animal.id], animal),
      ]);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["animals"] });
    },
  });
}

export function useUpdateAnimal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, animal, retainedPhotoPaths }: {
      id: string;
      animal: NewAnimal;
      retainedPhotoPaths: string[];
    }) => animalRepository.update(id, animal, retainedPhotoPaths),
    onSuccess: async (animal) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["animals"] }),
        queryClient.setQueryData(["animals", animal.id], animal),
      ]);
    },
  });
}

export function useSetAnimalStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AnimalStatus }) =>
      animalRepository.setStatus(id, status),
    onSuccess: async (animal) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["animals"] }),
        queryClient.setQueryData(["animals", animal.id], animal),
      ]);
    },
  });
}
