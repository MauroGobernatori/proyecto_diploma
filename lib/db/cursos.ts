import { BadRequestError, NotFoundError } from "../errores";
import { Prisma } from "@prisma/client";
import { prisma } from "./client";
import {
  CrearCursoInput,
  ActualizarCursoInput,
  CrearSeccionInput,
  CrearRecursoInput,
  ModificarSeccionInput,
  ModificarRecursoInput,
} from "../schemas/curso";

export async function obtenerCursos(soloVisibles = false) {
  return prisma.curso.findMany({
    where: soloVisibles
      ? { visibilidad: true, estado: { not: "ELIMINADO" } }
      : { estado: { not: "ELIMINADO" } },
    orderBy: { creadoEn: "desc" },
  });
}

export async function obtenerCursosDelUsuario(usuarioId: string) {
  return prisma.usuarioCurso.findMany({
    where: { usuarioId },
    include: {
      curso: {
        select: {
          id: true,
          nombre: true,
          descripcion: true,
          tema: true,
          estado: true,
          visibilidad: true,
        },
      },
    },
    orderBy: { fechaRegistro: "desc" },
  });
}

export async function obtenerCursoPorId(
  id: string,
  opciones: { usuarioId?: string; verOcultos?: boolean } = {}
) {
  const filtroVisibilidad = opciones.verOcultos ? {} : { visibilidad: true };
  const filtroEntregas = opciones.verOcultos
    ? {}
    : { where: { usuarioId: opciones.usuarioId ?? "" } };
  const detalleEntregas = {
    ...filtroEntregas,
    include: {
      usuario: { select: { nombre: true, apellido: true, usuario: true } },
      corrector: { select: { nombre: true, apellido: true } },
    },
    orderBy: { fechaEntrega: "asc" as const },
  };

  return prisma.curso.findUnique({
    where: { id },
    include: {
      secciones: {
        orderBy: { orden: "asc" },
        include: {
          recursos: {
            where: { estado: true, padreId: null, ...filtroVisibilidad },
            orderBy: { orden: "asc" },
            include: {
              actividad: { include: { entregas: detalleEntregas } },
              hijos: {
                where: { estado: true, ...filtroVisibilidad },
                orderBy: { orden: "asc" },
                include: {
                  actividad: { include: { entregas: detalleEntregas } },
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function existeCursoActivo(id: string) {
  const curso = await prisma.curso.findUnique({
    where: { id },
    select: { id: true, estado: true },
  });
  return Boolean(curso && curso.estado !== "ELIMINADO");
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

export async function obtenerAlumnosInscritos(cursoId: string) {
  return prisma.usuarioCurso.findMany({
    where: {
      cursoId,
      usuario: { roles: { some: { cursoId, grupoId: null, rol: { nombre: "Alumno", nivel: "CURSO" } } } },
    },
    include: { usuario: { select: { id: true, usuario: true, nombre: true, apellido: true, email: true } } },
    orderBy: { fechaRegistro: "asc" },
  });
}

export async function obtenerUsuariosDisponiblesParaInscribir(cursoId: string, soloGenerales: boolean) {
  return prisma.usuario.findMany({
    where: {
      activo: true,
      cursos: { none: { cursoId } },
      ...(soloGenerales ? {
        roles: { some: { cursoId: null, grupoId: null, rol: { nombre: "General", nivel: "PLATAFORMA" } } },
      } : {}),
      NOT: { roles: { some: { cursoId, grupoId: null, rol: { nombre: "Alumno", nivel: "CURSO" } } } },
    },
    select: { id: true, usuario: true, nombre: true, apellido: true, email: true },
    orderBy: [{ apellido: "asc" }, { nombre: "asc" }],
  });
}

export async function inscribirAlumno(cursoId: string, usuarioId: string, soloGenerales: boolean) {
  return prisma.$transaction(async (tx) => {
    const curso = await tx.curso.findUnique({ where: { id: cursoId }, select: { estado: true } });
    if (!curso || curso.estado === "ELIMINADO") throw new NotFoundError("No se encontró un curso activo");
    const usuario = await tx.usuario.findUnique({ where: { id: usuarioId }, select: { activo: true } });
    if (!usuario?.activo) throw new NotFoundError("No se encontró un usuario activo");
    if (soloGenerales) {
      const general = await tx.usuarioRol.findFirst({
        where: { usuarioId, cursoId: null, grupoId: null, rol: { nombre: "General", nivel: "PLATAFORMA" } },
        select: { id: true },
      });
      if (!general) throw new BadRequestError("El Gestor solo puede inscribir usuarios con rol General");
    }
    const rolAlumno = await tx.rol.findUnique({ where: { nombre_nivel: { nombre: "Alumno", nivel: "CURSO" } }, select: { id: true } });
    if (!rolAlumno) throw new BadRequestError("No está configurado el rol Alumno");
    const existente = await tx.usuarioRol.findFirst({ where: { usuarioId, rolId: rolAlumno.id, cursoId, grupoId: null } });
    if (!existente) await tx.usuarioRol.create({ data: { usuarioId, rolId: rolAlumno.id, cursoId } });
    return tx.usuarioCurso.upsert({
      where: { usuarioId_cursoId: { usuarioId, cursoId } },
      update: {},
      create: { usuarioId, cursoId },
    });
  });
}

export async function desinscribirAlumno(cursoId: string, usuarioId: string, soloGenerales: boolean) {
  return prisma.$transaction(async (tx) => {
    if (soloGenerales) {
      const general = await tx.usuarioRol.findFirst({
        where: { usuarioId, cursoId: null, grupoId: null, rol: { nombre: "General", nivel: "PLATAFORMA" } },
        select: { id: true },
      });
      if (!general) throw new BadRequestError("El Gestor solo puede desinscribir usuarios con rol General");
    }
    const rolAlumno = await tx.rol.findUnique({ where: { nombre_nivel: { nombre: "Alumno", nivel: "CURSO" } }, select: { id: true } });
    if (!rolAlumno) throw new BadRequestError("No está configurado el rol Alumno");
    const baja = await tx.usuarioRol.deleteMany({ where: { usuarioId, rolId: rolAlumno.id, cursoId, grupoId: null } });
    if (!baja.count) throw new NotFoundError("El alumno no está inscripto en este curso");
    await tx.usuarioCurso.deleteMany({ where: { usuarioId, cursoId } });
  });
}

export async function crearSeccion(data: CrearSeccionInput) {
  return prisma.seccion.create({
    data,
  });
}

export async function modificarSeccion(
  id: string,
  data: ModificarSeccionInput
) {
  return prisma.seccion.update({
    where: { id },
    data,
  });
}

export async function eliminarSeccion(id: string) {
  return prisma.seccion.delete({
    where: { id },
  });
}

export async function crearRecurso(data: CrearRecursoInput) {
  return prisma.recurso.create({
    data: {
      nombre: data.nombre,
      descripcion: data.descripcion,
      contenido: data.tipo === "PAGINA_CONTENIDO" ? data.contenido || null : null,
      tipo: data.tipo,
      url: data.url || null,
      orden: data.orden,
      visibilidad: data.visibilidad,
      seccionId: data.seccionId,
      padreId: data.padreId || null,
    },
  });
}

export async function modificarRecurso(
  id: string,
  data: ModificarRecursoInput
) {
  return prisma.$transaction(async (tx) => {
    const actual = await tx.recurso.findUnique({
      where: { id },
      select: { tipo: true, padreId: true },
    });
    if (!actual) throw new NotFoundError("No se encontró el recurso");
    if (actual.padreId && data.tipo && data.tipo !== "ACTIVIDAD") {
      throw new BadRequestError("Una actividad contenida no puede convertirse en otro tipo de recurso");
    }

    if (actual.tipo === "ACTIVIDAD" && data.tipo && data.tipo !== "ACTIVIDAD") {
      const bloqueada = await tx.$queryRaw<{ id: string }[]>(Prisma.sql`
        SELECT "id" FROM "Actividad" WHERE "recursoId" = ${id} FOR UPDATE
      `);
      if (bloqueada.length) {
        const entregas = await tx.actividadEntrega.count({
          where: { actividadId: bloqueada[0].id },
        });
        if (entregas) {
          throw new BadRequestError("No se puede quitar la configuración de una actividad que ya tiene entregas");
        }
        await tx.actividad.delete({ where: { id: bloqueada[0].id } });
      }
    }

    return tx.recurso.update({
      where: { id },
      data: {
        ...data,
        ...(data.descripcion !== undefined ? { descripcion: data.descripcion || null } : {}),
        ...(data.url !== undefined ? { url: data.url || null } : {}),
        ...(data.tipo !== undefined
          ? { contenido: data.tipo === "PAGINA_CONTENIDO" ? data.contenido ?? null : null }
          : data.contenido !== undefined
            ? { contenido: data.contenido || null }
            : {}),
      },
    });
  });
}

export async function eliminarRecurso(id: string) {
  return prisma.$transaction(async (tx) => {
    await tx.recurso.updateMany({
      where: { padreId: id },
      data: { estado: false },
    });
    return tx.recurso.update({
      where: { id },
      data: { estado: false },
    });
  });
}

export async function obtenerCursoIdDeSeccion(id: string) {
  return prisma.seccion.findUnique({
    where: { id },
    select: { cursoId: true },
  });
}

export async function obtenerCursoIdDeRecurso(id: string) {
  return prisma.recurso.findUnique({
    where: { id },
    select: { seccion: { select: { cursoId: true } } },
  });
}

export async function detallesRecursoParaGestion(id: string) {
  return prisma.recurso.findUnique({
    where: { id },
    select: {
      tipo: true,
      padreId: true,
      seccion: { select: { cursoId: true } },
      hijos: { select: { id: true }, take: 1 },
      actividad: { select: { entregas: { select: { id: true }, take: 1 } } },
    },
  });
}
