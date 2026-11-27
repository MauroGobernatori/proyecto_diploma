import { notFound } from "next/navigation";
import { tienePermiso, type ScopePermiso } from "@/lib/usuarios";
import { obtenerUsuarioActual } from "./current-user";

export async function exigirPermiso(clave: string, scope?: ScopePermiso) {
  const usuario = await obtenerUsuarioActual();
  if (!(await tienePermiso(usuario.id, clave, scope))) notFound();
  return usuario;
}

export async function puedeGestionarUsuarios(usuarioId: string) {
  const permisos = await permisosDeUsuarios(usuarioId);
  return permisos.crear || permisos.modificar || permisos.eliminar;
}

export async function permisosDeCursos(usuarioId: string) {
  const [crear, modificar, eliminar, gestionarInscripciones] = await Promise.all([
    tienePermiso(usuarioId, "curso:crear"),
    tienePermiso(usuarioId, "curso:modificar"),
    tienePermiso(usuarioId, "curso:eliminar"),
    tienePermiso(usuarioId, "curso:inscripcion:gestionar"),
  ]);
  return { crear, modificar, eliminar, gestionarInscripciones };
}

export async function permisosDeUsuarios(usuarioId: string) {
  const [crear, modificar, eliminar] = await Promise.all([
    tienePermiso(usuarioId, "usuario:crear"),
    tienePermiso(usuarioId, "usuario:modificar"),
    tienePermiso(usuarioId, "usuario:eliminar"),
  ]);
  return { crear, modificar, eliminar };
}

export async function permisosDeContenidoCurso(usuarioId: string, cursoId: string) {
  const [crearSeccion, modificarSeccion, eliminarSeccion, crearRecurso, modificarRecurso, eliminarRecurso, verOcultos, descargarReporte, entregarActividad, corregirActividad] = await Promise.all([
    tienePermiso(usuarioId, "seccion:crear", { cursoId }),
    tienePermiso(usuarioId, "seccion:modificar", { cursoId }),
    tienePermiso(usuarioId, "seccion:eliminar", { cursoId }),
    tienePermiso(usuarioId, "recurso:crear", { cursoId }),
    tienePermiso(usuarioId, "recurso:modificar", { cursoId }),
    tienePermiso(usuarioId, "recurso:eliminar", { cursoId }),
    tienePermiso(usuarioId, "recurso:oculto:ver", { cursoId }),
    tienePermiso(usuarioId, "reporte:curso:descargar", { cursoId }),
    tienePermiso(usuarioId, "actividad:entregar", { cursoId }),
    tienePermiso(usuarioId, "actividad:corregir", { cursoId }),
  ]);

  return {
    crearSeccion,
    modificarSeccion,
    eliminarSeccion,
    crearRecurso,
    modificarRecurso,
    eliminarRecurso,
    verOcultos,
    descargarReporte,
    entregarActividad,
    corregirActividad,
  };
}
