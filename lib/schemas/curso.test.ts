import { describe, expect, it } from "vitest";
import {
  crearCursoSchema,
  corregirActividadSchema,
  crearActividadSchema,
  crearRecursoSchema,
} from "./curso";

describe("crearCursoSchema", () => {
  const curso = { nombre: "Curso Demo", descripcion: "Curso de prueba" };
  it("acepta las fechas en orden", () => {
    expect(crearCursoSchema.safeParse({ ...curso, fechaInicio: "2026-01-01", fechaFin: "2026-02-01" }).success).toBe(true);
  });
  it("rechaza una fecha de fin anterior a la de inicio", () => {
    expect(crearCursoSchema.safeParse({ ...curso, fechaInicio: "2026-02-01", fechaFin: "2026-01-01" }).success).toBe(false);
  });
});

describe("crearRecursoSchema", () => {
  const recursoBase = {
    nombre: "Aviso del curso",
    tipo: "PAGINA_CONTENIDO",
    seccionId: "seccion-1",
  };

  it("acepta una página de contenido con texto", () => {
    expect(crearRecursoSchema.safeParse({
      ...recursoBase,
      contenido: "Texto de ejemplo",
    }).success).toBe(true);
  });

  it("rechaza una página de contenido vacía", () => {
    expect(crearRecursoSchema.safeParse({
      ...recursoBase,
      contenido: "   ",
    }).success).toBe(false);
  });
});

describe("crearActividadSchema", () => {
  const actividadBase = {
    nombre: "Pregunta",
    contenedorId: "contenedor-1",
    tipo: "OPCION_MULTIPLE",
    opciones: [
      { id: "a", texto: "Primera" },
      { id: "b", texto: "Segunda" },
    ],
    respuestaCorrecta: "a",
  };

  it("acepta una opción múltiple con opciones distintas y una correcta", () => {
    expect(crearActividadSchema.safeParse(actividadBase).success).toBe(true);
  });

  it("rechaza opciones duplicadas sin distinguir mayúsculas", () => {
    expect(crearActividadSchema.safeParse({
      ...actividadBase,
      opciones: [
        { id: "a", texto: "Sí" },
        { id: "b", texto: "sí" },
      ],
    }).success).toBe(false);
  });
});

describe("corregirActividadSchema", () => {
  it("acepta notas entre 0 y 10 con hasta dos decimales", () => {
    expect(corregirActividadSchema.safeParse({ entregaId: "entrega-1", nota: 0 }).success).toBe(true);
    expect(corregirActividadSchema.safeParse({ entregaId: "entrega-1", nota: 10 }).success).toBe(true);
    expect(corregirActividadSchema.safeParse({ entregaId: "entrega-1", nota: 8.55 }).success).toBe(true);
  });

  it("rechaza notas fuera de rango o con más de dos decimales", () => {
    expect(corregirActividadSchema.safeParse({ entregaId: "entrega-1", nota: -0.01 }).success).toBe(false);
    expect(corregirActividadSchema.safeParse({ entregaId: "entrega-1", nota: 10.01 }).success).toBe(false);
    expect(corregirActividadSchema.safeParse({ entregaId: "entrega-1", nota: 8.555 }).success).toBe(false);
  });
});
