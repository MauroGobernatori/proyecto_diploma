import { describe, it, expect } from "vitest";
import { crearUsuarioSchema } from "./usuario";

describe("crearUsuarioSchema", () => {
  it("debe aceptar un usuario válido", () => {
    const usuarioValido = {
      usuario: "mauro_g",
      contrasenia: "123456",
      nombre: "Mauro",
      apellido: "Gobernatori",
      email: "mauro@ejemplo.com",
      dni: "12345678",
    };

    const resultado = crearUsuarioSchema.safeParse(usuarioValido);
    expect(resultado.success).toBe(true);
  });

  it("debe rechazar un DNI con letras o de longitud incorrecta", () => {
    const usuarioDniInvalido = {
      usuario: "mauro_g",
      contrasenia: "123456",
      nombre: "Mauro",
      apellido: "Gobernatori",
      email: "mauro@ejemplo.com",
      dni: "12345ABC", // Inválido
    };

    const resultado = crearUsuarioSchema.safeParse(usuarioDniInvalido);
    expect(resultado.success).toBe(false);
  });

  it("debe rechazar un nombre con números", () => {
    const usuarioNombreInvalido = {
      usuario: "mauro_g",
      contrasenia: "123456",
      nombre: "Mauro123", // Inválido
      apellido: "Gobernatori",
      email: "mauro@ejemplo.com",
    };

    const resultado = crearUsuarioSchema.safeParse(usuarioNombreInvalido);
    expect(resultado.success).toBe(false);
  });
});