import { describe, expect, it } from "vitest";
import { calificarRespuestaActividad } from "./calificacion";

describe("calificarRespuestaActividad", () => {
  it("autocalifica opción múltiple con 10 o 0 y marca resuelta", () => {
    const opciones = [{ id: "a" }, { id: "b" }];

    expect(calificarRespuestaActividad("OPCION_MULTIPLE", opciones, "b", "b"))
      .toEqual({ estado: "RESUELTA", nota: 10 });
    expect(calificarRespuestaActividad("OPCION_MULTIPLE", opciones, "b", "a"))
      .toEqual({ estado: "RESUELTA", nota: 0 });
  });

  it("rechaza una opción que no pertenece a la actividad", () => {
    expect(() => calificarRespuestaActividad("OPCION_MULTIPLE", [{ id: "a" }], "a", "b"))
      .toThrow("La opción elegida no pertenece a esta actividad");
  });

  it("autocalifica verdadero/falso en la escala acordada", () => {
    expect(calificarRespuestaActividad("VERDADERO_FALSO", null, "false", "false"))
      .toEqual({ estado: "RESUELTA", nota: 10 });
    expect(calificarRespuestaActividad("VERDADERO_FALSO", null, "false", "true"))
      .toEqual({ estado: "RESUELTA", nota: 0 });
    expect(() => calificarRespuestaActividad("VERDADERO_FALSO", null, "true", "sí"))
      .toThrow("La respuesta debe ser verdadero o falso");
  });

  it("deja las respuestas abiertas entregadas y pendientes de nota", () => {
    expect(calificarRespuestaActividad("RESPUESTA_ABIERTA", null, null, "Respuesta del alumno"))
      .toEqual({ estado: "ENTREGADA", nota: null });
  });
});
