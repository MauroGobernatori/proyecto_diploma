import Link from "next/link";
import { obtenerUsuarioActual } from "@/lib/auth/current-user";
import { obtenerCursosDelUsuario } from "@/lib/db/cursos";

export const metadata = { title: "Mis cursos" };

export default async function MisCursosPage() {
  const usuario = await obtenerUsuarioActual();
  const inscripciones = await obtenerCursosDelUsuario(usuario.id);

  return (
    <main className="content-container">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Tu recorrido</p>
          <h1>Mis cursos</h1>
          <p>Consultá tus inscripciones y el estado de cada curso.</p>
        </div>
        <Link className="button button-outline" href="/cursos">Explorar catálogo</Link>
      </div>
      {inscripciones.length ? (
        <div className="list-stack">
          {inscripciones.map(({ curso, estado, fechaRegistro, fechaFinalizacion }) => (
            <Link className="course-row" href={`/cursos/${curso.id}`} key={curso.id}>
              <div className="course-row-main">
                <span aria-hidden="true" className="course-mark">{curso.nombre.slice(0, 1).toUpperCase()}</span>
                <div className="course-row-copy"><h3>{curso.nombre}</h3><p>{curso.descripcion}</p></div>
              </div>
              <div className="course-row-status">
                <span className={`tag ${estado === "FINALIZADO" ? "tag-green" : ""}`}>{estado === "FINALIZADO" ? "Finalizado" : "En curso"}</span>
                <time dateTime={(fechaFinalizacion ?? fechaRegistro).toISOString()}>
                  {fechaFinalizacion
                    ? `Finalizado el ${fechaFinalizacion.toLocaleDateString("es-AR")}`
                    : `Inscripto el ${fechaRegistro.toLocaleDateString("es-AR")}`}
                </time>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state"><strong>Aún no estás inscripto en cursos</strong><p>Cuando te asignen a un curso, lo vas a ver en esta lista.</p></div>
      )}
    </main>
  );
}
