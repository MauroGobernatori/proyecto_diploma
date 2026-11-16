import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Prisma } from "@prisma/client";
import { asignarRolAUsuario, crearUsuario } from "./usuarios";
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

describe("crearUsuario", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("guarda un hash y asigna el rol General en la misma transacción", async () => {
    const tx = {
      rol: { upsert: vi.fn().mockResolvedValue({ id: "rol_general" }) },
      usuario: {
        create: vi.fn().mockImplementation(({ data }) => ({
          id: "usuario_nuevo",
          usuario: data.usuario,
          nombre: data.nombre,
          apellido: data.apellido,
          email: data.email,
        })),
      },
      usuarioRol: { create: vi.fn().mockResolvedValue({}) },
    };

    vi.mocked(prisma.$transaction).mockImplementation(
      async (callback: unknown) => {
        const execute = callback as (transaction: Prisma.TransactionClient) => Promise<unknown>;
        return execute(tx as unknown as Prisma.TransactionClient) as never;
      }
    );

    await crearUsuario({
      usuario: "ana_rios",
      contrasenia: "una-clave-larga-y-segura",
      nombre: "Ana",
      apellido: "Ríos",
      email: "ANA@EJEMPLO.COM",
    });

    const createCall = vi.mocked(tx.usuario.create).mock.calls[0][0];
    expect(createCall.data.email).toBe("ana@ejemplo.com");
    expect(createCall.data.contraseniaHash).toMatch(/^\$argon2id\$/);
    expect(createCall.data.contraseniaHash).not.toContain("una-clave-larga-y-segura");
    expect(tx.usuarioRol.create).toHaveBeenCalledWith({
      data: { usuarioId: "usuario_nuevo", rolId: "rol_general" },
    });
  });
});
