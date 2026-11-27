import ExcelJS from "exceljs";
import { prisma } from "../db/client";
import { distribuirNotas, generarGraficoNotasPNG } from "./grafico-notas";

function fechaReporte(valor: Date | null) {
  return valor
    ? valor.toLocaleDateString("es-AR", { timeZone: "UTC" })
    : "No establecida";
}

function fechaHoraReporte(valor: Date | null) {
  return valor
    ? valor.toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" })
    : "";
}

function celdaSegura(valor: string | number | null | undefined) {
  if (typeof valor !== "string") return valor ?? null;
  return /^[\s\u0000-\u001f]*[=+\-@]/.test(valor) ? `'${valor}` : valor;
}

export async function generarReporteCursoXLSX(cursoId: string) {
  const curso = await prisma.curso.findUnique({
    where: { id: cursoId },
    select: {
      id: true,
      nombre: true,
      fechaInicio: true,
      fechaFin: true,
      estado: true,
      inscripciones: {
        where: {
          usuario: {
            roles: {
              some: {
                cursoId,
                grupoId: null,
                rol: { nombre: "Alumno", nivel: "CURSO" },
              },
            },
          },
        },
        include: {
          usuario: {
            select: { id: true, usuario: true, nombre: true, apellido: true },
          },
        },
        orderBy: { fechaRegistro: "asc" },
      },
      secciones: {
        orderBy: { orden: "asc" },
        select: {
          nombre: true,
          recursos: {
            where: {
              estado: true,
              visibilidad: true,
              padreId: null,
              tipo: { in: ["LECCION", "EVALUACION"] },
            },
            orderBy: { orden: "asc" },
            select: {
              nombre: true,
              hijos: {
                where: { estado: true, visibilidad: true, tipo: "ACTIVIDAD" },
                orderBy: { orden: "asc" },
                select: {
                  id: true,
                  nombre: true,
                  actividad: { select: { id: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!curso || curso.estado === "ELIMINADO") return null;

  const actividades = curso.secciones.flatMap((seccion) =>
    seccion.recursos.flatMap((contenedor) =>
      contenedor.hijos.flatMap((recurso) =>
        recurso.actividad
          ? [{
              id: recurso.actividad.id,
              nombre: `${seccion.nombre} / ${contenedor.nombre} / ${recurso.nombre}`,
            }]
          : []
      )
    )
  );
  const usuarioIds = curso.inscripciones.map(({ usuario }) => usuario.id);
  const entregas = actividades.length && usuarioIds.length
    ? await prisma.actividadEntrega.findMany({
        where: {
          actividadId: { in: actividades.map((actividad) => actividad.id) },
          usuarioId: { in: usuarioIds },
        },
        select: {
          actividadId: true,
          usuarioId: true,
          estado: true,
          nota: true,
          fechaEntrega: true,
          fechaCorreccion: true,
        },
      })
    : [];

  const porUsuarioYActividad = new Map(
    entregas.map((entrega) => [`${entrega.usuarioId}:${entrega.actividadId}`, entrega])
  );
  const filas: (string | number | null | undefined)[][] = [
    ["Reporte del curso", curso.nombre],
    ["Fecha de inicio", fechaReporte(curso.fechaInicio)],
    ["Fecha de fin", fechaReporte(curso.fechaFin)],
    ["Generado el", fechaHoraReporte(new Date())],
    [],
    [
      "Alumno",
      "Usuario",
      "Estado del curso",
      "Fecha de inscripción",
      "Fecha de finalización",
      "Actividades resueltas",
      "Actividades visibles",
      "Porcentaje resuelto",
      ...actividades.flatMap((actividad) => [
        `${actividad.nombre} - Estado`,
        `${actividad.nombre} - Nota / 10`,
        `${actividad.nombre} - Entrega`,
        `${actividad.nombre} - Corrección`,
      ]),
    ],
  ];

  for (const inscripcion of curso.inscripciones) {
    const estudiante = inscripcion.usuario;
    const actividadesDelEstudiante = actividades.map((actividad) =>
      porUsuarioYActividad.get(`${estudiante.id}:${actividad.id}`)
    );
    const resueltas = actividadesDelEstudiante.filter((entrega) => entrega?.estado === "RESUELTA").length;
    const porcentaje = actividades.length
      ? `${((resueltas / actividades.length) * 100).toFixed(2)}%`
      : "No disponible";
    const estadoCurso = inscripcion.estado === "FINALIZADO" ? "Finalizado" : "En curso";
    filas.push([
      `${estudiante.nombre} ${estudiante.apellido}`,
      estudiante.usuario,
      estadoCurso,
      fechaHoraReporte(inscripcion.fechaRegistro),
      fechaHoraReporte(inscripcion.fechaFinalizacion),
      resueltas,
      actividades.length,
      porcentaje,
      ...actividadesDelEstudiante.flatMap((entrega) => [
        entrega?.estado === "RESUELTA"
          ? "Resuelta"
          : entrega?.estado === "ENTREGADA"
            ? "Entregada; pendiente de corrección"
            : "Sin entregar",
        entrega?.nota?.toString() ?? "",
        fechaHoraReporte(entrega?.fechaEntrega ?? null),
        fechaHoraReporte(entrega?.fechaCorreccion ?? null),
      ]),
    ]);
  }

  const libro = new ExcelJS.Workbook();
  libro.creator = "Plataforma de cursos";
  libro.created = new Date();
  libro.modified = new Date();

  const notas = entregas
    .filter((entrega) => entrega.estado === "RESUELTA" && entrega.nota !== null)
    .map((entrega) => Number(entrega.nota));
  const distribucion = distribuirNotas(notas);
  const imagenGrafico = await generarGraficoNotasPNG(notas);
  const resumen = libro.addWorksheet("Resumen de notas", {
    views: [{ state: "frozen", ySplit: 4 }],
  });
  resumen.mergeCells("A1:B1");
  resumen.getCell("A1").value = `Distribución de notas — ${curso.nombre}`;
  resumen.getCell("A1").font = { bold: true, size: 15, color: { argb: "FF1F3A5F" } };
  resumen.getCell("A2").value = "Cada entrega resuelta con nota cuenta una vez; escala de 0 a 10.";
  resumen.addRow([]);
  resumen.addRow(["Rango de nota", "Cantidad de notas"]);
  distribucion.forEach(({ etiqueta, cantidad }) => resumen.addRow([etiqueta, cantidad]));
  resumen.addRow(["Total", notas.length]);
  resumen.addRow([]);
  resumen.addRow(["Gráfico de distribución de notas"]);
  resumen.getRow(4).font = { bold: true, color: { argb: "FFFFFFFF" } };
  resumen.getRow(4).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1F3A5F" },
  };
  resumen.autoFilter = { from: { row: 4, column: 1 }, to: { row: 9, column: 2 } };
  resumen.getColumn(1).width = 34;
  resumen.getColumn(2).width = 22;
  resumen.getColumn(2).alignment = { horizontal: "center" };
  const idGrafico = libro.addImage({
    base64: `data:image/png;base64,${imagenGrafico.toString("base64")}`,
    extension: "png",
  });
  resumen.addImage(idGrafico, {
    tl: { col: 0, row: 12 },
    ext: { width: 720, height: 400 },
  });

  const hoja = libro.addWorksheet("Reporte del curso", {
    views: [{ state: "frozen", ySplit: 6 }],
  });
  filas.forEach((fila) => hoja.addRow(fila.map(celdaSegura)));

  hoja.getRow(1).font = { bold: true, size: 14 };
  for (const numeroFila of [1, 2, 3, 4]) {
    hoja.getCell(numeroFila, 1).font = { bold: true };
  }

  const filaEncabezado = hoja.getRow(6);
  filaEncabezado.font = { bold: true, color: { argb: "FFFFFFFF" } };
  filaEncabezado.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1F3A5F" },
  };
  filaEncabezado.alignment = { vertical: "middle", wrapText: true };
  filaEncabezado.height = 42;
  hoja.autoFilter = {
    from: { row: 6, column: 1 },
    to: { row: hoja.rowCount, column: filas[5].length },
  };
  hoja.columns.forEach((columna, indice) => {
    columna.width = indice < 8 ? (indice === 1 ? 22 : 20) : 34;
  });

  return {
    nombre: curso.nombre,
    contenido: new Uint8Array(await libro.xlsx.writeBuffer()),
  };
}
