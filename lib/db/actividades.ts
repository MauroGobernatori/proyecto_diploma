import { Prisma } from "@prisma/client";
import { calificarRespuestaActividad } from "@/lib/actividades/calificacion";
import { BadRequestError, ForbiddenError, NotFoundError } from "@/lib/errores";
import type { CrearActividadInput } from "@/lib/schemas/curso";
import { prisma } from "./client";

function cursoIdDeActividad(
  actividad: {
    recurso: {
      seccion: { cursoId: string };
    };
  }
) {
  return actividad.recurso.seccion.cursoId;
}

export async function crearActividadContenida(data: CrearActividadInput) {
  const contenedor = await prisma.recurso.findUnique({
    where: { id: data.contenedorId },
    select: {
      tipo: true,
      seccionId: true,
      estado: true,
      seccion: { select: { cursoId: true } },
    },
  });

  if (!contenedor || !contenedor.estado) throw new NotFoundError("No se encontró la lección o evaluación");
  if (contenedor.tipo !== "LECCION" && contenedor.tipo !== "EVALUACION") {
    throw new BadRequestError("Las actividades deben pertenecer a una lección o evaluación");
  }

  return prisma.$transaction(async (tx) => {
    const recurso = await tx.recurso.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        tipo: "ACTIVIDAD",
        orden: data.orden,
        visibilidad: data.visibilidad,
        seccionId: contenedor.seccionId,
        padreId: data.contenedorId,
      },
      select: { id: true },
    });

    return tx.actividad.create({
      data: {
        recursoId: recurso.id,
        tipo: data.tipo,
        opciones: data.opciones
          ? (data.opciones as Prisma.InputJsonValue)
          : Prisma.DbNull,
        respuestaCorrecta: data.respuestaCorrecta,
      },
      include: { recurso: true },
    });
  });
}

export async function obtenerCursoIdDeActividad(actividadId: string) {
  const actividad = await prisma.actividad.findUnique({
    where: { id: actividadId },
    select: { recurso: { select: { seccion: { select: { cursoId: true } } } } },
  });
  return actividad?.recurso.seccion.cursoId ?? null;
}

export async function obtenerCursoIdDeEntrega(entregaId: string) {
  const entrega = await prisma.actividadEntrega.findUnique({
    where: { id: entregaId },
    select: {
      actividad: { select: { recurso: { select: { seccion: { select: { cursoId: true } } } } } },
    },
  });
  return entrega?.actividad.recurso.seccion.cursoId ?? null;
}

export async function actualizarActividadContenida(
  recursoId: string,
  data: CrearActividadInput
) {
  return prisma.$transaction(async (tx) => {
    const bloqueada = await tx.$queryRaw<{ id: string }[]>(Prisma.sql`
      SELECT "id" FROM "Actividad" WHERE "recursoId" = ${recursoId} FOR UPDATE
    `);
    if (!bloqueada.length) throw new NotFoundError("No se encontró la actividad");

    const actividad = await tx.actividad.findUnique({
      where: { recursoId },
      include: { entregas: { select: { id: true } } },
    });
    if (!actividad) throw new NotFoundError("No se encontró la actividad");
    if (actividad.entregas.length) {
      throw new BadRequestError("No se puede cambiar la consigna o respuesta correcta después de recibir entregas");
    }

    await tx.recurso.update({
      where: { id: recursoId },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        orden: data.orden,
        visibilidad: data.visibilidad,
      },
    });

    return tx.actividad.update({
      where: { recursoId },
      data: {
        tipo: data.tipo,
        opciones: data.opciones
          ? (data.opciones as Prisma.InputJsonValue)
          : Prisma.DbNull,
        respuestaCorrecta: data.respuestaCorrecta ?? null,
      },
    });
  });
}

export async function entregarActividad(
  actividadId: string,
  usuarioId: string,
  respuesta: string
) {
  return prisma.$transaction(async (tx) => {
    const bloqueada = await tx.$queryRaw<{ id: string }[]>(Prisma.sql`
      SELECT "id" FROM "Actividad" WHERE "id" = ${actividadId} FOR UPDATE
    `);
    if (!bloqueada.length) throw new NotFoundError("No se encontró la actividad");

    const actividad = await tx.actividad.findUnique({
      where: { id: actividadId },
      include: {
        recurso: {
          include: {
            padre: true,
            seccion: { include: { curso: { select: { estado: true } } } },
          },
        },
      },
    });
    if (!actividad || actividad.recurso.tipo !== "ACTIVIDAD") {
      throw new NotFoundError("No se encontró la actividad");
    }
    const { recurso } = actividad;
    if (
      !recurso.estado || !recurso.visibilidad ||
      !recurso.padre || !recurso.padre.estado || !recurso.padre.visibilidad ||
      (recurso.padre.tipo !== "LECCION" && recurso.padre.tipo !== "EVALUACION") ||
      recurso.seccion.curso.estado === "ELIMINADO"
    ) {
      throw new NotFoundError("La actividad no está disponible");
    }
    if (respuesta.length > 10000) throw new BadRequestError("La respuesta supera el máximo de 10.000 caracteres");

    const cursoId = recurso.seccion.cursoId;
    const [inscripcion, rolAlumno] = await Promise.all([
      tx.usuarioCurso.findUnique({
        where: { usuarioId_cursoId: { usuarioId, cursoId } },
        select: { usuarioId: true },
      }),
      tx.usuarioRol.findFirst({
        where: {
          usuarioId,
          cursoId,
          grupoId: null,
          rol: { nombre: "Alumno", nivel: "CURSO" },
        },
        select: { id: true },
      }),
    ]);
    if (!inscripcion || !rolAlumno) throw new ForbiddenError("Solo un Alumno inscripto puede entregar esta actividad");

    const calificacion = calificarRespuestaActividad(
      actividad.tipo,
      actividad.opciones,
      actividad.respuestaCorrecta,
      respuesta
    );

    const entrega = await tx.actividadEntrega.create({
      data: {
        actividadId,
        usuarioId,
        respuesta,
        estado: calificacion.estado,
        nota: calificacion.nota,
        fechaCorreccion: calificacion.estado === "RESUELTA" ? new Date() : undefined,
      },
      select: { id: true, estado: true, nota: true },
    });

    return { entrega, cursoId };
  });
}

export async function corregirEntregaActividad(
  entregaId: string,
  correctorId: string,
  nota: number
) {
  return prisma.$transaction(async (tx) => {
    const entrega = await tx.actividadEntrega.findUnique({
      where: { id: entregaId },
      include: {
        actividad: {
          include: {
            recurso: {
              include: {
                padre: true,
                seccion: { select: { cursoId: true } },
              },
            },
          },
        },
      },
    });
    if (!entrega) throw new NotFoundError("No se encontró la entrega");
    if (entrega.actividad.tipo !== "RESPUESTA_ABIERTA") {
      throw new BadRequestError("Las actividades de autocorrección no requieren calificación manual");
    }
    if (entrega.estado !== "ENTREGADA") throw new BadRequestError("La entrega ya fue corregida");

    const actualizacion = await tx.actividadEntrega.updateMany({
      where: { id: entregaId, estado: "ENTREGADA" },
      data: {
        estado: "RESUELTA",
        nota,
        fechaCorreccion: new Date(),
        corregidaPorId: correctorId,
      },
    });
    if (actualizacion.count !== 1) throw new BadRequestError("La entrega ya fue corregida");

    return {
      cursoId: cursoIdDeActividad(entrega.actividad),
      usuarioId: entrega.usuarioId,
    };
  });
}
