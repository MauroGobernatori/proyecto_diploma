import { PassThrough } from "node:stream";
import * as PImage from "pureimage";

export const RANGOS_NOTAS = [
  { etiqueta: "0–1,99", desde: 0, hasta: 2 },
  { etiqueta: "2–3,99", desde: 2, hasta: 4 },
  { etiqueta: "4–5,99", desde: 4, hasta: 6 },
  { etiqueta: "6–7,99", desde: 6, hasta: 8 },
  { etiqueta: "8–10", desde: 8, hasta: 10 },
] as const;

export function distribuirNotas(notas: readonly number[]) {
  return RANGOS_NOTAS.map(({ etiqueta, desde, hasta }, indice) => ({
    etiqueta,
    cantidad: notas.filter((nota) =>
      Number.isFinite(nota) && nota >= desde &&
      (indice === RANGOS_NOTAS.length - 1 ? nota <= hasta : nota < hasta)
    ).length,
  }));
}

export async function generarGraficoNotasPNG(notas: readonly number[]) {
  const distribucion = distribuirNotas(notas);
  const canvas = PImage.make(900, 500);
  const contexto = canvas.getContext("2d");
  const izquierda = 70;
  const derecha = 850;
  const arriba = 35;
  const abajo = 425;
  const alturaUtil = abajo - arriba;
  const maximo = Math.max(1, ...distribucion.map(({ cantidad }) => cantidad));

  contexto.fillStyle = "#ffffff";
  contexto.fillRect(0, 0, 900, 500);

  for (let linea = 0; linea <= 4; linea += 1) {
    const y = arriba + (alturaUtil * linea) / 4;
    contexto.strokeStyle = "#d9e1ea";
    contexto.lineWidth = 1;
    contexto.beginPath();
    contexto.moveTo(izquierda, y);
    contexto.lineTo(derecha, y);
    contexto.stroke();
  }

  contexto.strokeStyle = "#526173";
  contexto.lineWidth = 2;
  contexto.beginPath();
  contexto.moveTo(izquierda, arriba);
  contexto.lineTo(izquierda, abajo);
  contexto.lineTo(derecha, abajo);
  contexto.stroke();

  const anchoBarra = 92;
  const espacio = (derecha - izquierda - anchoBarra * distribucion.length) / (distribucion.length * 2);
  distribucion.forEach(({ cantidad }, indice) => {
    const x = izquierda + espacio + indice * (anchoBarra + espacio * 2);
    const altura = (cantidad / maximo) * (alturaUtil - 12);
    contexto.fillStyle = ["#dc6b5f", "#e8a14b", "#e4c84a", "#65a987", "#3979a8"][indice];
    contexto.fillRect(x, abajo - altura, anchoBarra, altura);
  });

  const stream = new PassThrough();
  const bloques: Buffer[] = [];
  stream.on("data", (bloque: Buffer) => bloques.push(Buffer.from(bloque)));
  await PImage.encodePNGToStream(canvas, stream);
  return Buffer.concat(bloques);
}
