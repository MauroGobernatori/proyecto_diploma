import { describe, it, expect, vi, beforeEach } from "vitest";
import { evaluarYOtorgarRecompensas } from "./recompensas";
import { prisma } from "./db/client";

// Mock del cliente de Prisma
vi.mock("./db/client", () => ({
  prisma: {
    recompensa: {
      findMany: vi.fn(),
    },
    usuarioCurso: {
      findMany: vi.fn(),
    },
    recompensaObtenida: {
      create: vi.fn(),
    },
  },
}));

describe("evaluarYOtorgarRecompensas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe otorgar la recompensa si el alumno cumple una regla de curso individual", async () => {
    const usuarioId = "user_123";
    const cursoId = "curso_1";

    // Simular que el usuario completó 'curso_1'
    vi.mocked(prisma.usuarioCurso.findMany).mockResolvedValue([
      { cursoId: "curso_1" },
    ] as unknown as Awaited<ReturnType<typeof prisma.usuarioCurso.findMany>>);

    // Simular recompensa activa con regla individual
    vi.mocked(prisma.recompensa.findMany).mockResolvedValue([
      {
        id: "rec_1",
        nombre: "Premio Individual",
        otorgamientoMultiple: false,
        obtenidasPor: [],
        reglas: [
          {
            id: "regla_1",
            cursos: [{ id: "curso_1" }],
          },
        ],
      },
    ] as unknown as Awaited<ReturnType<typeof prisma.recompensa.findMany>>);

    vi.mocked(prisma.recompensaObtenida.create).mockResolvedValue({
      id: "obtenida_1",
      usuarioId,
      recompensaId: "rec_1",
    } as unknown as Awaited<ReturnType<typeof prisma.recompensaObtenida.create>>);

    const resultado = await evaluarYOtorgarRecompensas(usuarioId, cursoId);

    expect(resultado).toHaveLength(1);
    expect(prisma.recompensaObtenida.create).toHaveBeenCalledWith({
      data: { usuarioId, recompensaId: "rec_1" },
      include: { recompensa: true },
    });
  });

  it("NO debe otorgar la recompensa si la regla exige varios cursos y el alumno solo completó uno", async () => {
    const usuarioId = "user_123";
    const cursoId = "curso_1";

    // El usuario solo completó 'curso_1'
    vi.mocked(prisma.usuarioCurso.findMany).mockResolvedValue([
      { cursoId: "curso_1" },
    ] as unknown as Awaited<ReturnType<typeof prisma.usuarioCurso.findMany>>);

    // Recompensa requiere 'curso_1' Y 'curso_2' en la misma regla
    vi.mocked(prisma.recompensa.findMany).mockResolvedValue([
      {
        id: "rec_combo",
        nombre: "Premio Combo",
        otorgamientoMultiple: false,
        obtenidasPor: [],
        reglas: [
          {
            id: "regla_combo",
            cursos: [{ id: "curso_1" }, { id: "curso_2" }],
          },
        ],
      },
    ] as unknown as Awaited<ReturnType<typeof prisma.recompensa.findMany>>);

    const resultado = await evaluarYOtorgarRecompensas(usuarioId, cursoId);

    expect(resultado).toHaveLength(0);
    expect(prisma.recompensaObtenida.create).not.toHaveBeenCalled();
  });

  it("debe contar solo los cursos finalizados para satisfacer las reglas", async () => {
    const usuarioId = "user_123";
    const cursoId = "curso_1";

    vi.mocked(prisma.recompensa.findMany).mockResolvedValue([
      {
        id: "rec_1",
        nombre: "Premio con alternativas",
        otorgamientoMultiple: false,
        obtenidasPor: [],
        reglas: [
          { id: "regla_individual", cursos: [{ id: "curso_1" }] },
          {
            id: "regla_grupal",
            cursos: [{ id: "curso_2" }, { id: "curso_3" }],
          },
        ],
      },
    ] as unknown as Awaited<ReturnType<typeof prisma.recompensa.findMany>>);
    vi.mocked(prisma.usuarioCurso.findMany).mockResolvedValue([
      { cursoId: "curso_1" },
    ] as unknown as Awaited<ReturnType<typeof prisma.usuarioCurso.findMany>>);
    vi.mocked(prisma.recompensaObtenida.create).mockResolvedValue({
      id: "obtenida_1",
      usuarioId,
      recompensaId: "rec_1",
    } as unknown as Awaited<ReturnType<typeof prisma.recompensaObtenida.create>>);

    const resultado = await evaluarYOtorgarRecompensas(usuarioId, cursoId);

    expect(prisma.usuarioCurso.findMany).toHaveBeenCalledWith({
      where: { usuarioId, estado: "FINALIZADO" },
      select: { cursoId: true },
    });
    expect(resultado).toHaveLength(1);
  });

  it("no debe otorgar otra vez por una regla ya cumplida al completar un curso de otra regla incompleta", async () => {
    const usuarioId = "user_123";
    const cursoReciénFinalizado = "curso_2";

    vi.mocked(prisma.recompensa.findMany).mockResolvedValue([
      {
        id: "rec_multiple",
        nombre: "Premio con alternativas",
        otorgamientoMultiple: true,
        obtenidasPor: [{ usuarioId, recompensaId: "rec_multiple" }],
        reglas: [
          { id: "regla_individual", cursos: [{ id: "curso_1" }] },
          {
            id: "regla_grupal",
            cursos: [{ id: "curso_2" }, { id: "curso_3" }],
          },
        ],
      },
    ] as unknown as Awaited<ReturnType<typeof prisma.recompensa.findMany>>);
    vi.mocked(prisma.usuarioCurso.findMany).mockResolvedValue([
      { cursoId: "curso_1" },
      { cursoId: "curso_2" },
    ] as unknown as Awaited<ReturnType<typeof prisma.usuarioCurso.findMany>>);

    const resultado = await evaluarYOtorgarRecompensas(
      usuarioId,
      cursoReciénFinalizado
    );

    expect(resultado).toHaveLength(0);
    expect(prisma.recompensaObtenida.create).not.toHaveBeenCalled();
  });
});
