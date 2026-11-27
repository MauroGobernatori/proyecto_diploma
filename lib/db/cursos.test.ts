import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Prisma } from "@prisma/client";
import { prisma } from "./client";
import { desinscribirAlumno } from "./cursos";

vi.mock("./client", () => ({ prisma: { $transaction: vi.fn() } }));

describe("desinscribirAlumno", () => {
  beforeEach(() => vi.clearAllMocks());

  it("quita rol e inscripción preservando las entregas y restringe al Gestor a usuarios General", async () => {
    const tx = {
      usuarioRol: {
        findFirst: vi.fn().mockResolvedValue({ id: "general-1" }),
        deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      rol: { findUnique: vi.fn().mockResolvedValue({ id: "alumno-role" }) },
      usuarioCurso: { deleteMany: vi.fn().mockResolvedValue({ count: 1 }) },
      actividadEntrega: { deleteMany: vi.fn() },
    };
    vi.mocked(prisma.$transaction).mockImplementation(async (callback: unknown) => {
      const execute = callback as (transaction: Prisma.TransactionClient) => Promise<unknown>;
      return execute(tx as unknown as Prisma.TransactionClient) as never;
    });

    await desinscribirAlumno("curso-1", "alumno-1", true);

    expect(tx.usuarioRol.deleteMany).toHaveBeenCalledWith({
      where: { usuarioId: "alumno-1", rolId: "alumno-role", cursoId: "curso-1", grupoId: null },
    });
    expect(tx.usuarioCurso.deleteMany).toHaveBeenCalledWith({ where: { usuarioId: "alumno-1", cursoId: "curso-1" } });
    expect(tx.actividadEntrega.deleteMany).not.toHaveBeenCalled();
  });
});
