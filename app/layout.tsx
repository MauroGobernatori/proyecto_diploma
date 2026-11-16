import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "PWGA | Plataforma de aprendizaje",
    template: "%s | PWGA",
  },
  description:
    "Organizá tus cursos, seguí tu progreso y consultá tus recompensas.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
