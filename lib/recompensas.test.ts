import { describe, it, expect, vi, beforeEach } from "vitest";
import { evaluarYOtorgarRecompensas } from "./recompensas";
import { prisma } from "./db/client";

// Mock del cliente de Prisma
vi.mock("./db/client", () => ({
  prisma: {
    recompensa: {
      findMany: vi.fn(),
    },
    usuarioRol: {
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
    vi.mocked(prisma.usuarioRol.findMany).mockResolvedValue([
      { cursoId: "curso_1" } as any,
    ]);

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
      } as any,
    ]);

    vi.mocked(prisma.recompensaObtenida.create).mockResolvedValue({
      id: "obtenida_1",
      usuarioId,
      recompensaId: "rec_1",
    } as any);

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
    vi.mocked(prisma.usuarioRol.findMany).mockResolvedValue([
      { cursoId: "curso_1" } as any,
    ]);

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
      } as any,
    ]);

    const resultado = await evaluarYOtorgarRecompensas(usuarioId, cursoId);

    expect(resultado).toHaveLength(0);
    expect(prisma.recompensaObtenida.create).not.toHaveBeenCalled();
  });
});