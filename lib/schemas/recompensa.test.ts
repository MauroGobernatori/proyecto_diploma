import { describe, it, expect } from "vitest";
import { crearRecompensaSchema } from "./recompensa";

describe("crearRecompensaSchema", () => {
  it("debe validar una recompensa cuando la fecha de inhabilitación es posterior y tiene al menos una regla", () => {
    const recompensaValida = {
      nombre: "Cupón Descuento",
      descripcion: "10% de descuento en gastronomía",
      fechaHabilitacion: "2026-10-01",
      fechaInhabilitacion: "2026-10-31",
      reglas: [
        {
          nombre: "Opción Curso Individual",
          cursoIds: ["clx1234567890"],
        },
      ],
    };

    const resultado = crearRecompensaSchema.safeParse(recompensaValida);
    expect(resultado.success).toBe(true);
  });

  it("debe rechazar la recompensa si la fecha de inhabilitación es anterior a la de habilitación", () => {
    const recompensaFechasInvalidas = {
      nombre: "Cupón Descuento",
      descripcion: "10% de descuento en gastronomía",
      fechaHabilitacion: "2026-10-31",
      fechaInhabilitacion: "2026-10-01", // Anterior
      reglas: [
        {
          cursoIds: ["clx1234567890"],
        },
      ],
    };

    const resultado = crearRecompensaSchema.safeParse(recompensaFechasInvalidas);
    expect(resultado.success).toBe(false);
  });

  it("debe rechazar la recompensa si no tiene ninguna regla asignada", () => {
    const recompensaSinReglas = {
      nombre: "Cupón Descuento",
      descripcion: "10% de descuento en gastronomía",
      fechaHabilitacion: "2026-10-01",
      fechaInhabilitacion: "2026-10-31",
      reglas: [], // Array vacío de reglas
    };

    const resultado = crearRecompensaSchema.safeParse(recompensaSinReglas);
    expect(resultado.success).toBe(false);
  });
});