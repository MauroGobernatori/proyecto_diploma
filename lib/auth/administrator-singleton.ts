import { prisma } from "../db/client";

/** Centraliza las consultas a la asignación única de Administrador de Plataforma. */
export class AdministradorSingleton {
  private static instancia: AdministradorSingleton | undefined;

  private constructor() {}

  public esAdministradorEnAsignaciones(
    asignaciones: readonly { administradorUnico: boolean }[]
  ): boolean {
    return asignaciones.some((asignacion) => asignacion.administradorUnico);
  }

  public static obtenerInstancia(): AdministradorSingleton {
    if (!AdministradorSingleton.instancia) {
      AdministradorSingleton.instancia = new AdministradorSingleton();
    }
    return AdministradorSingleton.instancia;
  }

  public async esAdministrador(usuarioId: string): Promise<boolean> {
    const asignacion = await prisma.usuarioRol.findFirst({
      where: { usuarioId, administradorUnico: true },
      select: { id: true },
    });
    return asignacion !== null;
  }
}

export const administradorSingleton = AdministradorSingleton.obtenerInstancia();
