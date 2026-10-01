export class AppError extends Error {
  public readonly statusCode: number;

  constructor(mensaje: string, statusCode = 400) {
    super(mensaje);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(mensaje = "Recurso no encontrado") {
    super(mensaje, 404);
  }
}

export class BadRequestError extends AppError {
  constructor(mensaje = "Petición incorrecta") {
    super(mensaje, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(mensaje = "No autenticado") {
    super(mensaje, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(mensaje = "No tiene permisos para realizar esta acción") {
    super(mensaje, 403);
  }
}

export class ValidationError extends AppError {
  public readonly errores?: Record<string, string[]>;

  constructor(mensaje = "Error de validación", errores?: Record<string, string[]>) {
    super(mensaje, 400);
    this.errores = errores;
  }
}