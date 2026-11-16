"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  actualizarUsuario,
  crearUsuario,
  desactivarUsuario,
  esAdministradorDePlataforma,
} from "@/lib/db/usuarios";
import { actualizarUsuarioSchema, crearUsuarioSchema } from "@/lib/schemas/usuario";
import { exigirPermiso } from "@/lib/auth/permissions";

function esDuplicado(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export async function crearUsuarioAction(formData: FormData) {
  await exigirPermiso("usuario:crear");
  const datos = crearUsuarioSchema.safeParse({
    usuario: formData.get("usuario"),
    contrasenia: formData.get("contrasenia"),
    nombre: formData.get("nombre"),
    apellido: formData.get("apellido"),
    email: formData.get("email"),
    edad: formData.get("edad") ? Number(formData.get("edad")) : undefined,
    empresa: formData.get("empresa") || undefined,
    institucion: formData.get("institucion") || undefined,
    dni: formData.get("dni") || undefined,
  });

  if (!datos.success) redirect("/usuarios?resultado=datos-invalidos");

  try {
    await crearUsuario(datos.data);
  } catch (error) {
    if (esDuplicado(error)) redirect("/usuarios?resultado=duplicado");
    throw error;
  }

  revalidatePath("/usuarios");
  redirect("/usuarios?resultado=creado");
}

export async function actualizarUsuarioAction(formData: FormData) {
  await exigirPermiso("usuario:modificar");
  const id = formData.get("id");
  if (typeof id !== "string" || !id) redirect("/usuarios?resultado=datos-invalidos");

  const datos = actualizarUsuarioSchema.safeParse({
    nombre: formData.get("nombre"),
    apellido: formData.get("apellido"),
    email: formData.get("email"),
    empresa: formData.get("empresa") || undefined,
  });
  if (!datos.success) redirect("/usuarios?resultado=datos-invalidos");

  try {
    await actualizarUsuario(id, datos.data);
  } catch (error) {
    if (esDuplicado(error)) redirect("/usuarios?resultado=duplicado");
    throw error;
  }

  revalidatePath("/usuarios");
  redirect("/usuarios?resultado=actualizado");
}

export async function desactivarUsuarioAction(formData: FormData) {
  const actual = await exigirPermiso("usuario:eliminar");
  const id = formData.get("id");
  if (typeof id !== "string" || !id) redirect("/usuarios?resultado=datos-invalidos");
  if (actual.id === id) redirect("/usuarios?resultado=no-puede-desactivarse");
  if (await esAdministradorDePlataforma(id)) {
    redirect("/usuarios?resultado=administrador-protegido");
  }

  await desactivarUsuario(id);
  revalidatePath("/usuarios");
  redirect("/usuarios?resultado=desactivado");
}
