import { describe, expect, it } from "vitest";
import { getProfileHomeRoute, getRoleRedirect } from "@/features/auth/role-navigation";

describe("acesso por perfil", () => {
  it("permite ao adotante navegar na lista e bloqueia publicação e gerenciamento", () => {
    expect(getProfileHomeRoute("adotante")).toBe("/animals");
    expect(getRoleRedirect("adotante", "/animals")).toBeNull();
    expect(getRoleRedirect("adotante", "/animals/animal-id")).toBeNull();
    expect(getRoleRedirect("adotante", "/animals/new")).toBe("/animals");
    expect(getRoleRedirect("adotante", "/animals/manage")).toBe("/animals");
  });

  it("restringe o doador à área de anúncios e cadastro", () => {
    expect(getProfileHomeRoute("doador_ong")).toBe("/animals/manage");
    expect(getRoleRedirect("doador_ong", "/animals/manage")).toBeNull();
    expect(getRoleRedirect("doador_ong", "/animals/new")).toBeNull();
    expect(getRoleRedirect("doador_ong", "/animals")).toBe("/animals/manage");
    expect(getRoleRedirect("doador_ong", "/animals/animal-id")).toBe("/animals/manage");
  });
});
