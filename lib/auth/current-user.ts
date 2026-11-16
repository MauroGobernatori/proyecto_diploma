import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/client";

export async function obtenerUsuarioActual() {
  const sesion = await auth();
  if (!sesion?.user?.id) redirect("/login");

  const usuario = await prisma.usuario.findUnique({
    where: { id: sesion.user.id },
    select: {
      id: true,
      usuario: true,
      nombre: true,
      apellido: true,
      email: true,
      activo: true,
    },
  });

  if (!usuario?.activo) redirect("/login?estado=cuenta-inactiva");
  return usuario;
}
