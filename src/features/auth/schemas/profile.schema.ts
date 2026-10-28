import { z } from "zod";
import { phoneDigits } from "@/features/auth/profile.formatters";

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome.").max(80, "Use até 80 caracteres.").regex(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/, "Use apenas letras no nome."),
  phone: z.string().trim().max(30, "Use até 30 caracteres."),
  city: z.string().trim().max(80, "Use até 80 caracteres.").regex(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]*$/, "Use apenas letras na cidade."),
  state: z.string().trim().regex(/^$|^[A-Za-z]{2}$/, "Informe a UF com 2 letras."),
  bio: z.string().trim().max(500, "Use até 500 caracteres."),
}).superRefine((input, context) => {
  const digits = phoneDigits(input.phone);
  if (digits.length > 0 && digits.length !== 10 && digits.length !== 11) {
    context.addIssue({ code: "custom", message: "Informe um telefone com DDD válido.", path: ["phone"] });
  }
});

export type ProfileFormInput = z.infer<typeof profileSchema>;
