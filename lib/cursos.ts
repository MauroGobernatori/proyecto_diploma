import { prisma } from "./db/client";
import { ForbiddenError, NotFoundError } from "./errores";

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