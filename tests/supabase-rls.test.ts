import { beforeAll, describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type TestUser = {
  email: string;
  password: string;
};

type RlsTestContext = {
  owner: SupabaseClient;
  otherUser: SupabaseClient;
  ownerId: string;
  otherUserId: string;
  animalId: string;
};

const requiredEnvironment = [
  "SUPABASE_RLS_URL",
  "SUPABASE_RLS_KEY",
  "SUPABASE_RLS_OWNER_EMAIL",
  "SUPABASE_RLS_OWNER_PASSWORD",
  "SUPABASE_RLS_OTHER_EMAIL",
  "SUPABASE_RLS_OTHER_PASSWORD",
  "SUPABASE_RLS_ANIMAL_ID",
] as const;

let context: RlsTestContext;

describe("políticas RLS do Supabase", () => {
  beforeAll(async () => {
    const missing = requiredEnvironment.filter((name) => !process.env[name]);
    if (missing.length > 0) {
      throw new Error(
        `Configure as variáveis ${missing.join(", ")} antes de executar npm run test:rls. Use contas de teste e um anúncio disponível; não use chaves secret/service_role.`,
      );
    }

    const url = process.env.SUPABASE_RLS_URL as string;
    const key = process.env.SUPABASE_RLS_KEY as string;
    const ownerCredentials: TestUser = {
      email: process.env.SUPABASE_RLS_OWNER_EMAIL as string,
      password: process.env.SUPABASE_RLS_OWNER_PASSWORD as string,
    };
    const otherCredentials: TestUser = {
      email: process.env.SUPABASE_RLS_OTHER_EMAIL as string,
      password: process.env.SUPABASE_RLS_OTHER_PASSWORD as string,
    };

    const owner = createClient(url, key);
    const otherUser = createClient(url, key);
    const [ownerResult, otherResult] = await Promise.all([
      owner.auth.signInWithPassword(ownerCredentials),
      otherUser.auth.signInWithPassword(otherCredentials),
    ]);

    if (ownerResult.error) throw new Error(`Não foi possível autenticar a conta proprietária: ${ownerResult.error.message}`);
    if (otherResult.error) throw new Error(`Não foi possível autenticar a segunda conta: ${otherResult.error.message}`);
    if (!ownerResult.data.user || !otherResult.data.user) throw new Error("As contas de teste não retornaram usuários autenticados.");

    context = {
      owner,
      otherUser,
      ownerId: ownerResult.data.user.id,
      otherUserId: otherResult.data.user.id,
      animalId: process.env.SUPABASE_RLS_ANIMAL_ID as string,
    };
  });

  it("permite ao usuário autenticado consultar somente o próprio perfil", async () => {
    const ownProfile = await context.owner.from("profiles").select("id").eq("id", context.ownerId);
    const otherProfile = await context.owner.from("profiles").select("id").eq("id", context.otherUserId);

    expect(ownProfile.error).toBeNull();
    expect(ownProfile.data).toHaveLength(1);
    expect(otherProfile.error).toBeNull();
    expect(otherProfile.data).toHaveLength(0);
  });

  it("não expõe perfis diretamente para sessão anônima", async () => {
    const anonymous = createClient(process.env.SUPABASE_RLS_URL as string, process.env.SUPABASE_RLS_KEY as string);
    const result = await anonymous.from("profiles").select("id").eq("id", context.ownerId);

    expect(result.data ?? []).toHaveLength(0);
  });

  it("permite consultar contato somente pela função controlada", async () => {
    const ownerContact = await context.owner.rpc("get_animal_contacts", { p_animal_ids: [context.animalId] });
    const otherContact = await context.otherUser.rpc("get_animal_contacts", { p_animal_ids: [context.animalId] });

    expect(ownerContact.error).toBeNull();
    expect(otherContact.error).toBeNull();
    expect(ownerContact.data).toHaveLength(1);
    expect(otherContact.data).toHaveLength(1);
    expect(ownerContact.data?.[0]?.animal_id).toBe(context.animalId);
  });

  it("não permite inserir anúncio com a conta adotante", async () => {
    const result = await context.otherUser.from("animals").insert({
      owner_id: context.otherUserId,
      name: "Teste RLS",
      species: "gato",
      breed: null,
      age_months: 12,
      size: "pequeno",
      health_status: "saudavel",
      description: "Registro temporário para validar a policy de inserção.",
      city: "São Paulo",
      state: "SP",
      photo_paths: ["rls-test-placeholder"],
    }).select("id");

    expect(result.data).toBeNull();
    expect(result.error).not.toBeNull();
  });
});
