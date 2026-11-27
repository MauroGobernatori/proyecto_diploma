"use client";

type Action = (formData: FormData) => void | Promise<void>;

export function ConfirmarEliminacion({
  action,
  id,
  mensaje,
  etiqueta = "Eliminar",
}: {
  action: Action;
  id: string;
  mensaje: string;
  etiqueta?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(evento) => {
        if (!window.confirm(mensaje)) evento.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className="button button-danger button-small" type="submit">
        {etiqueta}
      </button>
    </form>
  );
}
