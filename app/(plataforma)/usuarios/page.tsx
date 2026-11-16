import { notFound } from "next/navigation";
import { obtenerUsuarios } from "@/lib/db/usuarios";
import { obtenerUsuarioActual } from "@/lib/auth/current-user";
import { permisosDeUsuarios } from "@/lib/auth/permissions";
import {
  actualizarUsuarioAction,
  crearUsuarioAction,
  desactivarUsuarioAction,
} from "./actions";

const avisos: Record<string, string> = {
  creado: "La cuenta se creó y recibió el rol General.",
  actualizado: "Los datos se actualizaron.",
  desactivado: "La cuenta se dio de baja.",
  duplicado: "Ese nombre de usuario o email ya está en uso.",
  "datos-invalidos": "Revisá los datos ingresados e intentá nuevamente.",
  "no-puede-desactivarse": "No podés dar de baja tu propia cuenta.",
  "administrador-protegido": "No se puede dar de baja la cuenta Administrador de la plataforma.",
};

export const metadata = { title: "Gestión de usuarios" };

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ resultado?: string }>;
}) {
  const usuarioActual = await obtenerUsuarioActual();
  const permisos = await permisosDeUsuarios(usuarioActual.id);
  if (!permisos.crear && !permisos.modificar && !permisos.eliminar) notFound();

  const [usuarios, parametros] = await Promise.all([obtenerUsuarios(), searchParams]);
  const aviso = parametros.resultado ? avisos[parametros.resultado] : undefined;

  return (
    <main className="content-container">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Administración de plataforma</p>
          <h1>Usuarios</h1>
          <p>Creá y mantené cuentas. Las bajas conservan el historial asociado.</p>
        </div>
        <span className="tag">{usuarios.length} activos</span>
      </div>

      {aviso ? <p className={parametros.resultado === "datos-invalidos" || parametros.resultado === "duplicado" || parametros.resultado === "no-puede-desactivarse" || parametros.resultado === "administrador-protegido" ? "form-error" : "notice"} role="status">{aviso}</p> : null}

      <div className="user-grid">
        {permisos.crear ? (
          <section className="surface-card user-form-card">
            <h2>Crear cuenta</h2>
            <form action={crearUsuarioAction} className="form-stack">
              <label className="field-label">Nombre de usuario<input className="text-input" name="usuario" autoComplete="off" required minLength={3} maxLength={30} /></label>
              <label className="field-label">Nombre<input className="text-input" name="nombre" required /></label>
              <label className="field-label">Apellido<input className="text-input" name="apellido" required /></label>
              <label className="field-label">Email<input className="text-input" name="email" type="email" required /></label>
              <label className="field-label">Contraseña inicial<input className="text-input" name="contrasenia" type="password" autoComplete="new-password" minLength={12} maxLength={128} required /></label>
              <label className="field-label">Empresa (opcional)<input className="text-input" name="empresa" /></label>
              <label className="field-label">Institución (opcional)<input className="text-input" name="institucion" /></label>
              <label className="field-label">DNI (opcional)<input className="text-input" name="dni" inputMode="numeric" /></label>
              <button className="button button-primary" type="submit">Crear usuario</button>
            </form>
          </section>
        ) : null}

        <section className="surface-card user-list-card">
          <h2>Cuentas activas</h2>
          {usuarios.length ? (
            <div className="user-list">
              {usuarios.map((usuario) => (
                <article className="user-item" key={usuario.id}>
                  <div className="user-item-head">
                    <div><strong>{usuario.nombre} {usuario.apellido}</strong><span>@{usuario.usuario} · {usuario.email}</span></div>
                    <span className="tag">{usuario.roles.map(({ rol }) => rol.nombre).join(", ") || "Sin rol"}</span>
                  </div>
                  {permisos.modificar ? (
                    <form action={actualizarUsuarioAction} className="user-item-form">
                      <input name="id" type="hidden" value={usuario.id} />
                      <label className="visually-hidden" htmlFor={`nombre-${usuario.id}`}>Nombre</label>
                      <input className="text-input" id={`nombre-${usuario.id}`} name="nombre" defaultValue={usuario.nombre} required />
                      <label className="visually-hidden" htmlFor={`apellido-${usuario.id}`}>Apellido</label>
                      <input className="text-input" id={`apellido-${usuario.id}`} name="apellido" defaultValue={usuario.apellido} required />
                      <label className="visually-hidden" htmlFor={`email-${usuario.id}`}>Email</label>
                      <input className="text-input" id={`email-${usuario.id}`} name="email" type="email" defaultValue={usuario.email} required />
                      <label className="visually-hidden" htmlFor={`empresa-${usuario.id}`}>Empresa</label>
                      <input className="text-input" id={`empresa-${usuario.id}`} name="empresa" defaultValue={usuario.empresa ?? ""} placeholder="Empresa" />
                      <button className="button button-outline button-small" type="submit">Guardar cambios</button>
                    </form>
                  ) : null}
                  {permisos.eliminar && usuario.id !== usuarioActual.id ? (
                    <form action={desactivarUsuarioAction}>
                      <input name="id" type="hidden" value={usuario.id} />
                      <button className="button button-danger button-small" type="submit">Dar de baja</button>
                    </form>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state"><strong>No hay usuarios activos</strong><p>Las cuentas nuevas van a aparecer en esta lista.</p></div>
          )}
        </section>
      </div>
    </main>
  );
}
