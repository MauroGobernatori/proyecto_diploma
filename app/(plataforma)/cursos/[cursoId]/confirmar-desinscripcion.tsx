"use client";

export function ConfirmarDesinscripcion({
  cursoId,
  usuarioId,
  action,
}: {
  cursoId: string;
  usuarioId: string;
  action: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <form action={action} onSubmit={(event) => {
      if (!window.confirm("El alumno dejará de estar inscripto. Sus entregas y notas se conservarán como historial. ¿Continuar?")) event.preventDefault();
    }}>
      <input name="cursoId" type="hidden" value={cursoId} />
      <input name="usuarioId" type="hidden" value={usuarioId} />
      <button className="button button-danger button-small" type="submit">Desinscribir</button>
    </form>
  );
}
