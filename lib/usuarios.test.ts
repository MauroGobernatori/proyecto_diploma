import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "./db/client";
import { tienePermiso } from "./usuarios";

vi.mock("./db/client", () => ({
  prisma: {
    usuarioRol: { findMany: vi.fn() },
  },
}));

describe("tienePermiso", () => {
  beforeEach(() => vi.clearAllMocks());

  it("includes only the requested course role and platform roles", async () => {
    vi.mocked(prisma.usuarioRol.findMany).mockResolvedValue([]);

    await tienePermiso("usuario-1", "curso:modificar", { cursoId: "curso-1" });

    expect(prisma.usuarioRol.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          usuarioId: "usuario-1",
          OR: [
            { cursoId: "curso-1", grupoId: null },
            { cursoId: null, grupoId: null },
          ],
        },
      })
    );
  });

  it("does not let a role in another group grant the requested permission", async () => {
    vi.mocked(prisma.usuarioRol.findMany).mockResolvedValue([]);

    await tienePermiso("usuario-1", "grupo:modificar", { grupoId: "grupo-1" });

    expect(prisma.usuarioRol.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          usuarioId: "usuario-1",
          OR: [
            { cursoId: null, grupoId: "grupo-1" },
            { cursoId: null, grupoId: null },
          ],
        },
      })
    );
  });
});
