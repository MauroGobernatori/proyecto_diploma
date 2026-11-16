import { notFound } from "next/navigation";
import { tienePermiso } from "@/lib/usuarios";
import { obtenerUsuarioActual } from "./current-user";

export async function exigirPermiso(clave: string) {
  const usuario = await obtenerUsuarioActual();
  if (!(await tienePermiso(usuario.id, clave))) notFound();
  return usuario;
}

export async function puedeGestionarUsuarios(usuarioId: string) {
  const permisos = await permisosDeUsuarios(usuarioId);
  return permisos.crear || permisos.modificar || permisos.eliminar;
}

export async function permisosDeUsuarios(usuarioId: string) {
  const [crear, modificar, eliminar] = await Promise.all([
    tienePermiso(usuarioId, "usuario:crear"),
    tienePermiso(usuarioId, "usuario:modificar"),
    tienePermiso(usuarioId, "usuario:eliminar"),
  ]);
  return { crear, modificar, eliminar };
}
