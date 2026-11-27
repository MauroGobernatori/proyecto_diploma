import { describe, expect, it } from "vitest";
import { distribuirNotas, generarGraficoNotasPNG } from "./grafico-notas";

describe("distribuirNotas", () => {
  it("cuenta notas en los cinco rangos y contempla los extremos 0 y 10", () => {
    expect(distribuirNotas([
      0, 1.99, 2, 3.99, 4, 5.99, 6, 7.99, 8, 10,
    ])).toEqual([
      { etiqueta: "0–1,99", cantidad: 2 },
      { etiqueta: "2–3,99", cantidad: 2 },
      { etiqueta: "4–5,99", cantidad: 2 },
      { etiqueta: "6–7,99", cantidad: 2 },
      { etiqueta: "8–10", cantidad: 2 },
    ]);
  });

  it("ignora valores fuera de la escala y valores no numéricos", () => {
    expect(distribuirNotas([-1, 10.01, Number.NaN, 5])).toEqual([
      { etiqueta: "0–1,99", cantidad: 0 },
      { etiqueta: "2–3,99", cantidad: 0 },
      { etiqueta: "4–5,99", cantidad: 1 },
      { etiqueta: "6–7,99", cantidad: 0 },
      { etiqueta: "8–10", cantidad: 0 },
    ]);
  });
});

describe("generarGraficoNotasPNG", () => {
  it("genera una imagen PNG aun cuando todavía no hay notas", async () => {
    const png = await generarGraficoNotasPNG([]);

    expect(png.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    expect(png.length).toBeGreaterThan(100);
  });
});
