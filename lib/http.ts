import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "./errores";

export function respuestaExitosa<T>(datos: T, mensaje?: string, status = 200) {
  return NextResponse.json(
    {
      ok: true,
      mensaje,
      data: datos,
    },
    { status }
  );
}

export function manejarErrorApi(error: unknown) {
  console.error("API Error Log:", error);

  if (error instanceof ZodError) {
    const erroresFormateados = error.flatten().fieldErrors;
    return NextResponse.json(
      {
        ok: false,
        error: "Error de validación de datos",
        detalles: erroresFormateados,
      },
      { status: 400 }
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
      },
      { status: error.statusCode }
    );
  }

  return NextResponse.json(
    {
      ok: false,
      error: "Error interno del servidor",
    },
    { status: 500 }
  );
}