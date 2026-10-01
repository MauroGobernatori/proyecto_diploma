import { z } from "zod";

export const estadoRecompensaEnum = z.enum(["ACTIVO", "INACTIVO", "ELIMINADO"]);

export const reglaRecompensaSchema = z.object({
  nombre: z.string().optional(),
  cursoIds: z
    .array(z.string())
    .min(1, "Cada regla debe incluir al menos un curso"),
});

export const baseRecompensaSchema = z.object({
  nombre: z.string().min(3, "El nombre de la recompensa es requerido"),
  descripcion: z.string().min(5, "La descripción es requerida"),
  fechaHabilitacion: z.coerce.date({
    message: "Fecha de habilitación inválida",
  }),
  fechaInhabilitacion: z.coerce.date({
    message: "Fecha de inhabilitación inválida",
  }),
  otorgamientoMultiple: z.boolean().default(false),
  estado: estadoRecompensaEnum.default("ACTIVO"),
  reglas: z
    .array(reglaRecompensaSchema)
    .min(1, "Debe definir al menos una regla u opción de otorgamiento"),
});

export const crearRecompensaSchema = baseRecompensaSchema.refine(
  (data) => data.fechaInhabilitacion > data.fechaHabilitacion,
  {
    message: "La fecha de inhabilitación debe ser posterior a la de habilitación",
    path: ["fechaInhabilitacion"],
  }
);

export const actualizarRecompensaSchema = baseRecompensaSchema
  .partial()
  .refine(
    (data) => {
      if (data.fechaHabilitacion && data.fechaInhabilitacion) {
        return data.fechaInhabilitacion > data.fechaHabilitacion;
      }
      return true;
    },
    {
      message: "La fecha de inhabilitación debe ser posterior a la de habilitación",
      path: ["fechaInhabilitacion"],
    }
  );

export type CrearRecompensaInput = z.infer<typeof crearRecompensaSchema>;
export type ActualizarRecompensaInput = z.infer<typeof actualizarRecompensaSchema>;