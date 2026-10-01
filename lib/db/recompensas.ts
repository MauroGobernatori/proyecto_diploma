import { prisma } from "./client";
import { CrearRecompensaInput } from "../schemas/recompensa";

export async function obtenerRecompensas() {
  return prisma.recompensa.findMany({
    where: { estado: { not: "ELIMINADO" } },
    include: {
      reglas: {
        include: {
          cursos: {
            select: { id: true, nombre: true },
          },
        },
      },
    },
    orderBy: { creadoEn: "desc" },
  });
}

export async function obtenerRecompensaPorId(id: string) {
  return prisma.recompensa.findUnique({
    where: { id },
    include: {
      reglas: {
        include: {
          cursos: true,
        },
      },
    },
  });
}

export async function crearRecompensa(data: CrearRecompensaInput) {
  const { reglas, ...datosRecompensa } = data;

  return prisma.recompensa.create({
    data: {
      ...datosRecompensa,
      reglas: {
        create: reglas.map((regla) => ({
          nombre: regla.nombre,
          cursos: {
            connect: regla.cursoIds.map((id) => ({ id })),
          },
        })),
      },
    },
    include: {
      reglas: {
        include: { cursos: true },
      },
    },
  });
}

export async function obtenerRecompensasObtenidasPorUsuario(usuarioId: string) {
  return prisma.recompensaObtenida.findMany({
    where: { usuarioId },
    include: {
      recompensa: true,
    },
    orderBy: { fechaObtencion: "desc" },
  });
}