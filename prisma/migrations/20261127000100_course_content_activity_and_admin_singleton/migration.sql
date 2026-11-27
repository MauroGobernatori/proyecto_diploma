-- The Singleton service centralizes administrator checks; PostgreSQL enforces
-- the single global assignment even when application instances run concurrently.
DO $$
DECLARE
  asignaciones_admin INTEGER;
  asignaciones_admin_fuera_de_plataforma INTEGER;
BEGIN
  SELECT COUNT(*)
    INTO asignaciones_admin
    FROM "UsuarioRol" ur
    JOIN "Rol" r ON r."id" = ur."rolId"
   WHERE r."nombre" = 'Administrador'
     AND r."nivel" = 'PLATAFORMA'
     AND ur."cursoId" IS NULL
     AND ur."grupoId" IS NULL;

  IF asignaciones_admin > 1 THEN
    RAISE EXCEPTION 'Hay % asignaciones globales de Administrador. Resuélvelas manualmente antes de aplicar esta migración.', asignaciones_admin;
  END IF;

  SELECT COUNT(*)
    INTO asignaciones_admin_fuera_de_plataforma
    FROM "UsuarioRol" ur
    JOIN "Rol" r ON r."id" = ur."rolId"
   WHERE r."nombre" = 'Administrador'
     AND (r."nivel" <> 'PLATAFORMA' OR ur."cursoId" IS NOT NULL OR ur."grupoId" IS NOT NULL);

  IF asignaciones_admin_fuera_de_plataforma > 0 THEN
    RAISE EXCEPTION 'Hay asignaciones de Administrador fuera del ámbito global de Plataforma. Resuélvelas manualmente antes de aplicar esta migración.';
  END IF;
END $$;

ALTER TYPE "TipoRecurso" ADD VALUE 'LECCION' BEFORE 'ACTIVIDAD';
CREATE TYPE "TipoActividad" AS ENUM ('OPCION_MULTIPLE', 'VERDADERO_FALSO', 'RESPUESTA_ABIERTA');
CREATE TYPE "EstadoEntregaActividad" AS ENUM ('ENTREGADA', 'RESUELTA');

ALTER TABLE "UsuarioRol" ADD COLUMN "administradorUnico" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Recurso" ADD COLUMN "visibilidad" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Recurso" ADD COLUMN "padreId" TEXT;

UPDATE "UsuarioRol" ur
   SET "administradorUnico" = true
  FROM "Rol" r
 WHERE r."id" = ur."rolId"
   AND r."nombre" = 'Administrador'
   AND r."nivel" = 'PLATAFORMA'
   AND ur."cursoId" IS NULL
   AND ur."grupoId" IS NULL;

CREATE UNIQUE INDEX "UsuarioRol_administradorUnico_key"
    ON "UsuarioRol" ("administradorUnico")
 WHERE "administradorUnico" = true;

CREATE FUNCTION "marcar_administrador_plataforma_unico"()
RETURNS TRIGGER AS $$
DECLARE
  es_rol_admin BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM "Rol" r
     WHERE r."id" = NEW."rolId"
       AND r."nombre" = 'Administrador'
       AND r."nivel" = 'PLATAFORMA'
  ) INTO es_rol_admin;

  IF es_rol_admin AND (NEW."cursoId" IS NOT NULL OR NEW."grupoId" IS NOT NULL) THEN
    RAISE EXCEPTION 'El rol Administrador solo puede asignarse en el ámbito global de Plataforma.';
  END IF;

  NEW."administradorUnico" := es_rol_admin;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "UsuarioRol_administradorUnico_trigger"
BEFORE INSERT OR UPDATE ON "UsuarioRol"
FOR EACH ROW EXECUTE FUNCTION "marcar_administrador_plataforma_unico"();

CREATE TABLE "Actividad" (
    "id" TEXT NOT NULL,
    "recursoId" TEXT NOT NULL,
    "tipo" "TipoActividad" NOT NULL,
    "opciones" JSONB,
    "respuestaCorrecta" TEXT,
    CONSTRAINT "Actividad_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ActividadEntrega" (
    "id" TEXT NOT NULL,
    "actividadId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "respuesta" TEXT NOT NULL,
    "estado" "EstadoEntregaActividad" NOT NULL DEFAULT 'ENTREGADA',
    "nota" DECIMAL(4,2),
    "fechaEntrega" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaCorreccion" TIMESTAMP(3),
    "corregidaPorId" TEXT,
    CONSTRAINT "ActividadEntrega_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Actividad_recursoId_key" ON "Actividad"("recursoId");
CREATE UNIQUE INDEX "ActividadEntrega_actividadId_usuarioId_key" ON "ActividadEntrega"("actividadId", "usuarioId");
CREATE INDEX "ActividadEntrega_usuarioId_estado_idx" ON "ActividadEntrega"("usuarioId", "estado");
CREATE INDEX "Recurso_padreId_idx" ON "Recurso"("padreId");
ALTER TABLE "ActividadEntrega" ADD CONSTRAINT "ActividadEntrega_nota_rango_check"
    CHECK ("nota" IS NULL OR ("nota" >= 0 AND "nota" <= 10));
ALTER TABLE "ActividadEntrega" ADD CONSTRAINT "ActividadEntrega_resuelta_con_nota_check"
    CHECK ("estado" <> 'RESUELTA' OR "nota" IS NOT NULL);
ALTER TABLE "ActividadEntrega" ADD CONSTRAINT "ActividadEntrega_entregada_sin_nota_check"
    CHECK ("estado" <> 'ENTREGADA' OR "nota" IS NULL);

ALTER TABLE "Recurso" ADD CONSTRAINT "Recurso_padreId_fkey"
    FOREIGN KEY ("padreId") REFERENCES "Recurso"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Actividad" ADD CONSTRAINT "Actividad_recursoId_fkey"
    FOREIGN KEY ("recursoId") REFERENCES "Recurso"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ActividadEntrega" ADD CONSTRAINT "ActividadEntrega_actividadId_fkey"
    FOREIGN KEY ("actividadId") REFERENCES "Actividad"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ActividadEntrega" ADD CONSTRAINT "ActividadEntrega_usuarioId_fkey"
    FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ActividadEntrega" ADD CONSTRAINT "ActividadEntrega_corregidaPorId_fkey"
    FOREIGN KEY ("corregidaPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "Permiso" ("id", "nombre", "clave", "categoria") VALUES
  ('perm-seccion-crear-v1', 'Crear sección', 'seccion:crear', 'Contenido de cursos'),
  ('perm-seccion-modificar-v1', 'Modificar sección', 'seccion:modificar', 'Contenido de cursos'),
  ('perm-seccion-eliminar-v1', 'Eliminar sección', 'seccion:eliminar', 'Contenido de cursos'),
  ('perm-recurso-crear-v1', 'Crear recurso', 'recurso:crear', 'Contenido de cursos'),
  ('perm-recurso-modificar-v1', 'Modificar recurso', 'recurso:modificar', 'Contenido de cursos'),
  ('perm-recurso-eliminar-v1', 'Eliminar recurso', 'recurso:eliminar', 'Contenido de cursos'),
  ('perm-recurso-oculto-ver-v1', 'Ver recursos ocultos', 'recurso:oculto:ver', 'Contenido de cursos'),
  ('perm-reporte-curso-descargar-v1', 'Descargar reporte de curso', 'reporte:curso:descargar', 'Reportes'),
  ('perm-actividad-entregar-v1', 'Entregar actividad', 'actividad:entregar', 'Actividades'),
  ('perm-actividad-corregir-v1', 'Corregir actividad', 'actividad:corregir', 'Actividades')
ON CONFLICT ("clave") DO NOTHING;

INSERT INTO "RolPermiso" ("rolId", "permisoId")
SELECT r."id", p."id"
  FROM "Rol" r
  JOIN "Permiso" p ON p."clave" IN (
    'seccion:crear', 'seccion:modificar', 'seccion:eliminar',
    'recurso:crear', 'recurso:modificar', 'recurso:eliminar',
    'recurso:oculto:ver', 'reporte:curso:descargar', 'actividad:corregir'
  )
 WHERE (r."nombre" = 'Gestor' AND r."nivel" = 'PLATAFORMA')
    OR (r."nombre" = 'Docente' AND r."nivel" = 'CURSO')
ON CONFLICT ("rolId", "permisoId") DO NOTHING;

INSERT INTO "RolPermiso" ("rolId", "permisoId")
SELECT r."id", p."id"
  FROM "Rol" r
  JOIN "Permiso" p ON p."clave" = 'actividad:entregar'
 WHERE r."nombre" = 'Alumno'
   AND r."nivel" = 'CURSO'
ON CONFLICT ("rolId", "permisoId") DO NOTHING;
