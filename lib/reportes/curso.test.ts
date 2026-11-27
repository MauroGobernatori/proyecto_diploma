import ExcelJS from "exceljs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "../db/client";
import { generarReporteCursoXLSX } from "./curso";

vi.mock("../db/client", () => ({
  prisma: {
    curso: { findUnique: vi.fn() },
    actividadEntrega: { findMany: vi.fn() },
  },
}));

describe("generarReporteCursoXLSX", () => {
  beforeEach(() => {
    vi.mocked(prisma.curso.findUnique).mockReset();
    vi.mocked(prisma.actividadEntrega.findMany).mockReset();
  });

  it("incluye el detalle de progreso y notas, y el gráfico en el resumen", async () => {
    vi.mocked(prisma.curso.findUnique).mockResolvedValue({
      id: "curso-1",
      nombre: "Curso de prueba",
      fechaInicio: new Date("2026-02-01T00:00:00Z"),
      fechaFin: new Date("2026-11-01T00:00:00Z"),
      estado: "PUBLICADO",
      inscripciones: [{
        estado: "EN_CURSO",
        fechaRegistro: new Date("2026-02-02T00:00:00Z"),
        fechaFinalizacion: null,
        usuario: {
          id: "alumno-1",
          usuario: "alumno.prueba",
          nombre: "Ana",
          apellido: "Pérez",
        },
      }],
      secciones: [{
        nombre: "Unidad 1",
        recursos: [{
          nombre: "Lección 1",
          hijos: [{
            nombre: "Actividad 1",
            actividad: { id: "actividad-1" },
          }],
        }],
      }],
    } as never);
    vi.mocked(prisma.actividadEntrega.findMany).mockResolvedValue([{
      actividadId: "actividad-1",
      usuarioId: "alumno-1",
      estado: "RESUELTA",
      nota: { toString: () => "8.5" },
      fechaEntrega: new Date("2026-03-01T00:00:00Z"),
      fechaCorreccion: null,
    }] as never);

    const resultado = await generarReporteCursoXLSX("curso-1");

    expect(resultado?.nombre).toBe("Curso de prueba");
    const libro = new ExcelJS.Workbook();
    await libro.xlsx.load(
      Buffer.from(resultado!.contenido) as unknown as Parameters<typeof libro.xlsx.load>[0]
    );

    const resumen = libro.getWorksheet("Resumen de notas");
    const detalle = libro.getWorksheet("Reporte del curso");
    expect(resumen).toBeDefined();
    expect(detalle).toBeDefined();
    expect(resumen!.getCell("A1").value).toBe("Distribución de notas — Curso de prueba");
    expect(resumen!.getCell("A9").value).toBe("8–10");
    expect(resumen!.getCell("B9").value).toBe(1);
    expect(resumen!.getImages()).toHaveLength(1);
    expect(detalle!.getCell("A7").value).toBe("Ana Pérez");
    expect(detalle!.getCell("F7").value).toBe(1);
    expect(detalle!.getCell("H7").value).toBe("100.00%");
    expect(detalle!.getCell("I7").value).toBe("Resuelta");
    expect(detalle!.getCell("J7").value).toBe("8.5");
  });

  it("devuelve null para un curso inexistente", async () => {
    vi.mocked(prisma.curso.findUnique).mockResolvedValue(null);

    await expect(generarReporteCursoXLSX("inexistente")).resolves.toBeNull();
    expect(prisma.actividadEntrega.findMany).not.toHaveBeenCalled();
  });
});
