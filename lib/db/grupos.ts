import { prisma } from "./client";
import { CrearGrupoInput } from "../schemas/grupo";

export async function obtenerGrupos() {
  return prisma.grupo.findMany({
    include: {
      usuarios: {
        include: {
          usuario: {
            select: { id: true, nombre: true, apellido: true, email: true },
          },
          rol: true,
        },
      },
    },
  });
}

export async function obtenerGrupoPorId(id: string) {
  return prisma.grupo.findUnique({
    where: { id },
    include: {
      usuarios: {
        include: {
          usuario: true,
          rol: true,
        },
      },
    },
  });
}

export async function crearGrupo(data: CrearGrupoInput) {
  return prisma.grupo.create({
    data: {
      nombre: data.nombre,
      ...(data.integrantes && data.integrantes.length > 0
        ? {
            usuarios: {
              create: data.integrantes.map((i) => ({
                usuarioId: i.usuarioId,
                rolId: i.rolId,
              })),
            },
          }
        : {}),
    },
  });
}