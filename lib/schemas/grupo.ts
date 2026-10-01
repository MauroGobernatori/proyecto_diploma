import { z } from "zod";

export const crearGrupoSchema = z.object({
  nombre: z.string().min(2, "El nombre del grupo debe tener al menos 2 caracteres"),
  integrantes: z
    .array(
      z.object({
        usuarioId: z.string(),
        rolId: z.string(), // ID del rol "Jefe" o "Integrante"
      })
    )
    .optional(),
});

export const actualizarGrupoSchema = crearGrupoSchema.partial();

export type CrearGrupoInput = z.infer<typeof crearGrupoSchema>;
export type ActualizarGrupoInput = z.infer<typeof actualizarGrupoSchema>;