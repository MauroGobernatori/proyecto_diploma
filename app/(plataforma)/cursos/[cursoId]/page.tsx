import { notFound } from "next/navigation";
import { obtenerUsuarioActual } from "@/lib/auth/current-user";
import { obtenerCursoPorId } from "@/lib/db/cursos";
import { validarAccesoACurso } from "@/lib/cursos";
import { ForbiddenError, NotFoundError } from "@/lib/errores";

const tiposRecurso: Record<string, string> = {
  LINK: "Enlace",
  VIDEO: "Video",
  DOCUMENTO: "Documento",
  ACTIVIDAD: "Actividad",
  EVALUACION: "Evaluación",
};

export default async function CursoDetallePage({
  params,
}: {
  params: Promise<{ cursoId: string }>;
}) {
  const [{ cursoId }, usuario] = await Promise.all([params, obtenerUsuarioActual()]);

  try {
    await validarAccesoACurso(usuario.id, cursoId);
  } catch (error) {
    if (error instanceof ForbiddenError || error instanceof NotFoundError) notFound();
    throw error;
  }

  const curso = await obtenerCursoPorId(cursoId);
  if (!curso || curso.estado === "ELIMINADO") notFound();

  return (
    <main className="content-container">
      <div className="course-detail-head">
        <div>
          <p className="eyebrow">{curso.tema || "Curso"}{curso.formato ? ` · ${curso.formato}` : ""}</p>
          <h1>{curso.nombre}</h1>
          <p>{curso.descripcion}</p>
        </div>
        <span aria-hidden="true" className="course-detail-mark">{curso.nombre.slice(0, 1).toUpperCase()}</span>
      </div>

      <div className="section-row"><h2>Contenido del curso</h2><span className="tag">{curso.secciones.length} {curso.secciones.length === 1 ? "sección" : "secciones"}</span></div>
      {curso.secciones.length ? (
        <div className="section-list">
          {curso.secciones.map((seccion) => (
            <section className="course-section" key={seccion.id}>
              <h2>{seccion.nombre}</h2>
              {seccion.recursos.length ? seccion.recursos.map((recurso) => (
                <div className="resource-row" key={recurso.id}>
                  <span>{recurso.nombre}{recurso.descripcion ? <span className="resource-type"> · {recurso.descripcion}</span> : null}</span>
                  <span className="resource-type">{tiposRecurso[recurso.tipo]}</span>
                  {recurso.url ? <a href={recurso.url} target="_blank" rel="noreferrer">Abrir ↗</a> : null}
                </div>
              )) : <p className="muted">Esta sección todavía no tiene recursos.</p>}
            </section>
          ))}
        </div>
      ) : (
        <div className="empty-state"><strong>El contenido está en preparación</strong><p>Las secciones y recursos van a aparecer acá.</p></div>
      )}
    </main>
  );
}
