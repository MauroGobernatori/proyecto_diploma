# Revisión de arquitectura, requisitos y seguridad del backend

## Alcance

La revisión cubre la documentación (`README.md`, `docs/spec.md`, `specs/`), el modelo Prisma, migraciones, seed, validaciones, lógica de dominio, repositorios y pruebas existentes. El estado de la columna «Antes de esta rama» corresponde al código recibido. Durante esta tarea se aplicaron a la base configurada las migraciones `20261127000100_course_content_activity_and_admin_singleton` y `20261127000200_add_page_content_resource`.

## Evaluación general

El repositorio tiene una base de arquitectura razonable para una aplicación Next.js pequeña: esquema relacional centralizado en Prisma, validación de entradas con Zod, operaciones de persistencia en `lib/db/` y algunas reglas de dominio en `lib/`. La inscripción y evaluación de recompensas tienen pruebas unitarias y una transacción para finalizar cursos y otorgar recompensas.

El backend recibido estaba incompleto como aplicación: no tenía rutas HTTP de negocio, autenticación ni controles de autorización enlazados a esas operaciones. Varias funciones existían solo como consultas Prisma, por lo que no había una superficie utilizable por el frontend ni forma de comprobar seguridad de extremo a extremo. La capa `lib/http.ts` define formatos de respuesta, pero no había route handlers que la usaran.

## Cobertura de requisitos

| Área | Antes de esta rama | Estado en esta rama |
| --- | --- | --- |
| H1 — ABM de usuarios | Lectura, alta y actualización parciales en repositorio; sin baja ni interfaz/API. El alta no asignaba rol General. | Interfaz inicial con alta, edición de datos y baja lógica para permisos de Plataforma; alta guarda hash y asigna General. |
| H2 — Importar/exportar usuarios | No implementado. | Sigue pendiente. |
| H3 — Consulta y campos personalizados | Lectura de usuarios disponible; campos personalizados ausentes. | La consulta se incorpora a la pantalla de usuarios; campos personalizados siguen pendientes. |
| H4–H5 — Roles y permisos | Esquema y roles base en seed; no hay gestión completa de roles ni garantía del único Administrador. | La migración añade una restricción global para una única asignación Administrador y el control de permisos lo trata como superusuario. La administración de roles sigue pendiente. |
| H6 — Inscripción y progreso | Inscripción asociada a asignación de rol, estado y finalización individual implementados. | Se muestra el progreso; Administrador y Gestor pueden gestionar altas/bajas de Alumnos desde el curso con las restricciones de H6. La baja conserva entregas y notas. |
| H7/H13 — Cursos, secciones y recursos | Repositorios para cursos y operaciones de secciones/recursos; sin API ni interfaz. | Administrador y Gestor tienen ABM de cursos con baja lógica; el detalle incorpora ABM de secciones/recursos para Administrador, Gestor y Docente; incluye páginas de contenido; el Alumno solo ve contenido visible. |
| H14 — Actividades y notas | No había actividades configurables, entregas ni calificaciones. | Se agregan lecciones/evaluaciones con actividades objetivas y abiertas, una entrega por alumno, autocorrección 10/0 y corrección manual en escala 0–10. |
| H8–H9 — Recompensas y asociaciones | Consulta y alta parcial; no hay edición, baja ni gestión completa de asociaciones. | Se muestran recompensas obtenidas. Administración de recompensas queda pendiente. |
| H10 — Otorgamiento | Evaluación de reglas OR/AND y vigencia implementada al finalizar cursos. | Sin cambios funcionales en esta rama. |
| H11 — Historial de recompensas | Consulta por usuario disponible en repositorio. | Se muestra el historial filtrado por el usuario de sesión. |
| H12 — Frecuencia | Campo `otorgamientoMultiple` persistido y usado por la lógica de otorgamiento. | Sin cambios funcionales en esta rama. |
| Reportes | Solo existe el modelo de datos; no hay consultas ni generación. | Se genera desde el curso un libro Excel `.xlsx` con alumnos, progreso visible, notas por actividad y un gráfico de distribución de notas. |

La especificación general enumera más funcionalidades que las implementadas. Siguen pendientes la gestión de roles y grupos, la inscripción/finalización individual desde la interfaz, la administración de recompensas, la importación/exportación de usuarios y los campos personalizados. Los tests de dominio no demuestran por sí solos que esos requisitos estén cubiertos en una aplicación desplegable.

## Seguridad

### Contraseñas

Antes de esta rama, `Usuario.contrasenia` almacenaba texto plano; `crearUsuario` copiaba directamente el valor recibido y el seed contenía las claves conocidas `admin123` y `alumno123`. Esto incumplía RNF-02 y permitía que una filtración de la base revelara las contraseñas.

Esta rama cambia el campo a `contraseniaHash`, usa Argon2id con 19 MiB de memoria, 2 pasadas y paralelismo 1, exige entre 12 y 128 caracteres para contraseñas nuevas, y elimina las claves predeterminadas del seed. La migración que renombra la columna ya está aplicada; el script idempotente que convierte contraseñas previas sigue pendiente de ejecución si la base conserva valores en texto plano.

### Autenticación y autorización

Antes de esta rama no había autenticación funcional ni protección de páginas u operaciones. Ahora se usa Auth.js Credentials contra la tabla de usuarios, se excluyen cuentas inactivas, se responde con un error genérico y se mantiene una sesión JWT de 8 horas. Las páginas privadas comprueban la sesión y el estado activo en el servidor; las acciones de gestión vuelven a comprobar permisos en el servidor.

La función original `tienePermiso` aceptaba roles con `cursoId` o `grupoId` distintos del ámbito solicitado porque usaba condiciones `OR` demasiado amplias. También la comprobación de cursos ocultos aceptaba Administradores o Gestores asignados a cualquier ámbito. Ambos filtros se restringieron a la asignación exacta o al rol global de Plataforma, con pruebas unitarias nuevas.

La interfaz de usuarios solo permite altas, cambios de datos y bajas lógicas. No permite cambiar roles ni desactivar al Administrador de Plataforma. Una migración nueva y un trigger marcan la asignación global de Administrador y un índice parcial evita una segunda asignación incluso ante concurrencia. La migración ya se aplicó; había comprobado duplicados y asignaciones fuera del ámbito global de Plataforma antes de instalar la restricción. La política aplica como máximo una asignación; el seed crea la inicial.

### Riesgos que siguen abiertos

- No se incorporó rate limiting ni bloqueo temporal ante intentos repetidos. Antes de exponer el login a Internet conviene añadir una política persistente y monitorizable.
- No hay recuperación o cambio de contraseña ni segundo factor.
- Auth.js emite una sesión stateless; el estado activo se vuelve a consultar en cada área privada, pero no existe una lista de revocación para cerrar todas las sesiones de un usuario.
- La aplicación debe desplegarse detrás de HTTPS y proteger `AUTH_SECRET`, `DATABASE_URL` y `DIRECT_URL` mediante variables secretas del entorno.
- El seed fue convertido a una carga aditiva e idempotente: crea el curso y las cuentas demo si faltan, sin borrar tablas ni actualizar contraseñas existentes. Requiere `SEED_STUDENT_PASSWORD` y, solo si no existe un Administrador global, `SEED_ADMIN_PASSWORD`. Se ejecutó contra la base configurada y cargó los datos de demostración.
- El otorgamiento de una recompensa no múltiple puede duplicarse ante finalizaciones concurrentes: el modelo no tiene una restricción única condicional por usuario y recompensa.
- La unicidad genérica de `UsuarioRol` todavía incluye columnas nullable; PostgreSQL permite duplicados para otros roles globales. El Administrador queda cubierto por el marcador, el trigger y el índice parcial específicos.

## Arquitectura resultante

El primer corte conserva las consultas en `lib/db/`, añade autenticación y validación de permisos bajo `lib/auth/`, deja la interfaz en Server Components de App Router y ejecuta cambios con Server Actions. La gestión de contenido valida el ámbito real del curso a partir de las secciones/recursos, y el reporte sale por un route handler protegido. No se expone una API CRUD pública. Auth.js sí agrega su route handler en `app/api/auth/[...nextauth]/route.ts`.

La separación es adecuada para el primer frontend del mismo Next.js. Si más adelante se incorpora otro cliente, integraciones o una API pública, conviene trasladar las Server Actions a casos de uso de dominio reutilizables y añadir route handlers que usen `lib/http.ts`.

Prisma también avisa que la configuración `package.json#prisma` del seed está obsoleta para Prisma 7; conviene migrarla a `prisma.config.ts` antes de actualizar la versión mayor.
