import { z } from "zod";

// Expresiones regulares para validaciones
const soloLetrasRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
const soloNumerosRegex = /^\d+$/;

export const crearUsuarioSchema = z.object({
  usuario: z
    .string()
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
    .max(30, "El nombre de usuario no puede superar los 30 caracteres")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "El usuario solo puede contener letras, números y guiones bajos"
    ),
  contrasenia: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
  nombre: z
    .string()
    .min(1, "El nombre es requerido")
    .regex(soloLetrasRegex, "El nombre solo puede contener letras y espacios"),
  apellido: z
    .string()
    .min(1, "El apellido es requerido")
    .regex(soloLetrasRegex, "El apellido solo puede contener letras y espacios"),
  email: z
    .string()
    .min(1, "El email es requerido")
    .email("Debe ingresar un email válido (ejemplo: usuario@dominio.com)"),
  edad: z
    .number()
    .int("La edad debe ser un número entero")
    .positive("La edad debe ser mayor a 0")
    .optional(),
  empresa: z.string().optional(),
  institucion: z.string().optional(),
  dni: z
    .string()
    .regex(soloNumerosRegex, "El DNI solo debe contener números")
    .min(7, "El DNI debe tener al menos 7 dígitos")
    .max(8, "El DNI no puede superar los 8 dígitos")
    .optional()
    .or(z.literal("")), // Permite que el campo quede vacío si es opcional en el formulario
});

export const actualizarUsuarioSchema = crearUsuarioSchema
  .omit({ contrasenia: true, usuario: true })
  .partial();

export const asignarRolSchema = z.object({
  usuarioId: z.string().min(1, "El ID de usuario es requerido"),
  rolId: z.string().min(1, "El ID de rol es requerido"),
  cursoId: z.string().optional(),
  grupoId: z.string().optional(),
});

export type CrearUsuarioInput = z.infer<typeof crearUsuarioSchema>;
export type ActualizarUsuarioInput = z.infer<typeof actualizarUsuarioSchema>;
export type AsignarRolInput = z.infer<typeof asignarRolSchema>;