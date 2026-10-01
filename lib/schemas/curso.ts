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
  "ACTIVIDAD",
  "EVALUACION",
]);

export const crearCursoSchema = z.object({
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

export const actualizarCursoSchema = crearCursoSchema.partial();

export const crearSeccionSchema = z.object({
  nombre: z.string().min(1, "El nombre de la sección es requerido"),
  orden: z.number().int().min(1).default(1),
  cursoId: z.string().min(1, "El ID del curso es requerido"),
});

export const crearRecursoSchema = z.object({
  nombre: z.string().min(1, "El nombre del recurso es requerido"),
  descripcion: z.string().optional(),
  tipo: tipoRecursoEnum,
  url: z.string().url("URL inválida").optional().or(z.literal("")),
  orden: z.number().int().min(1).default(1),
  seccionId: z.string().min(1, "El ID de la sección es requerido"),
});

export type CrearCursoInput = z.infer<typeof crearCursoSchema>;
export type ActualizarCursoInput = z.infer<typeof actualizarCursoSchema>;
export type CrearSeccionInput = z.infer<typeof crearSeccionSchema>;
export type CrearRecursoInput = z.infer<typeof crearRecursoSchema>;