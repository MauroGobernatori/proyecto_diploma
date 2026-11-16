import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/client";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const [sesion, parametros] = await Promise.all([auth(), searchParams]);
  if (sesion?.user?.id) {
    const usuario = await prisma.usuario.findFirst({
      where: { id: sesion.user.id, activo: true },
      select: { id: true },
    });
    if (usuario) redirect("/panel");
  }

  const cuentaInactiva = parametros.estado === "cuenta-inactiva";

  return (
    <main className="login-page">
      <Link className="brand brand-dark" href="/" aria-label="PWGA, inicio">
        <span className="brand-mark">P</span>
        <span>PWGA</span>
      </Link>
      <section className="login-card">
        <p className="eyebrow">Plataforma de aprendizaje</p>
        <h1>Qué bueno verte de nuevo</h1>
        <p className="muted">
          Ingresá con las credenciales de tu cuenta para continuar.
        </p>
        {cuentaInactiva ? (
          <p className="form-error" role="alert">
            Esta cuenta está inactiva. Contactá a una persona administradora.
          </p>
        ) : null}
        <LoginForm />
        <p className="login-note">
          ¿Necesitás una cuenta? Pedile al equipo de gestión que te dé de alta.
        </p>
      </section>
      <p className="login-footer">Aprender, avanzar y crecer.</p>
    </main>
  );
}
