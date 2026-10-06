import { z } from "zod";

export const newAnimalSchema = z.object({
  name: z.string().trim().min(2, "Informe pelo menos 2 caracteres.").max(80, "Use até 80 caracteres."),
  species: z.enum(["cachorro", "gato", "outro"]),
  breed: z.string().trim().max(60, "Use até 60 caracteres.").transform((value) => value || ""),
  ageMonths: z.number().int("Informe a idade em meses inteiros.").min(0, "A idade não pode ser negativa.").max(600, "Informe uma idade válida."),
  size: z.enum(["pequeno", "medio", "grande"]),
  healthStatus: z.enum(["saudavel", "em_tratamento", "nao_informado"]),
  description: z.string().trim().min(10, "Descreva o animal com pelo menos 10 caracteres.").max(1000, "Use até 1000 caracteres."),
});

export type NewAnimalInput = z.infer<typeof newAnimalSchema>;
