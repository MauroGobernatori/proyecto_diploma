import Link from "next/link";
import { auth } from "@/auth";

const highlights = [
  { number: "01", title: "Cursos claros", text: "Encontrá el contenido y los recursos de cada curso." },
  { number: "02", title: "Progreso visible", text: "Retomá tu aprendizaje y consultá tus avances." },
  { number: "03", title: "Logros propios", text: "Revisá las recompensas que fuiste obteniendo." },
];

export default async function Home() {
  const sesion = await auth();

  return (
    <main className="landing">
      <header className="public-header">
        <Link className="brand" href="/" aria-label="PWGA, inicio">
          <span className="brand-mark">P</span>
          <span>PWGA</span>
        </Link>
        <nav aria-label="Navegación principal" className="public-nav">
          <a href="#plataforma">La plataforma</a>
          <Link className="button button-outline" href={sesion?.user ? "/panel" : "/login"}>
            {sesion?.user ? "Ir a mi espacio" : "Iniciar sesión"}
          </Link>
        </nav>
      </header>

      <section className="hero" id="plataforma">
        <div className="hero-copy">
          <p className="eyebrow">Hunko Education · aprendizaje online</p>
          <h1>Aprender también es avanzar.</h1>
          <p className="hero-lead">
            Un espacio para encontrar tus cursos, seguir tu recorrido y reconocer
            cada logro.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href={sesion?.user ? "/panel" : "/login"}>
              {sesion?.user ? "Continuar aprendiendo" : "Entrar a la plataforma"}
              <span aria-hidden="true">↗</span>
            </Link>
            <a className="text-link" href="#funciones">Conocer más</a>
          </div>
          <div className="hero-footnote">
            <span className="status-dot" />
            Cursos y progreso, en un solo lugar
          </div>
        </div>
        <div aria-hidden="true" className="hero-visual">
          <div className="visual-orbit orbit-one" />
          <div className="visual-orbit orbit-two" />
          <div className="visual-card visual-card-main">
            <span className="visual-label">TU RECORRIDO</span>
            <span className="visual-progress">68%</span>
            <div className="progress-track"><span style={{ width: "68%" }} /></div>
            <span className="visual-subtitle">Un paso a la vez</span>
          </div>
          <div className="visual-card visual-card-side">
            <span className="badge-star">✦</span>
            <span className="visual-label">NUEVO LOGRO</span>
            <strong>Buen comienzo</strong>
            <span className="visual-subtitle">Seguí así</span>
          </div>
          <span className="visual-spark spark-one">✳</span>
          <span className="visual-spark spark-two">✦</span>
        </div>
      </section>

      <section className="highlights" id="funciones">
        <div className="section-heading">
          <p className="eyebrow">Todo tu aprendizaje</p>
          <h2>Una plataforma para acompañar tu camino.</h2>
        </div>
        <div className="highlight-grid">
          {highlights.map((item) => (
            <article className="highlight-card" key={item.number}>
              <span className="highlight-number">{item.number}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="public-footer">
        <Link className="brand brand-small" href="/">
          <span className="brand-mark">P</span><span>PWGA</span>
        </Link>
        <span>Tu próximo paso empieza acá.</span>
        <Link href="/login">Acceder a mi cuenta <span aria-hidden="true">↗</span></Link>
      </footer>
    </main>
  );
}
