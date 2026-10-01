import { z } from "zod";

export const loginSchema = z.object({
  usuarioOEmail: z
    .string()
    .min(1, "El usuario o email es requerido"),
  contrasenia: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const cambiarContraseniaSchema = z
  .object({
    contraseniaActual: z.string().min(1, "La contraseña actual es requerida"),
    contraseniaNueva: z
      .string()
      .min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
    confirmarContrasenia: z.string(),
  })
  .refine((data) => data.contraseniaNueva === data.confirmarContrasenia, {
    message: "Las contraseñas no coinciden",
    path: ["confirmarContrasenia"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type CambiarContraseniaInput = z.infer<typeof cambiarContraseniaSchema>;