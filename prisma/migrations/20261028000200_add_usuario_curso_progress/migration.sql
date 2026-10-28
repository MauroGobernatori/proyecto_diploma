-- CreateEnum
CREATE TYPE "EstadoUsuarioCurso" AS ENUM ('EN_CURSO', 'FINALIZADO');

-- CreateTable
CREATE TABLE "Usuarios_Cursos" (
    "usuarioId" TEXT NOT NULL,
    "cursoId" TEXT NOT NULL,
    "estado" "EstadoUsuarioCurso" NOT NULL DEFAULT 'EN_CURSO',
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaFinalizacion" TIMESTAMP(3),

    CONSTRAINT "Usuarios_Cursos_pkey" PRIMARY KEY ("usuarioId","cursoId")
);

-- AddForeignKey
ALTER TABLE "Usuarios_Cursos" ADD CONSTRAINT "Usuarios_Cursos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuarios_Cursos" ADD CONSTRAINT "Usuarios_Cursos_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE CASCADE ON UPDATE CASCADE;
