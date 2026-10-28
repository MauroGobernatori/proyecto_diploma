import { prisma } from "./db/client";
import { ForbiddenError, NotFoundError } from "./errores";
import { evaluarYOtorgarRecompensas } from "./recompensas";

/**
 * Valida si un usuario tiene acceso a ver el contenido de un curso.
 */
export async function validarAccesoACurso(usuarioId: string, cursoId: string) {
  const curso = await prisma.curso.findUnique({
    where: { id: cursoId },
  });

  if (!curso || curso.estado === "ELIMINADO") {
    throw new NotFoundError("El curso no existe o ha sido eliminado");
  }

  // Si el curso es público/visible, cualquier usuario autenticado puede entrar
  if (curso.visibilidad) {
    return curso;
  }

  // Si está oculto, requiere rol específico en el curso o ser Administrador
  const asignacionRol = await prisma.usuarioRol.findFirst({
    where: {
      usuarioId,
      OR: [
        { cursoId },
        { rol: { nombre: "Administrador" } },
        { rol: { nombre: "Gestor" } },
      ],
    },
  });

  if (!asignacionRol) {
    throw new ForbiddenError("El curso está oculto y no tenés permisos para acceder");
  }

  return curso;
}

/**
 * Marca como finalizado el curso de un usuario y evalúa sus recompensas.
 * La finalización y los otorgamientos se confirman en una única transacción.
 */
export async function finalizarCursoParaUsuario(
  usuarioId: string,
  cursoId: string
) {
  return prisma.$transaction(async (tx) => {
    const actualizacion = await tx.usuarioCurso.updateMany({
      where: {
        usuarioId,
        cursoId,
        estado: "EN_CURSO",
      },
      data: {
        estado: "FINALIZADO",
        fechaFinalizacion: new Date(),
      },
    });

    if (actualizacion.count === 0) {
      const inscripcion = await tx.usuarioCurso.findUnique({
        where: {
          usuarioId_cursoId: { usuarioId, cursoId },
        },
        select: { estado: true },
      });

      if (!inscripcion) {
        throw new NotFoundError("El usuario no está inscripto a este curso");
      }

      // Repetir la solicitud de finalización no vuelve a otorgar recompensas.
      return [];
    }

    return evaluarYOtorgarRecompensas(usuarioId, cursoId, tx);
  });
}
