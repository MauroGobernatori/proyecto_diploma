import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Prisma } from "@prisma/client";
import { finalizarCursoParaUsuario, validarAccesoACurso } from "./cursos";
import { prisma } from "./db/client";
import { ForbiddenError, NotFoundError } from "./errores";

vi.mock("./db/client", () => ({
  prisma: {
    $transaction: vi.fn(),
    curso: {
      findUnique: vi.fn(),
    },
    usuarioRol: {
      findFirst: vi.fn(),
    },
    usuarioCurso: {
      updateMany: vi.fn(),
      findUnique: vi.fn(),
    },
    recompensa: {
      findMany: vi.fn(),
    },
    recompensaObtenida: {
      create: vi.fn(),
    },
  },
}));

describe("validarAccesoACurso", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe rechazar el acceso si el curso está oculto y el usuario no tiene permisos", async () => {
    vi.mocked(prisma.curso.findUnique).mockResolvedValue({
      id: "curso_oculto",
      visibilidad: false,
      estado: "EN_CURSO",
    } as unknown as Awaited<ReturnType<typeof prisma.curso.findUnique>>);

    vi.mocked(prisma.usuarioRol.findFirst).mockResolvedValue(null);

    await expect(
      validarAccesoACurso("user_123", "curso_oculto")
    ).rejects.toThrow(ForbiddenError);
  });

  it("debe lanzar NotFoundError si el curso fue eliminado", async () => {
    vi.mocked(prisma.curso.findUnique).mockResolvedValue({
      id: "curso_1",
      estado: "ELIMINADO",
    } as unknown as Awaited<ReturnType<typeof prisma.curso.findUnique>>);

    await expect(
      validarAccesoACurso("user_123", "curso_1")
    ).rejects.toThrow(NotFoundError);
  });
});

describe("finalizarCursoParaUsuario", () => {
  it("guarda la finalización y evalúa recompensas dentro de la transacción", async () => {
    const tx = {
      usuarioCurso: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        findUnique: vi.fn(),
        findMany: vi.fn().mockResolvedValue([]),
      },
      recompensa: { findMany: vi.fn().mockResolvedValue([]) },
      recompensaObtenida: { create: vi.fn() },
    };

    vi.mocked(prisma.$transaction).mockImplementation(
      async (callback: unknown) => {
        const execute = callback as (
          transaction: Prisma.TransactionClient
        ) => Promise<unknown>;
        return execute(tx as unknown as Prisma.TransactionClient) as never;
      }
    );

    const resultado = await finalizarCursoParaUsuario("user_1", "curso_1");

    expect(resultado).toEqual([]);
    expect(tx.usuarioCurso.updateMany).toHaveBeenCalledWith({
      where: {
        usuarioId: "user_1",
        cursoId: "curso_1",
        estado: "EN_CURSO",
      },
      data: {
        estado: "FINALIZADO",
        fechaFinalizacion: expect.any(Date),
      },
    });
    expect(tx.recompensa.findMany).toHaveBeenCalled();
  });

  it("no vuelve a evaluar recompensas si el curso ya estaba finalizado", async () => {
    const tx = {
      usuarioCurso: {
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        findUnique: vi.fn().mockResolvedValue({ estado: "FINALIZADO" }),
      },
      recompensa: { findMany: vi.fn() },
      recompensaObtenida: { create: vi.fn() },
    };

    vi.mocked(prisma.$transaction).mockImplementation(
      async (callback: unknown) => {
        const execute = callback as (
          transaction: Prisma.TransactionClient
        ) => Promise<unknown>;
        return execute(tx as unknown as Prisma.TransactionClient) as never;
      }
    );

    const resultado = await finalizarCursoParaUsuario("user_1", "curso_1");

    expect(resultado).toEqual([]);
    expect(tx.recompensa.findMany).not.toHaveBeenCalled();
  });
});
