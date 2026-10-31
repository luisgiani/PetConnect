import { describe, expect, it } from "vitest";
import { formatBrazilPhone, onlyLetters, onlyLettersAndSpaces, phoneDigits } from "@/features/auth/profile.formatters";
import { profileSchema } from "@/features/auth/schemas/profile.schema";
import { signUpSchema } from "@/features/auth/schemas/auth.schema";

describe("formatadores de perfil", () => {
  it("formata celulares e telefones fixos brasileiros", () => {
    expect(formatBrazilPhone("11995987700")).toBe("(11) 99598-7700");
    expect(formatBrazilPhone("1132123456")).toBe("(11) 3212-3456");
  });

  it("remove caracteres inválidos dos campos textuais", () => {
    expect(onlyLettersAndSpaces("João 123!")).toBe("João ");
    expect(onlyLetters("s1p")).toBe("SP");
    expect(phoneDigits("(11) 99598-7700")).toBe("11995987700");
  });
});

describe("validação de perfil e cadastro", () => {
  const validProfile = {
    name: "João da Silva",
    phone: "(11) 99598-7700",
    city: "São Paulo",
    state: "SP",
    bio: "",
  };

  it("aceita perfil com telefone celular válido", () => {
    expect(profileSchema.safeParse(validProfile).success).toBe(true);
  });

  it("rejeita números em nome e UF inválida", () => {
    expect(profileSchema.safeParse({ ...validProfile, name: "João 123" }).success).toBe(false);
    expect(profileSchema.safeParse({ ...validProfile, state: "S1" }).success).toBe(false);
  });

  it("exige telefone válido para doador/ONG", () => {
    const input = {
      name: "João da Silva",
      email: "joao@example.com",
      password: "senha-segura",
      profileType: "doador_ong" as const,
      phone: "(11) 9598-770",
    };

    expect(signUpSchema.safeParse(input).success).toBe(false);
    expect(signUpSchema.safeParse({ ...input, phone: "(11) 99598-7700" }).success).toBe(true);
  });
});
