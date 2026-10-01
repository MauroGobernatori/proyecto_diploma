import { describe, it, expect } from "vitest";
import { cambiarContraseniaSchema } from "./auth";

describe("cambiarContraseniaSchema", () => {
  it("debe rechazar si la confirmación de contraseña no coincide", () => {
    const datos = {
      contraseniaActual: "123456",
      contraseniaNueva: "nuevaContrasenia1",
      confirmarContrasenia: "otraContraseniaDiferente",
    };

    const resultado = cambiarContraseniaSchema.safeParse(datos);
    expect(resultado.success).toBe(false);
  });
});