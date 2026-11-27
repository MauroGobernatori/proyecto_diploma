"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  actualizarActividadContenida,
  corregirEntregaActividad,
  crearActividadContenida,
  entregarActividad,
  obtenerCursoIdDeActividad,
  obtenerCursoIdDeEntrega,
} from "@/lib/db/actividades";
import {
  crearRecurso,
  crearSeccion,
  detallesRecursoParaGestion,
  eliminarRecurso,
  eliminarSeccion,
  existeCursoActivo,
  inscribirAlumno,
  desinscribirAlumno,
  modificarRecurso,
  modificarSeccion,
  obtenerCursoIdDeRecurso,
  obtenerCursoIdDeSeccion,
} from "@/lib/db/cursos";
import { esAdministradorDePlataforma } from "@/lib/db/usuarios";
import { exigirPermiso } from "@/lib/auth/permissions";
import {
  corregirActividadSchema,
  crearActividadSchema,
  crearRecursoSchema,
  crearSeccionSchema,
  modificarRecursoSchema,
  modificarSeccionSchema,
} from "@/lib/schemas/curso";

function volverAlCurso(cursoId: string, resultado: string): never {
  redirect(`/cursos/${cursoId}?resultado=${resultado}`);
}

export async function inscribirAlumnoAction(formData: FormData) {
  const cursoId = valorTexto(formData, "cursoId");
  const usuarioId = valorTexto(formData, "usuarioId");
  const gestor = await exigirPermiso("curso:inscripcion:gestionar");
  if (!cursoId || !usuarioId) redirect("/cursos?resultado=datos-invalidos");
  await inscribirAlumno(cursoId, usuarioId, !(await esAdministradorDePlataforma(gestor.id)));
  revalidatePath(`/cursos/${cursoId}`);
  revalidatePath("/cursos");
  volverAlCurso(cursoId, "alumno-inscripto");
}

export async function desinscribirAlumnoAction(formData: FormData) {
  const cursoId = valorTexto(formData, "cursoId");
  const usuarioId = valorTexto(formData, "usuarioId");
  const usuario = await exigirPermiso("curso:inscripcion:gestionar");
  if (!cursoId || !usuarioId) redirect("/cursos?resultado=datos-invalidos");
  await desinscribirAlumno(cursoId, usuarioId, !(await esAdministradorDePlataforma(usuario.id)));
  revalidatePath(`/cursos/${cursoId}`);
  revalidatePath("/cursos");
  volverAlCurso(cursoId, "alumno-desinscripto");
}

function valorTexto(formData: FormData, campo: string) {
  const valor = formData.get(campo);
  return typeof valor === "string" ? valor.trim() : "";
}

function valorOrden(formData: FormData) {
  const valor = valorTexto(formData, "orden");
  return valor ? Number(valor) : 1;
}

function opcionesYRespuesta(formData: FormData) {
  const tipo = valorTexto(formData, "tipoActividad");
  const respuestaTexto = valorTexto(formData, "respuestaCorrecta");
  if (tipo !== "OPCION_MULTIPLE") {
    return {
      tipo,
      respuestaCorrecta: tipo === "VERDADERO_FALSO" ? respuestaTexto : undefined,
      opciones: undefined,
    };
  }

  const lineas = valorTexto(formData, "opciones")
    .split(/\r?\n/)
    .map((linea) => linea.trim())
    .filter(Boolean);
  const opciones = lineas.map((texto, indice) => ({ id: `opcion-${indice + 1}`, texto }));
  const respuestaCorrecta = opciones.find((opcion) => opcion.texto === respuestaTexto)?.id;
  return { tipo, opciones, respuestaCorrecta };
}

function datosActividad(formData: FormData) {
  return crearActividadSchema.safeParse({
    nombre: valorTexto(formData, "nombre"),
    descripcion: valorTexto(formData, "descripcion") || undefined,
    orden: valorOrden(formData),
    visibilidad: formData.get("visibilidad") === "on",
    contenedorId: valorTexto(formData, "contenedorId"),
    ...opcionesYRespuesta(formData),
  });
}

export async function crearSeccionAction(formData: FormData) {
  const cursoId = valorTexto(formData, "cursoId");
  if (!cursoId) redirect("/cursos?resultado=datos-invalidos");
  await exigirPermiso("seccion:crear", { cursoId });
  if (!(await existeCursoActivo(cursoId))) volverAlCurso(cursoId, "curso-no-disponible");

  const datos = crearSeccionSchema.safeParse({
    nombre: valorTexto(formData, "nombre"),
    orden: valorOrden(formData),
    cursoId,
  });
  if (!datos.success) volverAlCurso(cursoId, "datos-invalidos");

  await crearSeccion(datos.data);
  revalidatePath(`/cursos/${cursoId}`);
  volverAlCurso(cursoId, "seccion-creada");
}

export async function modificarSeccionAction(formData: FormData) {
  const id = valorTexto(formData, "id");
  const referencia = id ? await obtenerCursoIdDeSeccion(id) : null;
  if (!referencia) redirect("/cursos?resultado=no-encontrado");
  const cursoId = referencia.cursoId;
  await exigirPermiso("seccion:modificar", { cursoId });

  const datos = modificarSeccionSchema.safeParse({
    nombre: valorTexto(formData, "nombre"),
    orden: valorOrden(formData),
  });
  if (!datos.success) volverAlCurso(cursoId, "datos-invalidos");

  await modificarSeccion(id, datos.data);
  revalidatePath(`/cursos/${cursoId}`);
  volverAlCurso(cursoId, "seccion-actualizada");
}

export async function eliminarSeccionAction(formData: FormData) {
  const id = valorTexto(formData, "id");
  const referencia = id ? await obtenerCursoIdDeSeccion(id) : null;
  if (!referencia) redirect("/cursos?resultado=no-encontrado");
  const cursoId = referencia.cursoId;
  await exigirPermiso("seccion:eliminar", { cursoId });

  await eliminarSeccion(id);
  revalidatePath(`/cursos/${cursoId}`);
  volverAlCurso(cursoId, "seccion-eliminada");
}

export async function crearRecursoAction(formData: FormData) {
  const datos = crearRecursoSchema.safeParse({
    nombre: valorTexto(formData, "nombre"),
    descripcion: valorTexto(formData, "descripcion"),
    contenido: valorTexto(formData, "contenido"),
    tipo: valorTexto(formData, "tipo"),
    url: valorTexto(formData, "url"),
    orden: valorOrden(formData),
    visibilidad: formData.get("visibilidad") === "on",
    seccionId: valorTexto(formData, "seccionId"),
  });
  const cursoId = valorTexto(formData, "cursoId");
  if (!cursoId || !datos.success || datos.data.tipo === "ACTIVIDAD") {
    if (cursoId) volverAlCurso(cursoId, "datos-invalidos");
    redirect("/cursos?resultado=datos-invalidos");
  }
  await exigirPermiso("recurso:crear", { cursoId });
  const seccion = await obtenerCursoIdDeSeccion(datos.data.seccionId);
  if (!seccion || seccion.cursoId !== cursoId) volverAlCurso(cursoId, "datos-invalidos");

  await crearRecurso(datos.data);
  revalidatePath(`/cursos/${cursoId}`);
  volverAlCurso(cursoId, "recurso-creado");
}

export async function modificarRecursoAction(formData: FormData) {
  const id = valorTexto(formData, "id");
  const referencia = id ? await obtenerCursoIdDeRecurso(id) : null;
  const detalles = id ? await detallesRecursoParaGestion(id) : null;
  if (!referencia || !detalles) redirect("/cursos?resultado=no-encontrado");
  const cursoId = referencia.seccion.cursoId;
  await exigirPermiso("recurso:modificar", { cursoId });

  const datos = modificarRecursoSchema.safeParse({
    nombre: valorTexto(formData, "nombre"),
    descripcion: valorTexto(formData, "descripcion"),
    contenido: valorTexto(formData, "contenido"),
    tipo: valorTexto(formData, "tipo"),
    url: valorTexto(formData, "url"),
    orden: valorOrden(formData),
    visibilidad: formData.get("visibilidad") === "on",
  });
  if (!datos.success) volverAlCurso(cursoId, "datos-invalidos");

  const nuevoTipo = datos.data.tipo;
  if (nuevoTipo === "ACTIVIDAD" && detalles.tipo !== "ACTIVIDAD") {
    volverAlCurso(cursoId, "crear-actividad-desde-contenedor");
  }
  if (detalles.padreId && nuevoTipo !== "ACTIVIDAD") {
    volverAlCurso(cursoId, "actividad-contenida");
  }
  if (detalles.hijos.length && nuevoTipo !== "LECCION" && nuevoTipo !== "EVALUACION") {
    volverAlCurso(cursoId, "contenedor-con-actividades");
  }
  if (detalles.tipo === "ACTIVIDAD" && nuevoTipo !== "ACTIVIDAD") {
    if (detalles.actividad?.entregas.length) volverAlCurso(cursoId, "actividad-con-entregas");
  }

  await modificarRecurso(id, datos.data);
  revalidatePath(`/cursos/${cursoId}`);
  volverAlCurso(cursoId, "recurso-actualizado");
}

export async function eliminarRecursoAction(formData: FormData) {
  const id = valorTexto(formData, "id");
  const referencia = id ? await obtenerCursoIdDeRecurso(id) : null;
  if (!referencia) redirect("/cursos?resultado=no-encontrado");
  const cursoId = referencia.seccion.cursoId;
  await exigirPermiso("recurso:eliminar", { cursoId });

  await eliminarRecurso(id);
  revalidatePath(`/cursos/${cursoId}`);
  volverAlCurso(cursoId, "recurso-eliminado");
}

export async function crearActividadAction(formData: FormData) {
  const datos = datosActividad(formData);
  const contenedorId = valorTexto(formData, "contenedorId");
  const referencia = contenedorId ? await obtenerCursoIdDeRecurso(contenedorId) : null;
  if (!referencia) redirect("/cursos?resultado=no-encontrado");
  const cursoId = referencia.seccion.cursoId;
  await exigirPermiso("recurso:crear", { cursoId });
  if (!datos.success) volverAlCurso(cursoId, "actividad-invalida");

  await crearActividadContenida(datos.data);
  revalidatePath(`/cursos/${cursoId}`);
  volverAlCurso(cursoId, "actividad-creada");
}

export async function modificarActividadAction(formData: FormData) {
  const id = valorTexto(formData, "id");
  const referencia = id ? await obtenerCursoIdDeRecurso(id) : null;
  if (!referencia) redirect("/cursos?resultado=no-encontrado");
  const cursoId = referencia.seccion.cursoId;
  await exigirPermiso("recurso:modificar", { cursoId });
  const datos = datosActividad(formData);
  if (!datos.success) volverAlCurso(cursoId, "actividad-invalida");

  await actualizarActividadContenida(id, datos.data);
  revalidatePath(`/cursos/${cursoId}`);
  volverAlCurso(cursoId, "actividad-actualizada");
}

export async function entregarActividadAction(formData: FormData) {
  const actividadId = valorTexto(formData, "actividadId");
  const respuesta = valorTexto(formData, "respuesta");
  const cursoId = actividadId ? await obtenerCursoIdDeActividad(actividadId) : null;
  if (!cursoId) redirect("/cursos?resultado=no-encontrado");
  const usuario = await exigirPermiso("actividad:entregar", { cursoId });
  if (!respuesta) volverAlCurso(cursoId, "respuesta-requerida");

  try {
    await entregarActividad(actividadId, usuario.id, respuesta);
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      volverAlCurso(cursoId, "actividad-ya-entregada");
    }
    throw error;
  }

  revalidatePath(`/cursos/${cursoId}`);
  volverAlCurso(cursoId, "actividad-entregada");
}

export async function corregirActividadAction(formData: FormData) {
  const parsed = corregirActividadSchema.safeParse({
    entregaId: valorTexto(formData, "entregaId"),
    nota: formData.get("nota"),
  });
  const cursoId = parsed.success
    ? await obtenerCursoIdDeEntrega(parsed.data.entregaId)
    : null;
  if (!parsed.success || !cursoId) redirect("/cursos?resultado=datos-invalidos");
  const corrector = await exigirPermiso("actividad:corregir", { cursoId });

  await corregirEntregaActividad(parsed.data.entregaId, corrector.id, parsed.data.nota);
  revalidatePath(`/cursos/${cursoId}`);
  volverAlCurso(cursoId, "actividad-corregida");
}
