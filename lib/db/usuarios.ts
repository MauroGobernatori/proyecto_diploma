import { prisma } from "./client";
import {
  CrearUsuarioInput,
  ActualizarUsuarioInput,
  AsignarRolInput,
} from "../schemas/usuario";
import { hashPassword } from "../security/passwords";

export async function obtenerUsuarios() {
  return prisma.usuario.findMany({
    where: { activo: true },
    select: {
      id: true,
      usuario: true,
      nombre: true,
      apellido: true,
      email: true,
      empresa: true,
      activo: true,
      creadoEn: true,
      roles: {
        include: {
          rol: true,
        },
      },
    },
    orderBy: { creadoEn: "desc" },
  });
}

export async function obtenerUsuarioPorId(id: string) {
  return prisma.usuario.findUnique({
    where: { id },
    select: {
      id: true,
      usuario: true,
      nombre: true,
      apellido: true,
      email: true,
      edad: true,
      empresa: true,
      institucion: true,
      dni: true,
      activo: true,
      creadoEn: true,
      roles: {
        include: {
          rol: {
            include: {
              permisos: {
                include: { permiso: true },
              },
            },
          },
        },
      },
    },
  });
}

export async function obtenerUsuarioPorEmailOUsuario(identificador: string) {
  return prisma.usuario.findFirst({
    where: {
      OR: [{ email: identificador }, { usuario: identificador }],
    },
    select: {
      id: true,
      usuario: true,
      nombre: true,
      apellido: true,
      email: true,
      activo: true,
    },
  });
}

export async function crearUsuario(data: CrearUsuarioInput) {
  const contraseniaHash = await hashPassword(data.contrasenia);

  return prisma.$transaction(async (tx) => {
    const rolGeneral = await tx.rol.upsert({
      where: {
        nombre_nivel: { nombre: "General", nivel: "PLATAFORMA" },
      },
      update: {},
      create: {
        nombre: "General",
        nivel: "PLATAFORMA",
        esSistema: true,
      },
      select: { id: true },
    });

    const usuario = await tx.usuario.create({
      data: {
        usuario: data.usuario,
        contraseniaHash,
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email.toLowerCase(),
        edad: data.edad,
        empresa: data.empresa,
        institucion: data.institucion,
        dni: data.dni || null,
      },
      select: {
        id: true,
        usuario: true,
        nombre: true,
        apellido: true,
        email: true,
        activo: true,
        creadoEn: true,
      },
    });

    await tx.usuarioRol.create({
      data: {
        usuarioId: usuario.id,
        rolId: rolGeneral.id,
      },
    });

    return usuario;
  });
}

export async function actualizarUsuario(
  id: string,
  data: ActualizarUsuarioInput
) {
  return prisma.usuario.update({
    where: { id },
    data: {
      ...data,
      ...(data.email ? { email: data.email.toLowerCase() } : {}),
    },
    select: {
      id: true,
      usuario: true,
      nombre: true,
      apellido: true,
      email: true,
      activo: true,
      creadoEn: true,
    },
  });
}

export async function desactivarUsuario(id: string) {
  return prisma.usuario.update({
    where: { id },
    data: { activo: false },
    select: { id: true, activo: true },
  });
}

export async function esAdministradorDePlataforma(usuarioId: string) {
  const asignacion = await prisma.usuarioRol.findFirst({
    where: {
      usuarioId,
      cursoId: null,
      grupoId: null,
      rol: { nombre: "Administrador", nivel: "PLATAFORMA" },
    },
    select: { id: true },
  });
  return asignacion !== null;
}

export async function asignarRolAUsuario(data: AsignarRolInput) {
  return prisma.$transaction(async (tx) => {
    const asignacion = await tx.usuarioRol.create({
      data: {
        usuarioId: data.usuarioId,
        rolId: data.rolId,
        cursoId: data.cursoId || null,
        grupoId: data.grupoId || null,
      },
    });

    if (data.cursoId) {
      await tx.usuarioCurso.upsert({
        where: {
          usuarioId_cursoId: {
            usuarioId: data.usuarioId,
            cursoId: data.cursoId,
          },
        },
        // Si ya estaba inscripto, no reiniciar el progreso ni fechaRegistro.
        update: {},
        create: {
          usuarioId: data.usuarioId,
          cursoId: data.cursoId,
        },
      });
    }

    return asignacion;
  });
}
