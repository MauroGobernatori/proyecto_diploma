import type { Prisma } from "@prisma/client";
import { prisma } from "./db/client";

type ClienteRecompensas = Pick<
  Prisma.TransactionClient,
  "recompensa" | "usuarioCurso" | "recompensaObtenida"
>;

/**
 * Evalúa y otorga recompensas automáticas a un alumno.
 */
export async function evaluarYOtorgarRecompensas(
  usuarioId: string,
  cursoIdRecientementeCompletado: string,
  cliente: ClienteRecompensas = prisma
) {
  const ahora = new Date();

  // 1. Buscar recompensas activas que tengan alguna regla vinculada al curso recién completado
  const recompensas = await cliente.recompensa.findMany({
    where: {
      estado: "ACTIVO",
      fechaHabilitacion: { lte: ahora },
      fechaInhabilitacion: { gte: ahora },
      reglas: {
        some: {
          cursos: {
            some: { id: cursoIdRecientementeCompletado },
          },
        },
      },
    },
    include: {
      reglas: {
        include: { cursos: true },
      },
      obtenidasPor: {
        where: { usuarioId },
      },
    },
  });

  // Solo contar cursos cuya inscripción individual esté finalizada.
  const cursosFinalizados = await cliente.usuarioCurso.findMany({
    where: { usuarioId, estado: "FINALIZADO" },
    select: { cursoId: true },
  });
  const idsCursosCompletados = new Set(
    cursosFinalizados.map((curso) => curso.cursoId)
  );

  const recompensasOtorgadas = [];

  for (const recompensa of recompensas) {
    // Si no permite múltiples otorgamientos y ya la obtuvo, omitir
    if (!recompensa.otorgamientoMultiple && recompensa.obtenidasPor.length > 0) {
      continue;
    }

    // La finalización actual debe completar una regla: todos sus cursos deben
    // estar finalizados y el curso que acaba de finalizar debe pertenecer a ella.
    const cumpleAlgunaRegla = recompensa.reglas.some((regla) => {
      const idsCursosDeLaRegla = regla.cursos.map((c) => c.id);
      return (
        idsCursosDeLaRegla.includes(cursoIdRecientementeCompletado) &&
        idsCursosDeLaRegla.every((id) => idsCursosCompletados.has(id))
      );
    });

    if (cumpleAlgunaRegla) {
      const nuevaOtorgada = await cliente.recompensaObtenida.create({
        data: {
          usuarioId,
          recompensaId: recompensa.id,
        },
        include: { recompensa: true },
      });

      recompensasOtorgadas.push(nuevaOtorgada);
    }
  }

  return recompensasOtorgadas;
}
