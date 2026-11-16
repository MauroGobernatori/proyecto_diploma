import { obtenerUsuarioActual } from "@/lib/auth/current-user";
import { obtenerRecompensasObtenidasPorUsuario } from "@/lib/db/recompensas";

export const metadata = { title: "Mis recompensas" };

export default async function RecompensasPage() {
  const usuario = await obtenerUsuarioActual();
  const recompensas = await obtenerRecompensasObtenidasPorUsuario(usuario.id);

  return (
    <main className="content-container">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Cada logro cuenta</p>
          <h1>Mis recompensas</h1>
          <p>Un registro de los reconocimientos que obtuviste en tus cursos.</p>
        </div>
        <span className="tag">{recompensas.length} {recompensas.length === 1 ? "logro" : "logros"}</span>
      </div>
      {recompensas.length ? (
        <div className="reward-grid">
          {recompensas.map(({ id, recompensa, fechaObtencion }) => (
            <article className="reward-card" key={id}>
              <span className="tag tag-green">Recompensa obtenida</span>
              <h2>{recompensa.nombre}</h2>
              <p>{recompensa.descripcion}</p>
              <time className="reward-date" dateTime={fechaObtencion.toISOString()}>
                Obtenida el {fechaObtencion.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}
              </time>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state"><strong>Tus recompensas van a aparecer acá</strong><p>Cuando completes los requisitos de un curso, vas a poder consultar tus reconocimientos.</p></div>
      )}
    </main>
  );
}
