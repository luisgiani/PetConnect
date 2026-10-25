import { z } from "zod";
import { MAX_ANIMAL_PHOTOS, MAX_PHOTO_SIZE_BYTES } from "@/features/animals/photo.constants";

const brazilianStates: readonly string[] = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
] as const;

export const newAnimalSchema = z.object({
  name: z.string().trim().min(2, "Informe pelo menos 2 caracteres.").max(80, "Use até 80 caracteres."),
  species: z.enum(["cachorro", "gato", "outro"]),
  breed: z.string().trim().max(60, "Use até 60 caracteres.").transform((value) => value || ""),
  city: z.string().trim().min(2, "Informe a cidade.").max(80, "Use até 80 caracteres."),
  state: z.string()
    .trim()
    .transform((value) => value.toUpperCase())
    .refine((value) => brazilianStates.includes(value), "Informe uma sigla válida de estado, como SP."),
  photos: z.array(z.object({
    uri: z.string().min(1),
    fileSize: z.number().positive(),
    width: z.number().nonnegative(),
    height: z.number().nonnegative(),
  }))
    .max(MAX_ANIMAL_PHOTOS, `Adicione no máximo ${MAX_ANIMAL_PHOTOS} fotos.`)
    .superRefine((photos, context) => {
      photos.forEach((photo, index) => {
        if (photo.fileSize > MAX_PHOTO_SIZE_BYTES) {
          context.addIssue({
            code: "custom",
            path: [index],
            message: "Cada foto deve ter no máximo 5 MB antes da compressão.",
          });
        }
      });
    }),
  existingPhotoPaths: z.array(z.string().min(1)),
  ageMonths: z.number().int("Informe a idade em meses inteiros.").min(0, "A idade não pode ser negativa.").max(600, "Informe uma idade válida."),
  size: z.enum(["pequeno", "medio", "grande"]),
  healthStatus: z.enum(["saudavel", "em_tratamento", "nao_informado"]),
  description: z.string().trim().min(10, "Descreva o animal com pelo menos 10 caracteres.").max(1000, "Use até 1000 caracteres."),
}).superRefine((input, context) => {
  const totalPhotos = input.photos.length + input.existingPhotoPaths.length;
  if (totalPhotos < 1) {
    context.addIssue({
      code: "custom",
      path: ["photos"],
      message: "Adicione pelo menos uma foto do animal.",
    });
  }
  if (totalPhotos > MAX_ANIMAL_PHOTOS) {
    context.addIssue({
      code: "custom",
      path: ["photos"],
      message: `Adicione no máximo ${MAX_ANIMAL_PHOTOS} fotos.`,
    });
  }
});

export type NewAnimalInput = z.infer<typeof newAnimalSchema>;
