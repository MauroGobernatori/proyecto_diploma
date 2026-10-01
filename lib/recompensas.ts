import { prisma } from "./db/client";

/**
 * Evalúa y otorga recompensas automáticas a un alumno.
 */
export async function evaluarYOtorgarRecompensas(
  usuarioId: string,
  cursoIdRecientementeCompletado: string
) {
  const ahora = new Date();

  // 1. Buscar recompensas activas que tengan alguna regla vinculada al curso recién completado
  const recompensas = await prisma.recompensa.findMany({
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

  // Obtener todos los cursos que el alumno tiene registrados como completados
  const cursosDelUsuario = await prisma.usuarioRol.findMany({
    where: { usuarioId, cursoId: { not: null } },
    select: { cursoId: true },
  });
  const idsCursosCompletados = new Set(
    cursosDelUsuario.map((c) => c.cursoId as string)
  );

  const recompensasOtorgadas = [];

  for (const recompensa of recompensas) {
    // Si no permite múltiples otorgamientos y ya la obtuvo, omitir
    if (!recompensa.otorgamientoMultiple && recompensa.obtenidasPor.length > 0) {
      continue;
    }

    // Verificar si cumple AL MENOS UNA de las reglas de la recompensa
    const cumpleAlgunaRegla = recompensa.reglas.some((regla) => {
      const idsCursosDeLaRegla = regla.cursos.map((c) => c.id);
      // Todos los cursos de ESTA regla deben estar en el Set de cursos completados
      return idsCursosDeLaRegla.every((id) => idsCursosCompletados.has(id));
    });

    if (cumpleAlgunaRegla) {
      const nuevaOtorgada = await prisma.recompensaObtenida.create({
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