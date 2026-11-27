import { BadRequestError } from "../errores";

export type TipoCalificacion = "OPCION_MULTIPLE" | "VERDADERO_FALSO" | "RESPUESTA_ABIERTA";
export type EstadoCalificacion = "ENTREGADA" | "RESUELTA";

export function calificarRespuestaActividad(
  tipo: TipoCalificacion,
  opciones: unknown,
  respuestaCorrecta: string | null,
  respuesta: string
): { estado: EstadoCalificacion; nota: number | null } {
  if (tipo === "OPCION_MULTIPLE") {
    const opcionValida = Array.isArray(opciones) && opciones.some(
      (opcion) => typeof opcion === "object" && opcion !== null &&
        "id" in opcion && opcion.id === respuesta
    );
    if (!opcionValida) throw new BadRequestError("La opción elegida no pertenece a esta actividad");
    return { estado: "RESUELTA", nota: respuesta === respuestaCorrecta ? 10 : 0 };
  }

  if (tipo === "VERDADERO_FALSO") {
    if (respuesta !== "true" && respuesta !== "false") {
      throw new BadRequestError("La respuesta debe ser verdadero o falso");
    }
    return { estado: "RESUELTA", nota: respuesta === respuestaCorrecta ? 10 : 0 };
  }

  return { estado: "ENTREGADA", nota: null };
}
