import Link from "next/link";
import { obtenerCursos } from "@/lib/db/cursos";

export const metadata = { title: "Catálogo de cursos" };

export default async function CursosPage() {
  const cursos = await obtenerCursos(true);

  return (
    <main className="content-container">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Aprendizaje a tu ritmo</p>
          <h1>Catálogo de cursos</h1>
          <p>Encontrá un tema que te interese y explorá sus contenidos.</p>
        </div>
        <span className="tag">{cursos.length} {cursos.length === 1 ? "curso" : "cursos"}</span>
      </div>

      {cursos.length ? (
        <div className="course-grid">
          {cursos.map((curso) => (
            <Link className="course-card" href={`/cursos/${curso.id}`} key={curso.id}>
              <div className="course-card-top">
                <span aria-hidden="true" className="course-mark">{curso.nombre.slice(0, 1).toUpperCase()}</span>
                {curso.tema ? <span className="tag">{curso.tema}</span> : null}
              </div>
              <h3>{curso.nombre}</h3>
              <p>{curso.descripcion}</p>
              <div className="course-card-footer">
                <span>{curso.formato || "Curso online"}</span>
                <strong>Explorar ↗</strong>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state"><strong>No hay cursos visibles todavía</strong><p>Volvé más adelante para descubrir nuevas propuestas.</p></div>
      )}
    </main>
  );
}
