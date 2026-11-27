import { z } from "zod";

export const estadoCursoEnum = z.enum([
  "CREADO",
  "EN_CURSO",
  "FINALIZADO",
  "ELIMINADO",
]);

export const tipoRecursoEnum = z.enum([
  "LINK",
  "VIDEO",
  "DOCUMENTO",
  "PAGINA_CONTENIDO",
  "LECCION",
  "ACTIVIDAD",
  "EVALUACION",
]);

export const tipoActividadEnum = z.enum([
  "OPCION_MULTIPLE",
  "VERDADERO_FALSO",
  "RESPUESTA_ABIERTA",
]);

const cursoBaseSchema = z.object({
  nombre: z.string().min(3, "El nombre del curso debe tener al menos 3 caracteres"),
  descripcion: z.string().min(5, "La descripción es requerida"),
  logo: z.string().url("URL de imagen inválida").optional().or(z.literal("")),
  fechaInicio: z.coerce.date().optional(),
  fechaFin: z.coerce.date().optional(),
  tema: z.string().optional(),
  formato: z.string().optional(),
  matriculacionLibre: z.boolean().default(false),
  visibilidad: z.boolean().default(true),
  estado: estadoCursoEnum.default("CREADO"),
});

export const crearCursoSchema = cursoBaseSchema.superRefine((curso, contexto) => {
  if (curso.fechaInicio && curso.fechaFin && curso.fechaFin < curso.fechaInicio) {
    contexto.addIssue({ code: "custom", path: ["fechaFin"], message: "La fecha de fin no puede ser anterior al inicio" });
  }
});

export const actualizarCursoSchema = cursoBaseSchema.partial().superRefine((curso, contexto) => {
  if (curso.fechaInicio && curso.fechaFin && curso.fechaFin < curso.fechaInicio) {
    contexto.addIssue({ code: "custom", path: ["fechaFin"], message: "La fecha de fin no puede ser anterior al inicio" });
  }
});

export const crearSeccionSchema = z.object({
  nombre: z.string().min(1, "El nombre de la sección es requerido"),
  orden: z.number().int().min(1).default(1),
  cursoId: z.string().min(1, "El ID del curso es requerido"),
});

export const modificarSeccionSchema = crearSeccionSchema
  .pick({ nombre: true, orden: true })
  .partial();

const recursoBaseSchema = z.object({
  nombre: z.string().min(1, "El nombre del recurso es requerido"),
  descripcion: z.string().optional(),
  contenido: z.string().optional(),
  tipo: tipoRecursoEnum,
  url: z.string().url("URL inválida").optional().or(z.literal("")),
  orden: z.number().int().min(1).default(1),
  visibilidad: z.boolean().default(true),
  seccionId: z.string().min(1, "El ID de la sección es requerido"),
  padreId: z.string().optional(),
});

export const crearRecursoSchema = recursoBaseSchema.superRefine((recurso, contexto) => {
  if (recurso.tipo === "PAGINA_CONTENIDO" && !recurso.contenido?.trim()) {
    contexto.addIssue({
      code: "custom",
      path: ["contenido"],
      message: "Ingresá el texto de la página de contenido",
    });
  }
});

export const modificarRecursoSchema = recursoBaseSchema
  .pick({
    nombre: true,
    descripcion: true,
    contenido: true,
    tipo: true,
    url: true,
    orden: true,
    visibilidad: true,
  })
  .partial()
  .superRefine((recurso, contexto) => {
    if (recurso.tipo === "PAGINA_CONTENIDO" && recurso.contenido !== undefined && !recurso.contenido.trim()) {
      contexto.addIssue({
        code: "custom",
        path: ["contenido"],
        message: "Ingresá el texto de la página de contenido",
      });
    }
  });

export const crearActividadSchema = z.object({
  nombre: z.string().min(1, "El nombre de la actividad es requerido"),
  descripcion: z.string().optional(),
  orden: z.number().int().min(1).default(1),
  visibilidad: z.boolean().default(true),
  contenedorId: z.string().min(1, "La lección o evaluación es requerida"),
  tipo: tipoActividadEnum,
  opciones: z.array(z.object({ id: z.string().min(1), texto: z.string().min(1) })).optional(),
  respuestaCorrecta: z.string().optional(),
}).superRefine((actividad, contexto) => {
  if (actividad.tipo === "OPCION_MULTIPLE") {
    if (!actividad.opciones || actividad.opciones.length < 2) {
      contexto.addIssue({ code: "custom", path: ["opciones"], message: "Ingresá al menos dos opciones" });
    }
    if (actividad.opciones && new Set(actividad.opciones.map((opcion) => opcion.texto.trim().toLowerCase())).size !== actividad.opciones.length) {
      contexto.addIssue({ code: "custom", path: ["opciones"], message: "Las opciones deben ser distintas" });
    }
    if (!actividad.respuestaCorrecta || !actividad.opciones?.some((opcion) => opcion.id === actividad.respuestaCorrecta)) {
      contexto.addIssue({ code: "custom", path: ["respuestaCorrecta"], message: "Elegí una de las opciones como correcta" });
    }
  }
  if (actividad.tipo === "VERDADERO_FALSO" && !["true", "false"].includes(actividad.respuestaCorrecta ?? "")) {
    contexto.addIssue({ code: "custom", path: ["respuestaCorrecta"], message: "Indicá si la respuesta correcta es verdadero o falso" });
  }
});

export const corregirActividadSchema = z.object({
  entregaId: z.string().min(1),
  nota: z.coerce.number().min(0).max(10).multipleOf(0.01),
});

export type CrearCursoInput = z.infer<typeof crearCursoSchema>;
export type ActualizarCursoInput = z.infer<typeof actualizarCursoSchema>;
export type CrearSeccionInput = z.infer<typeof crearSeccionSchema>;
export type ModificarSeccionInput = z.infer<typeof modificarSeccionSchema>;
export type CrearRecursoInput = z.infer<typeof crearRecursoSchema>;
export type ModificarRecursoInput = z.infer<typeof modificarRecursoSchema>;
export type CrearActividadInput = z.infer<typeof crearActividadSchema>;
