import { notFound } from "next/navigation";
import { obtenerUsuarioActual } from "@/lib/auth/current-user";
import { permisosDeContenidoCurso, permisosDeCursos } from "@/lib/auth/permissions";
import { obtenerAlumnosInscritos, obtenerCursoPorId, obtenerUsuariosDisponiblesParaInscribir } from "@/lib/db/cursos";
import { esAdministradorDePlataforma } from "@/lib/db/usuarios";
import { validarAccesoACurso } from "@/lib/cursos";
import { ForbiddenError, NotFoundError } from "@/lib/errores";
import {
  corregirActividadAction,
  crearActividadAction,
  crearRecursoAction,
  crearSeccionAction,
  eliminarRecursoAction,
  eliminarSeccionAction,
  entregarActividadAction,
  modificarActividadAction,
  modificarRecursoAction,
  modificarSeccionAction,
  inscribirAlumnoAction,
  desinscribirAlumnoAction,
} from "./actions";
import { ConfirmarEliminacion } from "./confirmar-eliminacion";
import { ConfirmarDesinscripcion } from "./confirmar-desinscripcion";

const tiposRecurso: Record<string, string> = {
  LINK: "Enlace",
  VIDEO: "Video",
  DOCUMENTO: "Documento",
  PAGINA_CONTENIDO: "Página de contenido",
  LECCION: "Lección",
  ACTIVIDAD: "Actividad",
  EVALUACION: "Evaluación",
};

const tiposActividad = [
  ["OPCION_MULTIPLE", "Opción múltiple"],
  ["VERDADERO_FALSO", "Verdadero o falso"],
  ["RESPUESTA_ABIERTA", "Respuesta abierta"],
] as const;

const mensajes: Record<string, string> = {
  "seccion-creada": "La sección se creó.",
  "seccion-actualizada": "La sección se actualizó.",
  "seccion-eliminada": "Se eliminó la sección y su contenido.",
  "recurso-creado": "El recurso se creó.",
  "recurso-actualizado": "El recurso se actualizó.",
  "recurso-eliminado": "El recurso dejó de estar activo.",
  "actividad-creada": "La actividad se creó.",
  "actividad-actualizada": "La actividad se actualizó.",
  "actividad-entregada": "La actividad se entregó.",
  "actividad-corregida": "La actividad quedó resuelta.",
  "actividad-ya-entregada": "Ya entregaste esta actividad.",
  "actividad-invalida": "Revisá el tipo, las opciones y la respuesta correcta de la actividad.",
  "actividad-con-entregas": "No se puede cambiar la actividad porque ya tiene entregas.",
  "crear-actividad-desde-contenedor": "Las actividades se crean desde una lección o evaluación.",
  "actividad-contenida": "Esta actividad pertenece a una lección o evaluación.",
  "contenedor-con-actividades": "No se puede cambiar el tipo de un contenedor que todavía tiene actividades.",
  "respuesta-requerida": "Ingresá una respuesta antes de entregar.",
  "datos-invalidos": "Revisá los datos del formulario.",
  "curso-no-disponible": "El curso no está disponible.",
  "no-encontrado": "No se encontró el elemento solicitado.",
  "alumno-inscripto": "El alumno se inscribió al curso.",
  "alumno-desinscripto": "El alumno se desinscribió; sus entregas y notas se conservaron.",
};

function opcionesDe(valor: unknown): { id: string; texto: string }[] {
  if (!Array.isArray(valor)) return [];
  return valor.filter(
    (opcion): opcion is { id: string; texto: string } =>
      typeof opcion === "object" && opcion !== null &&
      "id" in opcion && typeof opcion.id === "string" &&
      "texto" in opcion && typeof opcion.texto === "string"
  );
}

function fecha(valor: Date | null) {
  return valor ? valor.toLocaleDateString("es-AR") : "No establecida";
}

function nota(valor: { toString(): string } | null) {
  if (valor === null) return "Pendiente";
  return Number(valor.toString()).toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function campoVisibilidad(visibilidad = true) {
  return (
    <label className="visibility-field">
      <input type="checkbox" name="visibilidad" defaultChecked={visibilidad} />
      Visible para Alumnos
    </label>
  );
}

function formularioActividad({
  contenedorId,
  action,
  recurso,
}: {
  contenedorId: string;
  action: (formData: FormData) => void | Promise<void>;
  recurso?: {
    id: string;
    nombre: string;
    descripcion: string | null;
    orden: number;
    visibilidad: boolean;
    actividad: {
      tipo: string;
      opciones: unknown;
      respuestaCorrecta: string | null;
    } | null;
  };
}) {
  const opciones = opcionesDe(recurso?.actividad?.opciones);
  const respuestaCorrecta = recurso?.actividad?.respuestaCorrecta
    ? opciones.find((opcion) => opcion.id === recurso.actividad?.respuestaCorrecta)?.texto ?? recurso.actividad.respuestaCorrecta
    : "";

  return (
    <form action={action} className="content-editor-form form-stack">
      {recurso ? <input type="hidden" name="id" value={recurso.id} /> : null}
      <input type="hidden" name="contenedorId" value={contenedorId} />
      <label className="field-label">Consigna<input className="text-input" name="nombre" defaultValue={recurso?.nombre} required /></label>
      <label className="field-label">Descripción o instrucciones<textarea className="text-area" name="descripcion" defaultValue={recurso?.descripcion ?? ""} /></label>
      <label className="field-label">
        Tipo de actividad
        <select className="text-input" name="tipoActividad" defaultValue={recurso?.actividad?.tipo ?? "OPCION_MULTIPLE"}>
          {tiposActividad.map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
        </select>
      </label>
      <label className="field-label">
        Opciones, una por línea
        <textarea className="text-area" name="opciones" defaultValue={opciones.map((opcion) => opcion.texto).join("\n")} placeholder="Primera opción&#10;Segunda opción" />
      </label>
      <label className="field-label">
        Respuesta correcta
        <input className="text-input" name="respuestaCorrecta" defaultValue={respuestaCorrecta} placeholder="Texto de la opción o true/false" />
      </label>
      <label className="field-label">Orden<input className="text-input" name="orden" type="number" min="1" defaultValue={recurso?.orden ?? 1} /></label>
      {campoVisibilidad(recurso?.visibilidad ?? true)}
      <button className="button button-primary button-small" type="submit">{recurso ? "Guardar actividad" : "Crear actividad"}</button>
    </form>
  );
}

export default async function CursoDetallePage({
  params,
  searchParams,
}: {
  params: Promise<{ cursoId: string }>;
  searchParams?: Promise<{ resultado?: string }>;
}) {
  const [{ cursoId }, usuario] = await Promise.all([params, obtenerUsuarioActual()]);
  try {
    await validarAccesoACurso(usuario.id, cursoId);
  } catch (error) {
    if (error instanceof ForbiddenError || error instanceof NotFoundError) notFound();
    throw error;
  }

  const [permisos, permisosCurso] = await Promise.all([
    permisosDeContenidoCurso(usuario.id, cursoId),
    permisosDeCursos(usuario.id),
  ]);
  const puedeGestionarInscripciones = permisosCurso.gestionarInscripciones;
  const esAdmin = puedeGestionarInscripciones ? await esAdministradorDePlataforma(usuario.id) : false;
  const [alumnosInscritos, usuariosDisponibles] = puedeGestionarInscripciones
    ? await Promise.all([
        obtenerAlumnosInscritos(cursoId),
        obtenerUsuariosDisponiblesParaInscribir(cursoId, !esAdmin),
      ])
    : [[], []];
  const curso = await obtenerCursoPorId(cursoId, {
    usuarioId: usuario.id,
    verOcultos: permisos.verOcultos,
  });
  if (!curso || curso.estado === "ELIMINADO") notFound();

  const resultado = (await searchParams)?.resultado;
  const aviso = resultado ? mensajes[resultado] : undefined;

  return (
    <main className="content-container">
      {aviso ? <p className="notice" role="status">{aviso}</p> : null}
      <div className="course-detail-head">
        <div>
          <p className="eyebrow">{curso.tema || "Curso"}{curso.formato ? ` · ${curso.formato}` : ""}</p>
          <h1>{curso.nombre}</h1>
          <p>{curso.descripcion}</p>
          <p className="course-dates">Inicio: {fecha(curso.fechaInicio)} · Fin: {fecha(curso.fechaFin)}</p>
          {permisos.descargarReporte ? (
            <a className="button button-outline button-small report-button" href={`/cursos/${curso.id}/reporte`}>
              Descargar reporte del curso
            </a>
          ) : null}
        </div>
        <span aria-hidden="true" className="course-detail-mark">{curso.nombre.slice(0, 1).toUpperCase()}</span>
      </div>

      {puedeGestionarInscripciones ? (
        <section className="course-editor surface-card course-management-card">
          <h2>Alumnos inscriptos</h2>
          <p>La desinscripción conserva sus entregas y notas como historial.</p>
          {usuariosDisponibles.length ? (
            <form action={inscribirAlumnoAction} className="content-editor-inline enrollment-form">
              <input name="cursoId" type="hidden" value={curso.id} />
              <label className="field-label">Inscribir alumno
                <select className="text-input" name="usuarioId" required defaultValue="">
                  <option value="" disabled>Seleccioná un usuario</option>
                  {usuariosDisponibles.map((persona) => <option key={persona.id} value={persona.id}>{persona.nombre} {persona.apellido} · {persona.usuario}</option>)}
                </select>
              </label>
              <button className="button button-primary button-small" type="submit">Inscribir</button>
            </form>
          ) : <p className="empty-inline">No hay usuarios disponibles para inscribir.</p>}
          {alumnosInscritos.length ? (
            <div className="enrollment-list">
              {alumnosInscritos.map(({ usuario: alumno, fechaRegistro }) => (
                <article className="enrollment-item" key={alumno.id}>
                  <div><strong>{alumno.nombre} {alumno.apellido}</strong><span>@{alumno.usuario} · {alumno.email} · desde {fechaRegistro.toLocaleDateString("es-AR")}</span></div>
                  <ConfirmarDesinscripcion cursoId={curso.id} usuarioId={alumno.id} action={desinscribirAlumnoAction} />
                </article>
              ))}
            </div>
          ) : <p className="empty-inline">Todavía no hay alumnos inscriptos.</p>}
        </section>
      ) : null}

      <div className="section-row">
        <h2>Contenido del curso</h2>
        <span className="tag">{curso.secciones.length} {curso.secciones.length === 1 ? "sección" : "secciones"}</span>
      </div>

      {permisos.crearSeccion ? (
        <section className="course-editor surface-card">
          <h2>Crear sección</h2>
          <form action={crearSeccionAction} className="content-editor-form content-editor-inline">
            <input type="hidden" name="cursoId" value={curso.id} />
            <label className="field-label">Nombre<input className="text-input" name="nombre" required /></label>
            <label className="field-label">Orden<input className="text-input" name="orden" type="number" min="1" defaultValue="1" /></label>
            <button className="button button-primary button-small" type="submit">Crear sección</button>
          </form>
        </section>
      ) : null}

      {curso.secciones.length ? (
        <div className="section-list">
          {curso.secciones.map((seccion) => (
            <section className="course-section" key={seccion.id}>
              <div className="content-section-heading">
                <h2>{seccion.nombre}</h2>
                {permisos.modificarSeccion || permisos.eliminarSeccion ? (
                  <div className="content-actions">
                    {permisos.modificarSeccion ? (
                      <form action={modificarSeccionAction} className="content-editor-inline">
                        <input type="hidden" name="id" value={seccion.id} />
                        <label className="visually-hidden" htmlFor={`seccion-nombre-${seccion.id}`}>Nombre de sección</label>
                        <input className="text-input" id={`seccion-nombre-${seccion.id}`} name="nombre" defaultValue={seccion.nombre} required />
                        <label className="visually-hidden" htmlFor={`seccion-orden-${seccion.id}`}>Orden de sección</label>
                        <input className="text-input order-input" id={`seccion-orden-${seccion.id}`} name="orden" type="number" min="1" defaultValue={seccion.orden} />
                        <button className="button button-outline button-small" type="submit">Guardar</button>
                      </form>
                    ) : null}
                    {permisos.eliminarSeccion ? (
                      <ConfirmarEliminacion
                        action={eliminarSeccionAction}
                        id={seccion.id}
                        mensaje={`Al borrar la sección «${seccion.nombre}», sus recursos, actividades, entregas y notas se eliminarán permanentemente. Esta acción no se puede deshacer. ¿Continuar?`}
                      />
                    ) : null}
                  </div>
                ) : null}
              </div>

              {permisos.crearRecurso ? (
                <details className="content-create-details">
                  <summary>Agregar recurso</summary>
                  <form action={crearRecursoAction} className="content-editor-form content-editor-grid">
                    <input type="hidden" name="cursoId" value={curso.id} />
                    <input type="hidden" name="seccionId" value={seccion.id} />
                    <label className="field-label">Nombre<input className="text-input" name="nombre" required /></label>
                    <label className="field-label">Tipo
                      <select className="text-input" name="tipo" defaultValue="LINK">
                        <option value="LINK">Enlace</option>
                        <option value="VIDEO">Video</option>
                        <option value="DOCUMENTO">Documento</option>
                        <option value="PAGINA_CONTENIDO">Página de contenido</option>
                        <option value="LECCION">Lección</option>
                        <option value="EVALUACION">Evaluación</option>
                      </select>
                    </label>
                    <label className="field-label">URL<input className="text-input" name="url" type="url" /></label>
                    <label className="field-label">Orden<input className="text-input" name="orden" type="number" min="1" defaultValue="1" /></label>
                    <label className="field-label field-span">Descripción<textarea className="text-area" name="descripcion" /></label>
                    <label className="field-label field-span">Texto de la página (solo para Página de contenido)<textarea className="text-area content-page-input" name="contenido" /></label>
                    {campoVisibilidad()}
                    <button className="button button-primary button-small" type="submit">Crear recurso</button>
                  </form>
                </details>
              ) : null}

              {seccion.recursos.length ? (
                <div className="section-resource-list">
                  {seccion.recursos.map((recurso) => {
                    const actividad = recurso.actividad;
                    const entregas = actividad?.entregas ?? [];
                    const miEntrega = entregas.find((entrega) => entrega.usuarioId === usuario.id);
                    const opciones = opcionesDe(actividad?.opciones);
                    const contenedor = recurso.tipo === "LECCION" || recurso.tipo === "EVALUACION";

                    return (
                      <article className="managed-resource" key={recurso.id}>
                        <div className="resource-row resource-row-main">
                          <div>
                            <strong>{recurso.nombre}</strong>
                            {recurso.descripcion ? <span className="resource-description">{recurso.descripcion}</span> : null}
                          </div>
                          <span className="resource-type">{tiposRecurso[recurso.tipo]}{!recurso.visibilidad ? " · Oculto" : ""}</span>
                          {recurso.url ? <a href={recurso.url} target="_blank" rel="noreferrer">Abrir ↗</a> : null}
                        </div>
                        {recurso.tipo === "PAGINA_CONTENIDO" && recurso.contenido ? (
                          <div className="content-page-body">{recurso.contenido}</div>
                        ) : null}

                        {permisos.modificarRecurso && actividad ? (
                          <details className="content-edit-details">
                            <summary>Editar actividad</summary>
                            {formularioActividad({
                              contenedorId: recurso.padreId ?? "",
                              action: modificarActividadAction,
                              recurso: {
                                id: recurso.id,
                                nombre: recurso.nombre,
                                descripcion: recurso.descripcion,
                                orden: recurso.orden,
                                visibilidad: recurso.visibilidad,
                                actividad: {
                                  tipo: actividad.tipo,
                                  opciones: actividad.opciones,
                                  respuestaCorrecta: actividad.respuestaCorrecta,
                                },
                              },
                            })}
                          </details>
                        ) : permisos.modificarRecurso && !actividad ? (
                          <details className="content-edit-details">
                            <summary>Editar recurso</summary>
                            <form action={modificarRecursoAction} className="content-editor-form content-editor-grid">
                              <input type="hidden" name="id" value={recurso.id} />
                              <label className="field-label">Nombre<input className="text-input" name="nombre" defaultValue={recurso.nombre} required /></label>
                              <label className="field-label">Tipo
                                <select className="text-input" name="tipo" defaultValue={recurso.tipo}>
                                  <option value="LINK">Enlace</option>
                                  <option value="VIDEO">Video</option>
                                  <option value="DOCUMENTO">Documento</option>
                                  <option value="PAGINA_CONTENIDO">Página de contenido</option>
                                  <option value="LECCION">Lección</option>
                                  {recurso.tipo === "ACTIVIDAD" ? <option value="ACTIVIDAD">Actividad</option> : null}
                                  <option value="EVALUACION">Evaluación</option>
                                </select>
                              </label>
                              <label className="field-label">URL<input className="text-input" name="url" type="url" defaultValue={recurso.url ?? ""} /></label>
                              <label className="field-label">Orden<input className="text-input" name="orden" type="number" min="1" defaultValue={recurso.orden} /></label>
                              <label className="field-label field-span">Descripción<textarea className="text-area" name="descripcion" defaultValue={recurso.descripcion ?? ""} /></label>
                              <label className="field-label field-span">Texto de la página (solo para Página de contenido)<textarea className="text-area content-page-input" name="contenido" defaultValue={recurso.contenido ?? ""} /></label>
                              {campoVisibilidad(recurso.visibilidad)}
                              <button className="button button-outline button-small" type="submit">Guardar cambios</button>
                            </form>
                          </details>
                        ) : recurso.tipo === "ACTIVIDAD" && !actividad ? (
                          <p className="muted activity-note">Esta actividad existente todavía no tiene una consigna configurable.</p>
                        ) : null}

                        {permisos.eliminarRecurso ? (
                          <ConfirmarEliminacion
                            action={eliminarRecursoAction}
                            id={recurso.id}
                            mensaje={`¿Desactivar el recurso «${recurso.nombre}»?`}
                          />
                        ) : null}

                        {actividad ? (
                          <div className="activity-area">
                            <p className="activity-type-label">
                              {tiposActividad.find(([valor]) => valor === actividad.tipo)?.[1] ?? "Actividad"}
                            </p>
                            {permisos.entregarActividad ? (
                              miEntrega ? (
                                <p className="activity-result" role="status">
                                  Estado: <strong>{miEntrega.estado === "RESUELTA" ? "Resuelta" : "Entregada, pendiente de corrección"}</strong>
                                  {miEntrega.nota !== null ? ` · Nota: ${nota(miEntrega.nota)}/10` : ""}
                                </p>
                              ) : (
                                <form action={entregarActividadAction} className="activity-answer-form form-stack">
                                  <input type="hidden" name="actividadId" value={actividad.id} />
                                  {actividad.tipo === "OPCION_MULTIPLE" ? (
                                    <fieldset className="activity-options">
                                      <legend>Elegí una opción</legend>
                                      {opciones.map((opcion) => (
                                        <label key={opcion.id}>
                                          <input type="radio" name="respuesta" value={opcion.id} required />
                                          {opcion.texto}
                                        </label>
                                      ))}
                                    </fieldset>
                                  ) : actividad.tipo === "VERDADERO_FALSO" ? (
                                    <fieldset className="activity-options">
                                      <legend>Elegí una respuesta</legend>
                                      <label><input type="radio" name="respuesta" value="true" required /> Verdadero</label>
                                      <label><input type="radio" name="respuesta" value="false" required /> Falso</label>
                                    </fieldset>
                                  ) : (
                                    <label className="field-label">Tu respuesta<textarea className="text-area" name="respuesta" required maxLength={10000} /></label>
                                  )}
                                  <button className="button button-primary button-small" type="submit">Entregar actividad</button>
                                </form>
                              )
                            ) : null}

                            {permisos.corregirActividad ? (
                              <div className="delivery-list">
                                {entregas.map((entrega) => (
                                  <div className="delivery-item" key={entrega.id}>
                                    <div>
                                      <strong>{entrega.usuario.nombre} {entrega.usuario.apellido}</strong>
                                      <p>{entrega.respuesta}</p>
                                      {entrega.estado === "RESUELTA" ? <span className="muted">Nota: {nota(entrega.nota)}/10</span> : null}
                                    </div>
                                    {entrega.estado === "ENTREGADA" && actividad.tipo === "RESPUESTA_ABIERTA" ? (
                                      <form action={corregirActividadAction} className="grade-form">
                                        <input type="hidden" name="entregaId" value={entrega.id} />
                                        <label className="field-label">Nota (0 a 10)<input className="text-input" name="nota" type="number" min="0" max="10" step="0.01" required /></label>
                                        <button className="button button-primary button-small" type="submit">Corregir</button>
                                      </form>
                                    ) : null}
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        ) : null}

                        {contenedor ? (
                          <div className="activity-container">
                            {recurso.hijos.length ? (
                              recurso.hijos.map((hijo) => {
                                const entregasHijo = hijo.actividad?.entregas ?? [];
                                const miEntregaHijo = entregasHijo.find((entrega) => entrega.usuarioId === usuario.id);
                                const opcionesHijo = opcionesDe(hijo.actividad?.opciones);
                                return (
                                  <article className="nested-activity" key={hijo.id}>
                                    <div className="resource-row resource-row-main">
                                      <div>
                                        <strong>{hijo.nombre}</strong>
                                        {hijo.descripcion ? <span className="resource-description">{hijo.descripcion}</span> : null}
                                      </div>
                                      <span className="resource-type">Actividad{!hijo.visibilidad ? " · Oculta" : ""}</span>
                                    </div>
                                    {hijo.actividad ? (
                                      <div className="activity-area">
                                        <p className="activity-type-label">{tiposActividad.find(([valor]) => valor === hijo.actividad?.tipo)?.[1] ?? "Actividad"}</p>
                                        {permisos.modificarRecurso ? (
                                          <details className="content-edit-details">
                                            <summary>Editar actividad</summary>
                                            {formularioActividad({
                                              contenedorId: recurso.id,
                                              action: modificarActividadAction,
                                              recurso: {
                                                id: hijo.id,
                                                nombre: hijo.nombre,
                                                descripcion: hijo.descripcion,
                                                orden: hijo.orden,
                                                visibilidad: hijo.visibilidad,
                                                actividad: {
                                                  tipo: hijo.actividad.tipo,
                                                  opciones: hijo.actividad.opciones,
                                                  respuestaCorrecta: hijo.actividad.respuestaCorrecta,
                                                },
                                              },
                                            })}
                                          </details>
                                        ) : null}
                                        {permisos.entregarActividad ? (
                                          miEntregaHijo ? (
                                            <p className="activity-result" role="status">
                                              Estado: <strong>{miEntregaHijo.estado === "RESUELTA" ? "Resuelta" : "Entregada, pendiente de corrección"}</strong>
                                              {miEntregaHijo.nota !== null ? ` · Nota: ${nota(miEntregaHijo.nota)}/10` : ""}
                                            </p>
                                          ) : (
                                            <form action={entregarActividadAction} className="activity-answer-form form-stack">
                                              <input type="hidden" name="actividadId" value={hijo.actividad.id} />
                                              {hijo.actividad.tipo === "OPCION_MULTIPLE" ? (
                                                <fieldset className="activity-options">
                                                  <legend>Elegí una opción</legend>
                                                  {opcionesHijo.map((opcion) => <label key={opcion.id}><input type="radio" name="respuesta" value={opcion.id} required />{opcion.texto}</label>)}
                                                </fieldset>
                                              ) : hijo.actividad.tipo === "VERDADERO_FALSO" ? (
                                                <fieldset className="activity-options">
                                                  <legend>Elegí una respuesta</legend>
                                                  <label><input type="radio" name="respuesta" value="true" required /> Verdadero</label>
                                                  <label><input type="radio" name="respuesta" value="false" required /> Falso</label>
                                                </fieldset>
                                              ) : (
                                                <label className="field-label">Tu respuesta<textarea className="text-area" name="respuesta" required maxLength={10000} /></label>
                                              )}
                                              <button className="button button-primary button-small" type="submit">Entregar actividad</button>
                                            </form>
                                          )
                                        ) : null}
                                        {permisos.corregirActividad ? (
                                          <div className="delivery-list">
                                            {entregasHijo.map((entrega) => (
                                              <div className="delivery-item" key={entrega.id}>
                                                <div><strong>{entrega.usuario.nombre} {entrega.usuario.apellido}</strong><p>{entrega.respuesta}</p></div>
                                                {entrega.estado === "RESUELTA" ? <span className="muted">Nota: {nota(entrega.nota)}/10</span> : hijo.actividad?.tipo === "RESPUESTA_ABIERTA" ? (
                                                  <form action={corregirActividadAction} className="grade-form">
                                                    <input type="hidden" name="entregaId" value={entrega.id} />
                                                    <label className="field-label">Nota (0 a 10)<input className="text-input" name="nota" type="number" min="0" max="10" step="0.01" required /></label>
                                                    <button className="button button-primary button-small" type="submit">Corregir</button>
                                                  </form>
                                                ) : null}
                                              </div>
                                            ))}
                                          </div>
                                        ) : null}
                                      </div>
                                    ) : <p className="muted activity-note">Esta actividad existente todavía no tiene una configuración de pregunta.</p>}
                                    {permisos.eliminarRecurso ? <ConfirmarEliminacion action={eliminarRecursoAction} id={hijo.id} mensaje={`¿Desactivar la actividad «${hijo.nombre}»?`} /> : null}
                                  </article>
                                );
                              })
                            ) : <p className="muted activity-note">Esta {recurso.tipo === "LECCION" ? "lección" : "evaluación"} todavía no tiene actividades.</p>}
                            {permisos.crearRecurso ? (
                              <details className="content-create-details">
                                <summary>Agregar actividad</summary>
                                {formularioActividad({ contenedorId: recurso.id, action: crearActividadAction })}
                              </details>
                            ) : null}
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              ) : <p className="muted">Esta sección todavía no tiene recursos.</p>}
            </section>
          ))}
        </div>
      ) : (
        <div className="empty-state"><strong>El contenido está en preparación</strong><p>Las secciones y recursos van a aparecer acá.</p></div>
      )}
    </main>
  );
}
