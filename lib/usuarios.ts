import { prisma } from "./db/client";

interface ScopePermiso {
  cursoId?: string;
  grupoId?: string;
}

/**
 * Verifica si un usuario tiene un permiso específico según la clave del permiso
 * y el ámbito (Plataforma, Curso o Grupo).
 */
export async function tienePermiso(
  usuarioId: string,
  clavePermiso: string,
  scope?: ScopePermiso
): Promise<boolean> {
  const usuarioRoles = await prisma.usuarioRol.findMany({
    where: {
      usuarioId,
      OR: [
        { cursoId: scope?.cursoId ?? null },
        { grupoId: scope?.grupoId ?? null },
        { cursoId: null, grupoId: null }, // Roles globales de plataforma
      ],
    },
    include: {
      rol: {
        include: {
          permisos: {
            include: {
              permiso: true,
            },
          },
        },
      },
    },
  });

  if (!usuarioRoles.length) return false;

  // Recorrer los roles asignados y sus permisos
  for (const ur of usuarioRoles) {
    const poseePermiso = ur.rol.permisos.some(
      (rp) => rp.permiso.clave === clavePermiso
    );
    if (poseePermiso) return true;
  }

  return false;
}