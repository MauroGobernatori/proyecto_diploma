import { z } from "zod";

export const loginSchema = z.object({
  usuarioOEmail: z
    .string()
    .trim()
    .min(1, "El usuario o email es requerido")
    .max(254, "El usuario o email es demasiado largo"),
  contrasenia: z
    .string()
    .min(1, "La contraseña es requerida")
    .max(128, "La contraseña es demasiado larga"),
});

export const cambiarContraseniaSchema = z
  .object({
    contraseniaActual: z.string().min(1, "La contraseña actual es requerida"),
    contraseniaNueva: z
      .string()
      .min(12, "La nueva contraseña debe tener al menos 12 caracteres")
      .max(128, "La nueva contraseña no puede superar los 128 caracteres"),
    confirmarContrasenia: z.string(),
  })
  .refine((data) => data.contraseniaNueva === data.confirmarContrasenia, {
    message: "Las contraseñas no coinciden",
    path: ["confirmarContrasenia"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type CambiarContraseniaInput = z.infer<typeof cambiarContraseniaSchema>;
