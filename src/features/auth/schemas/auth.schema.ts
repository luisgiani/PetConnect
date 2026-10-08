import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
  password: z.string().min(1, "Informe sua senha."),
});

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome.").max(80, "Use até 80 caracteres."),
  email: z.string().trim().email("Informe um e-mail válido."),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
  profileType: z.enum(["adotante", "doador_ong"]),
  phone: z.string().trim().max(30, "Use até 30 caracteres."),
}).superRefine((input, context) => {
  if (input.profileType === "doador_ong" && input.phone.length < 8) {
    context.addIssue({
      code: "custom",
      message: "Informe um telefone válido para contato.",
      path: ["phone"],
    });
  }
});

export type SignInFormInput = z.infer<typeof signInSchema>;
export type SignUpFormInput = z.infer<typeof signUpSchema>;
