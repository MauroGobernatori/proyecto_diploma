"use client";

export function ConfirmarBajaCurso({
  id,
  action,
}: {
  id: string;
  action: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <form action={action} onSubmit={(event) => {
      if (!window.confirm("El curso dejará de estar disponible en el catálogo. Su contenido e historial se conservarán. ¿Querés continuar?")) event.preventDefault();
    }}>
      <input name="id" type="hidden" value={id} />
      <button className="button button-danger button-small" type="submit">Dar de baja</button>
    </form>
  );
}
