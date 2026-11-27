import { notFound } from "next/navigation";
import { exigirPermiso } from "@/lib/auth/permissions";
import { generarReporteCursoXLSX } from "@/lib/reportes/curso";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ cursoId: string }> }
) {
  const { cursoId } = await params;
  await exigirPermiso("reporte:curso:descargar", { cursoId });
  const reporte = await generarReporteCursoXLSX(cursoId);
  if (!reporte) notFound();

  const nombreArchivo = encodeURIComponent(`reporte-${reporte.nombre}.xlsx`);
  return new Response(reporte.contenido, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="reporte-curso.xlsx"; filename*=UTF-8''${nombreArchivo}`,
      "Cache-Control": "private, no-store",
    },
  });
}
