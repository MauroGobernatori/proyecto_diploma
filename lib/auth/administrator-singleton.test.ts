import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "../db/client";
import { AdministradorSingleton } from "./administrator-singleton";

vi.mock("../db/client", () => ({
  prisma: { usuarioRol: { findFirst: vi.fn() } },
}));

describe("AdministradorSingleton", () => {
  beforeEach(() => {
    vi.mocked(prisma.usuarioRol.findFirst).mockReset();
  });

  it("devuelve la misma instancia", () => {
    expect(AdministradorSingleton.obtenerInstancia())
      .toBe(AdministradorSingleton.obtenerInstancia());
  });

  it("reconoce la asignación única y resuelve la identidad persistida", async () => {
    const singleton = AdministradorSingleton.obtenerInstancia();
    vi.mocked(prisma.usuarioRol.findFirst).mockResolvedValue({ id: "rol-admin" } as never);

    expect(singleton.esAdministradorEnAsignaciones([
      { administradorUnico: false },
      { administradorUnico: true },
    ])).toBe(true);
    expect(singleton.esAdministradorEnAsignaciones([{ administradorUnico: false }])).toBe(false);
    await expect(singleton.esAdministrador("usuario-admin")).resolves.toBe(true);
    expect(prisma.usuarioRol.findFirst).toHaveBeenCalledWith({
      where: { usuarioId: "usuario-admin", administradorUnico: true },
      select: { id: true },
    });
  });
});
