import { prisma } from "./client";
import {
  CrearCursoInput,
  ActualizarCursoInput,
  CrearSeccionInput,
  CrearRecursoInput,
} from "../schemas/curso";

export async function obtenerCursos(soloVisibles = false) {
  return prisma.curso.findMany({
    where: soloVisibles
      ? { visibilidad: true, estado: { not: "ELIMINADO" } }
      : { estado: { not: "ELIMINADO" } },
    orderBy: { creadoEn: "desc" },
  });
}

export async function obtenerCursoPorId(id: string) {
  return prisma.curso.findUnique({
    where: { id },
    include: {
      secciones: {
        orderBy: { orden: "asc" },
        include: {
          recursos: {
            orderBy: { orden: "asc" },
          },
        },
      },
    },
  });
}

export async function crearCurso(data: CrearCursoInput) {
  return prisma.curso.create({
    data,
  });
}

export async function actualizarCurso(
  id: string,
  data: ActualizarCursoInput
) {
  return prisma.curso.update({
    where: { id },
    data,
  });
}

export async function eliminarCursoLogicamente(id: string) {
  return prisma.curso.update({
    where: { id },
    data: { estado: "ELIMINADO", visibilidad: false },
  });
}

export async function crearSeccion(data: CrearSeccionInput) {
  return prisma.seccion.create({
    data,
  });
}

export async function crearRecurso(data: CrearRecursoInput) {
  return prisma.recurso.create({
    data: {
      nombre: data.nombre,
      descripcion: data.descripcion,
      tipo: data.tipo,
      url: data.url || null,
      orden: data.orden,
      seccionId: data.seccionId,
    },
  });
}