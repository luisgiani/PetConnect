import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimalService } from "@/features/animals/services/animal.service";
import type { NewAnimal } from "@/features/animals/types";
import { animalRepository } from "@/features/animals/repository";

const animalService = new AnimalService(animalRepository);

export function useAnimals() {
  return useQuery({
    queryKey: ["animals"],
    queryFn: () => animalService.listAvailable(),
  });
}

export function useAnimal(id: string) {
  return useQuery({
    queryKey: ["animals", id],
    queryFn: () => animalService.getById(id),
    enabled: Boolean(id),
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
  });
}
