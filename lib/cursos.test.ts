import { describe, it, expect, vi, beforeEach } from "vitest";
import { validarAccesoACurso } from "./cursos";
import { prisma } from "./db/client";
import { ForbiddenError, NotFoundError } from "./errores";

vi.mock("./db/client", () => ({
  prisma: {
    curso: {
      findUnique: vi.fn(),
    },
    usuarioRol: {
      findFirst: vi.fn(),
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
    } as any);

    vi.mocked(prisma.usuarioRol.findFirst).mockResolvedValue(null);

    await expect(
      validarAccesoACurso("user_123", "curso_oculto")
    ).rejects.toThrow(ForbiddenError);
  });

  it("debe lanzar NotFoundError si el curso fue eliminado", async () => {
    vi.mocked(prisma.curso.findUnique).mockResolvedValue({
      id: "curso_1",
      estado: "ELIMINADO",
    } as any);

    await expect(
      validarAccesoACurso("user_123", "curso_1")
    ).rejects.toThrow(NotFoundError);
  });
});