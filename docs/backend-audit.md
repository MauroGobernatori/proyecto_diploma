# Revisión de arquitectura, requisitos y seguridad del backend

## Alcance

La revisión cubre la documentación (`README.md`, `docs/spec.md`, `specs/`), el modelo Prisma, migraciones, seed, validaciones, lógica de dominio, repositorios y pruebas existentes. El estado de la columna «Antes de esta rama» corresponde al código recibido. La columna «Estado en esta rama» registra lo que quedó implementado aquí; no supone que las migraciones se hayan aplicado a una base real.

## Evaluación general

El repositorio tiene una base de arquitectura razonable para una aplicación Next.js pequeña: esquema relacional centralizado en Prisma, validación de entradas con Zod, operaciones de persistencia en `lib/db/` y algunas reglas de dominio en `lib/`. La inscripción y evaluación de recompensas tienen pruebas unitarias y una transacción para finalizar cursos y otorgar recompensas.

El backend recibido estaba incompleto como aplicación: no tenía rutas HTTP de negocio, autenticación ni controles de autorización enlazados a esas operaciones. Varias funciones existían solo como consultas Prisma, por lo que no había una superficie utilizable por el frontend ni forma de comprobar seguridad de extremo a extremo. La capa `lib/http.ts` define formatos de respuesta, pero no había route handlers que la usaran.

## Cobertura de requisitos

| Área | Antes de esta rama | Estado en esta rama |
| --- | --- | --- |
| H1 — ABM de usuarios | Lectura, alta y actualización parciales en repositorio; sin baja ni interfaz/API. El alta no asignaba rol General. | Interfaz inicial con alta, edición de datos y baja lógica para permisos de Plataforma; alta guarda hash y asigna General. |
| H2 — Importar/exportar usuarios | No implementado. | Sigue pendiente. |
| H3 — Consulta y campos personalizados | Lectura de usuarios disponible; campos personalizados ausentes. | La consulta se incorpora a la pantalla de usuarios; campos personalizados siguen pendientes. |
| H4–H5 — Roles y permisos | Esquema y roles base en seed; no hay gestión completa de roles ni garantía del único Administrador. | El alta asigna General y las acciones de gestión consultan permisos en servidor. La administración de roles sigue pendiente. |
| H6 — Inscripción y progreso | Inscripción asociada a asignación de rol, estado y finalización individual implementados. | Se muestran inscripciones y fechas en «Mis cursos». No se agregan operaciones de inscripción ni finalización desde la interfaz. |
| H7/H13 — Cursos, secciones y recursos | Repositorios para cursos y operaciones de secciones/recursos; sin API ni interfaz. | Catálogo y detalle de cursos visibles con recursos activos. La edición de contenido queda pendiente. |
| H8–H9 — Recompensas y asociaciones | Consulta y alta parcial; no hay edición, baja ni gestión completa de asociaciones. | Se muestran recompensas obtenidas. Administración de recompensas queda pendiente. |
| H10 — Otorgamiento | Evaluación de reglas OR/AND y vigencia implementada al finalizar cursos. | Sin cambios funcionales en esta rama. |
| H11 — Historial de recompensas | Consulta por usuario disponible en repositorio. | Se muestra el historial filtrado por el usuario de sesión. |
| H12 — Frecuencia | Campo `otorgamientoMultiple` persistido y usado por la lógica de otorgamiento. | Sin cambios funcionales en esta rama. |
| Reportes | Solo existe el modelo de datos; no hay consultas ni generación. | Sigue pendiente. |

La especificación general enumera más funcionalidades que las implementadas. En particular, no hay gestión completa de roles, grupos, reportes, importación/exportación ni gestión administrativa de recompensas. Los tests de dominio no demuestran por sí solos que esos requisitos estén cubiertos en una aplicación desplegable.

## Seguridad

### Contraseñas

Antes de esta rama, `Usuario.contrasenia` almacenaba texto plano; `crearUsuario` copiaba directamente el valor recibido y el seed contenía las claves conocidas `admin123` y `alumno123`. Esto incumplía RNF-02 y permitía que una filtración de la base revelara las contraseñas.

Esta rama cambia el campo a `contraseniaHash`, usa Argon2id con 19 MiB de memoria, 2 pasadas y paralelismo 1, exige entre 12 y 128 caracteres para contraseñas nuevas, y elimina las claves predeterminadas del seed. Para no perder las credenciales existentes, agrega una migración que renombra la columna y un script idempotente que convierte los valores previos. **La migración y el script no se ejecutaron contra tu base**; deben completarse en ese orden antes de habilitar el login.

### Autenticación y autorización

Antes de esta rama no había autenticación funcional ni protección de páginas u operaciones. Ahora se usa Auth.js Credentials contra la tabla de usuarios, se excluyen cuentas inactivas, se responde con un error genérico y se mantiene una sesión JWT de 8 horas. Las páginas privadas comprueban la sesión y el estado activo en el servidor; las acciones de gestión vuelven a comprobar permisos en el servidor.

La función original `tienePermiso` aceptaba roles con `cursoId` o `grupoId` distintos del ámbito solicitado porque usaba condiciones `OR` demasiado amplias. También la comprobación de cursos ocultos aceptaba Administradores o Gestores asignados a cualquier ámbito. Ambos filtros se restringieron a la asignación exacta o al rol global de Plataforma, con pruebas unitarias nuevas.

La interfaz de usuarios solo permite altas, cambios de datos y bajas lógicas. No permite cambiar roles ni elimina al Administrador de Plataforma. La regla de «exactamente un Administrador» todavía no está garantizada por una restricción de base de datos y otras rutas futuras deberán respetarla.

### Riesgos que siguen abiertos

- No se incorporó rate limiting ni bloqueo temporal ante intentos repetidos. Antes de exponer el login a Internet conviene añadir una política persistente y monitorizable.
- No hay recuperación o cambio de contraseña ni segundo factor.
- Auth.js emite una sesión stateless; el estado activo se vuelve a consultar en cada área privada, pero no existe una lista de revocación para cerrar todas las sesiones de un usuario.
- La aplicación debe desplegarse detrás de HTTPS y proteger `AUTH_SECRET`, `DATABASE_URL` y `DIRECT_URL` mediante variables secretas del entorno.
- El seed sigue siendo destructivo y borra tablas antes de cargar datos. Ahora exige contraseñas de seed desde variables de entorno, pero debe usarse únicamente en una base descartable o respaldada.
- El otorgamiento de una recompensa no múltiple puede duplicarse ante finalizaciones concurrentes: el modelo no tiene una restricción única condicional por usuario y recompensa.
- La unicidad de `UsuarioRol` incluye columnas nullable; PostgreSQL permite varias filas con `NULL` en los campos de ámbito. La regla de un único rol/administrador global no queda resuelta solo con el índice actual.

## Arquitectura resultante

El primer corte conserva las consultas en `lib/db/`, añade autenticación y validación de permisos bajo `lib/auth/`, deja la interfaz en Server Components de App Router y ejecuta cambios de usuario con Server Actions. No se expone una API CRUD pública. Auth.js sí agrega su route handler en `app/api/auth/[...nextauth]/route.ts`.

La separación es adecuada para el primer frontend del mismo Next.js. Si más adelante se incorpora otro cliente, integraciones o una API pública, conviene trasladar las Server Actions a casos de uso de dominio reutilizables y añadir route handlers que usen `lib/http.ts`.

Prisma también avisa que la configuración `package.json#prisma` del seed está obsoleta para Prisma 7; conviene migrarla a `prisma.config.ts` antes de actualizar la versión mayor.
