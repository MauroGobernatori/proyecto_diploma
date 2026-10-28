import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Prisma } from "@prisma/client";
import { asignarRolAUsuario } from "./usuarios";
import { prisma } from "./client";

vi.mock("./client", () => ({
  prisma: {
    $transaction: vi.fn(),
  },
}));

describe("asignarRolAUsuario", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("crea la inscripción al asignar un rol dentro de un curso", async () => {
    const asignacion = { id: "asignacion_1" };
    const tx = {
      usuarioRol: { create: vi.fn().mockResolvedValue(asignacion) },
      usuarioCurso: { upsert: vi.fn().mockResolvedValue({}) },
    };

    vi.mocked(prisma.$transaction).mockImplementation(
      async (callback: unknown) => {
        const execute = callback as (
          transaction: Prisma.TransactionClient
        ) => Promise<unknown>;
        return execute(tx as unknown as Prisma.TransactionClient) as never;
      }
    );

    const resultado = await asignarRolAUsuario({
      usuarioId: "user_1",
      rolId: "rol_alumno",
      cursoId: "curso_1",
    });

    expect(resultado).toBe(asignacion);
    expect(tx.usuarioCurso.upsert).toHaveBeenCalledWith({
      where: {
        usuarioId_cursoId: {
          usuarioId: "user_1",
          cursoId: "curso_1",
        },
      },
      update: {},
      create: { usuarioId: "user_1", cursoId: "curso_1" },
    });
  });

  it("no crea una inscripción si el rol no está asignado a un curso", async () => {
    const tx = {
      usuarioRol: { create: vi.fn().mockResolvedValue({ id: "asignacion_2" }) },
      usuarioCurso: { upsert: vi.fn() },
    };

    vi.mocked(prisma.$transaction).mockImplementation(
      async (callback: unknown) => {
        const execute = callback as (
          transaction: Prisma.TransactionClient
        ) => Promise<unknown>;
        return execute(tx as unknown as Prisma.TransactionClient) as never;
      }
    );

    await asignarRolAUsuario({ usuarioId: "user_1", rolId: "rol_admin" });

    expect(tx.usuarioCurso.upsert).not.toHaveBeenCalled();
  });
});
