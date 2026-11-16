"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { loginSchema } from "@/lib/schemas/auth";

export type LoginState = { error: string } | undefined;

export async function iniciarSesion(
  _estadoAnterior: LoginState,
  formData: FormData
): Promise<LoginState> {
  const datos = loginSchema.safeParse({
    usuarioOEmail: formData.get("usuarioOEmail"),
    contrasenia: formData.get("contrasenia"),
  });

  if (!datos.success) {
    return { error: "Ingresá tu usuario o email y tu contraseña." };
  }

  try {
    await signIn("credentials", {
      ...datos.data,
      redirectTo: "/panel",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "El usuario, email o contraseña no son válidos." };
    }
    throw error;
  }

  return undefined;
}
