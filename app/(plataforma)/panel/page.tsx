import Link from "next/link";
import { obtenerUsuarioActual } from "@/lib/auth/current-user";
import { obtenerCursosDelUsuario, obtenerCursos } from "@/lib/db/cursos";
import { obtenerRecompensasObtenidasPorUsuario } from "@/lib/db/recompensas";

function CursoCard({ curso }: { curso: { id: string; nombre: string; descripcion: string; tema: string | null } }) {
  return (
    <Link className="course-card" href={`/cursos/${curso.id}`}>
      <div className="course-card-top">
        <span aria-hidden="true" className="course-mark">{curso.nombre.slice(0, 1).toUpperCase()}</span>
        {curso.tema ? <span className="tag">{curso.tema}</span> : null}
      </div>
      <h3>{curso.nombre}</h3>
      <p>{curso.descripcion}</p>
      <div className="course-card-footer"><span>Ver curso</span><strong>↗</strong></div>
    </Link>
  );
}

export default async function PanelPage() {
  const usuario = await obtenerUsuarioActual();
  const [misCursos, recompensas, cursosVisibles] = await Promise.all([
    obtenerCursosDelUsuario(usuario.id),
    obtenerRecompensasObtenidasPorUsuario(usuario.id),
    obtenerCursos(true),
  ]);
  const cursosRecientes = misCursos.slice(0, 3);

  return (
    <main className="content-container">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Tu espacio de aprendizaje</p>
          <h1>Hola, {usuario.nombre}.</h1>
          <p>Acá tenés un resumen de tu recorrido y lo que podés explorar.</p>
        </div>
        <Link className="button button-primary" href="/cursos">Explorar cursos <span aria-hidden="true">↗</span></Link>
      </div>

      <section aria-label="Resumen de actividad" className="stats-grid">
        <article className="stat-card"><span className="stat-label">Cursos inscriptos</span><strong className="stat-number">{misCursos.length}</strong></article>
        <article className="stat-card"><span className="stat-label">Cursos finalizados</span><strong className="stat-number">{misCursos.filter((item) => item.estado === "FINALIZADO").length}</strong></article>
        <article className="stat-card"><span className="stat-label">Recompensas obtenidas</span><strong className="stat-number">{recompensas.length}</strong></article>
      </section>

      <div className="section-row">
        <h2>Retomá tu recorrido</h2>
        <Link href="/mis-cursos">Ver mis cursos ↗</Link>
      </div>
      {cursosRecientes.length ? (
        <div className="list-stack">
          {cursosRecientes.map(({ curso, estado, fechaRegistro }) => (
            <Link className="course-row" href={`/cursos/${curso.id}`} key={curso.id}>
              <div className="course-row-main">
                <span aria-hidden="true" className="course-mark">{curso.nombre.slice(0, 1).toUpperCase()}</span>
                <div className="course-row-copy"><h3>{curso.nombre}</h3><p>{curso.descripcion}</p></div>
              </div>
              <div className="course-row-status">
                <span className={`tag ${estado === "FINALIZADO" ? "tag-green" : ""}`}>{estado === "FINALIZADO" ? "Finalizado" : "En curso"}</span>
                <time dateTime={fechaRegistro.toISOString()}>Desde {fechaRegistro.toLocaleDateString("es-AR")}</time>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state"><strong>Todavía no tenés cursos inscriptos</strong><p>Explorá el catálogo para conocer los cursos disponibles.</p></div>
      )}

      <div className="section-row">
        <h2>Cursos para explorar</h2>
        <Link href="/cursos">Ver catálogo ↗</Link>
      </div>
      {cursosVisibles.length ? (
        <div className="course-grid">
          {cursosVisibles.slice(0, 3).map((curso) => <CursoCard curso={curso} key={curso.id} />)}
        </div>
      ) : (
        <div className="empty-state"><strong>El catálogo se está preparando</strong><p>Cuando haya cursos visibles, los vas a encontrar en este espacio.</p></div>
      )}
    </main>
  );
}
