import Link from "next/link";
import { obtenerUsuarioActual } from "@/lib/auth/current-user";
import { permisosDeCursos } from "@/lib/auth/permissions";
import { obtenerCursos } from "@/lib/db/cursos";
import { crearCursoAction, actualizarCursoAction, eliminarCursoAction } from "./actions";
import { ConfirmarBajaCurso } from "./confirmar-baja-curso";

export const metadata = { title: "Cursos" };

const avisos: Record<string, string> = {
  creado: "El curso se creó.", actualizado: "Los ajustes del curso se guardaron.", eliminado: "El curso se dio de baja y se conservó su historial.",
  "datos-invalidos": "Revisá el nombre, la descripción y las fechas del curso.",
};

function fechaInput(fecha: Date | null) {
  return fecha ? fecha.toISOString().slice(0, 10) : "";
}

export default async function CursosPage({ searchParams }: { searchParams: Promise<{ resultado?: string }> }) {
  const usuario = await obtenerUsuarioActual();
  const permisos = await permisosDeCursos(usuario.id);
  const administraCursos = permisos.crear || permisos.modificar || permisos.eliminar;
  const [cursos, params] = await Promise.all([obtenerCursos(!administraCursos), searchParams]);

  return (
    <main className="content-container">
      <div className="page-heading">
        <div><p className="eyebrow">Aprendizaje a tu ritmo</p><h1>Cursos</h1><p>Explorá cursos o administrá su información.</p></div>
        <span className="tag">{cursos.length} {cursos.length === 1 ? "curso" : "cursos"}</span>
      </div>
      {params.resultado && avisos[params.resultado] ? <p className={params.resultado === "datos-invalidos" ? "form-error" : "notice"} role="status">{avisos[params.resultado]}</p> : null}

      {permisos.crear ? (
        <section className="course-editor surface-card course-management-card">
          <h2>Crear curso</h2>
          <form action={crearCursoAction} className="course-settings-form">
            <label className="field-label">Nombre<input className="text-input" name="nombre" minLength={3} required /></label>
            <label className="field-label">Descripción<textarea className="text-area" name="descripcion" minLength={5} required /></label>
            <label className="field-label">Fecha de inicio<input className="text-input" name="fechaInicio" type="date" /></label>
            <label className="field-label">Fecha de finalización<input className="text-input" name="fechaFin" type="date" /></label>
            <label className="field-label">Tema<input className="text-input" name="tema" /></label>
            <label className="field-label">Formato<input className="text-input" name="formato" placeholder="Online, presencial…" /></label>
            <label className="field-label">Logo (URL)<input className="text-input" name="logo" type="url" /></label>
            <label className="visibility-field"><input type="checkbox" name="visibilidad" defaultChecked />Visible en el catálogo</label>
            <label className="visibility-field"><input type="checkbox" name="matriculacionLibre" />Permitir matriculación libre</label>
            <button className="button button-primary" type="submit">Crear curso</button>
          </form>
        </section>
      ) : null}

      {cursos.length ? (
        <div className="course-management-list">
          {cursos.map((curso) => (
            <article className="surface-card course-management-item" key={curso.id}>
              <div className="course-management-heading"><div><h2>{curso.nombre}</h2><p>{curso.estado === "ELIMINADO" ? "Dado de baja" : curso.visibilidad ? "Visible" : "Oculto"} · {curso.estado}</p></div><Link className="button button-outline button-small" href={`/cursos/${curso.id}`}>Abrir curso</Link></div>
              {permisos.modificar && curso.estado !== "ELIMINADO" ? (
                <form action={actualizarCursoAction} className="course-settings-form">
                  <input name="id" type="hidden" value={curso.id} />
                  <input name="estado" type="hidden" value={curso.estado} />
                  <label className="field-label">Nombre<input className="text-input" name="nombre" defaultValue={curso.nombre} minLength={3} required /></label>
                  <label className="field-label">Descripción<textarea className="text-area" name="descripcion" defaultValue={curso.descripcion} minLength={5} required /></label>
                  <label className="field-label">Fecha de inicio<input className="text-input" name="fechaInicio" type="date" defaultValue={fechaInput(curso.fechaInicio)} /></label>
                  <label className="field-label">Fecha de finalización<input className="text-input" name="fechaFin" type="date" defaultValue={fechaInput(curso.fechaFin)} /></label>
                  <label className="field-label">Tema<input className="text-input" name="tema" defaultValue={curso.tema ?? ""} /></label>
                  <label className="field-label">Formato<input className="text-input" name="formato" defaultValue={curso.formato ?? ""} /></label>
                  <label className="field-label">Logo (URL)<input className="text-input" name="logo" type="url" defaultValue={curso.logo ?? ""} /></label>
                  <label className="visibility-field"><input type="checkbox" name="visibilidad" defaultChecked={curso.visibilidad} />Visible en el catálogo</label>
                  <label className="visibility-field"><input type="checkbox" name="matriculacionLibre" defaultChecked={curso.matriculacionLibre} />Permitir matriculación libre</label>
                  <button className="button button-outline button-small" type="submit">Guardar ajustes</button>
                </form>
              ) : null}
              {permisos.eliminar && curso.estado !== "ELIMINADO" ? <ConfirmarBajaCurso id={curso.id} action={eliminarCursoAction} /> : null}
            </article>
          ))}
        </div>
      ) : <div className="empty-state"><strong>No hay cursos visibles todavía</strong><p>Volvé más adelante para descubrir nuevas propuestas.</p></div>}
    </main>
  );
}
