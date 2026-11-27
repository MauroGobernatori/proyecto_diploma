"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  actualizarCurso,
  crearCurso,
  eliminarCursoLogicamente,
} from "@/lib/db/cursos";
import { exigirPermiso } from "@/lib/auth/permissions";
import { crearCursoSchema } from "@/lib/schemas/curso";

function texto(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function camposCurso(formData: FormData) {
  return {
    nombre: texto(formData, "nombre"),
    descripcion: texto(formData, "descripcion"),
    logo: texto(formData, "logo"),
    fechaInicio: texto(formData, "fechaInicio") || undefined,
    fechaFin: texto(formData, "fechaFin") || undefined,
    tema: texto(formData, "tema"),
    formato: texto(formData, "formato"),
    matriculacionLibre: formData.get("matriculacionLibre") === "on",
    visibilidad: formData.get("visibilidad") === "on",
    estado: texto(formData, "estado") || "CREADO",
  };
}

export async function crearCursoAction(formData: FormData) {
  await exigirPermiso("curso:crear");
  const parsed = crearCursoSchema.safeParse(camposCurso(formData));
  if (!parsed.success) redirect("/cursos?resultado=datos-invalidos");
  await crearCurso(parsed.data);
  revalidatePath("/cursos");
  redirect("/cursos?resultado=creado");
}

export async function actualizarCursoAction(formData: FormData) {
  await exigirPermiso("curso:modificar");
  const id = texto(formData, "id");
  if (!id) redirect("/cursos?resultado=datos-invalidos");
  const parsed = crearCursoSchema.safeParse(camposCurso(formData));
  if (!parsed.success) redirect("/cursos?resultado=datos-invalidos");
  await actualizarCurso(id, parsed.data);
  revalidatePath("/cursos");
  revalidatePath(`/cursos/${id}`);
  redirect("/cursos?resultado=actualizado");
}

export async function eliminarCursoAction(formData: FormData) {
  await exigirPermiso("curso:eliminar");
  const id = texto(formData, "id");
  if (!id) redirect("/cursos?resultado=datos-invalidos");
  await eliminarCursoLogicamente(id);
  revalidatePath("/cursos");
  revalidatePath(`/cursos/${id}`);
  redirect("/cursos?resultado=eliminado");
}
