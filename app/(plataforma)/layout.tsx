import Link from "next/link";
import type { ReactNode } from "react";
import { cerrarSesion } from "@/app/logout-action";
import { obtenerUsuarioActual } from "@/lib/auth/current-user";
import { puedeGestionarUsuarios } from "@/lib/auth/permissions";

const enlaces = [
  { href: "/panel", icon: "⌂", label: "Resumen" },
  { href: "/cursos", icon: "▤", label: "Catálogo de cursos" },
  { href: "/mis-cursos", icon: "◷", label: "Mis cursos" },
  { href: "/recompensas", icon: "✦", label: "Recompensas" },
];

export default async function PlataformaLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const usuario = await obtenerUsuarioActual();
  const puedeVerUsuarios = await puedeGestionarUsuarios(usuario.id);
  const inicial = usuario.nombre.trim().slice(0, 1).toUpperCase() || "U";

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <Link className="brand" href="/panel" aria-label="PWGA, resumen">
          <span className="brand-mark">P</span>
          <span>PWGA</span>
        </Link>
        <p className="sidebar-label">Tu espacio</p>
        <nav aria-label="Navegación de la plataforma" className="side-nav">
          {enlaces.map((enlace) => (
            <Link className="side-link" href={enlace.href} key={enlace.href}>
              <span aria-hidden="true" className="side-icon">{enlace.icon}</span>
              <span className="side-text">{enlace.label}</span>
            </Link>
          ))}
          {puedeVerUsuarios ? (
            <Link className="side-link" href="/usuarios">
              <span aria-hidden="true" className="side-icon">♙</span>
              <span className="side-text">Usuarios</span>
            </Link>
          ) : null}
        </nav>
        <div className="sidebar-bottom">
          <div className="user-mini">
            <span aria-hidden="true" className="avatar">{inicial}</span>
            <div>
              <strong>{usuario.nombre} {usuario.apellido}</strong>
              <span>{usuario.email}</span>
            </div>
          </div>
          <form action={cerrarSesion}>
            <button className="logout-button" type="submit">Cerrar sesión ↗</button>
          </form>
        </div>
      </aside>
      <div className="app-main">
        <header className="app-header">
          <p>Plataforma Web de Gestión de Aprendizaje</p>
          <strong>Hola, {usuario.nombre}</strong>
        </header>
        {children}
      </div>
    </div>
  );
}
