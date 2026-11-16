import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "@/lib/schemas/auth";
import { prisma } from "@/lib/db/client";
import { verifyPassword } from "@/lib/security/passwords";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        usuarioOEmail: {
          label: "Usuario o email",
          type: "text",
          placeholder: "tu usuario o email",
        },
        contrasenia: {
          label: "Contraseña",
          type: "password",
        },
      },
      async authorize(credentials) {
        const validacion = loginSchema.safeParse(credentials);
        if (!validacion.success) return null;

        const identificador = validacion.data.usuarioOEmail;
        const usuario = await prisma.usuario.findFirst({
          where: {
            activo: true,
            OR: [
              { usuario: identificador },
              {
                email: {
                  equals: identificador.toLowerCase(),
                  mode: "insensitive",
                },
              },
            ],
          },
          select: {
            id: true,
            usuario: true,
            nombre: true,
            apellido: true,
            email: true,
            contraseniaHash: true,
          },
        });

        if (
          !usuario ||
          !(await verifyPassword(
            usuario.contraseniaHash,
            validacion.data.contrasenia
          ))
        ) {
          return null;
        }

        return {
          id: usuario.id,
          name: `${usuario.nombre} ${usuario.apellido}`.trim(),
          email: usuario.email,
        };
      },
    }),
  ],
  pages: { signIn: "/login" },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8,
  },
  callbacks: {
    session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
