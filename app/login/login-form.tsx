"use client";

import { useActionState } from "react";
import { iniciarSesion } from "./actions";

export function LoginForm() {
  const [estado, accion, pendiente] = useActionState(iniciarSesion, undefined);

  return (
    <form action={accion} className="form-stack">
      <label className="field-label" htmlFor="usuarioOEmail">
        Usuario o email
        <input
          autoComplete="username"
          className="text-input"
          id="usuarioOEmail"
          name="usuarioOEmail"
          placeholder="nombre de usuario o correo"
          required
        />
      </label>
      <label className="field-label" htmlFor="contrasenia">
        Contraseña
        <input
          autoComplete="current-password"
          className="text-input"
          id="contrasenia"
          name="contrasenia"
          type="password"
          required
        />
      </label>
      {estado?.error ? (
        <p aria-live="polite" className="form-error" role="alert">
          {estado.error}
        </p>
      ) : null}
      <button className="button button-primary button-wide" disabled={pendiente}>
        {pendiente ? "Ingresando…" : "Iniciar sesión"}
      </button>
    </form>
  );
}
