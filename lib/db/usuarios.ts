import { prisma } from "./client";
import {
  CrearUsuarioInput,
  ActualizarUsuarioInput,
  AsignarRolInput,
} from "../schemas/usuario";

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
    include: {
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
  });
}

export async function crearUsuario(data: CrearUsuarioInput) {
  return prisma.usuario.create({
    data: {
      usuario: data.usuario,
      contrasenia: data.contrasenia,
      nombre: data.nombre,
      apellido: data.apellido,
      email: data.email,
      edad: data.edad,
      empresa: data.empresa,
      institucion: data.institucion,
      dni: data.dni || null,
    },
  });
}

export async function actualizarUsuario(
  id: string,
  data: ActualizarUsuarioInput
) {
  return prisma.usuario.update({
    where: { id },
    data,
  });
}

export async function asignarRolAUsuario(data: AsignarRolInput) {
  return prisma.usuarioRol.create({
    data: {
      usuarioId: data.usuarioId,
      rolId: data.rolId,
      cursoId: data.cursoId || null,
      grupoId: data.grupoId || null,
    },
  });
}