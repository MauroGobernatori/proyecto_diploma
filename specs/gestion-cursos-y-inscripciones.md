# Gestión de cursos e inscripciones

## Objetivo y alcance

Completar la creación, consulta, modificación y baja lógica de cursos y permitir gestionar las inscripciones de alumnos desde la plataforma. Desarrolla H6, H7 y RF-19–RF-26, RF-42 de `docs/spec.md`.

## Permisos

- Administrador y Gestor pueden crear y modificar cursos y cambiar sus ajustes.
- Administrador y Gestor pueden dar de baja lógica a cursos. El registro y el contenido se conservan.
- Administrador puede inscribir usuarios existentes como Alumnos, sin restricción por su rol de Plataforma.
- Gestor puede inscribir únicamente usuarios que tengan rol General de Plataforma.
- La pantalla y las acciones solo administran inscripciones con rol Alumno. Docentes conservan las asignaciones que tengan.

## Cursos

- El ABM comprende nombre, descripción, logo, fecha de inicio, fecha de fin, tema, formato, matriculación libre, visibilidad y estado.
- El nombre y la descripción son obligatorios; si se informan ambas fechas, la fecha de fin no puede preceder a la de inicio.
- Solo se modifican cursos que no estén eliminados.
- Eliminar un curso lo oculta del catálogo y lo marca `ELIMINADO`; no elimina sus secciones, recursos, inscripciones ni entregas.
- Un curso eliminado no se puede volver a editar ni administrar desde el catálogo.

## Inscripciones de alumnos

- Inscribir agrega al usuario el rol Alumno en el ámbito del curso y crea la relación usuario-curso en estado `EN_CURSO`.
- Una persona que ya tiene una inscripción o rol Alumno no se duplica; el flujo conserva fecha y estado previos.
- Desinscribir elimina la relación de inscripción y el rol Alumno del curso, de modo que el usuario deja de figurar en la lista del curso y en sus reportes.
- Las entregas y notas se conservan como historial. Una reinscripción conserva ese historial y no habilita un segundo intento para una actividad ya entregada.
- Desinscribir no elimina ni modifica un rol Docente del mismo usuario.

## Casos límite

- Un Gestor no puede inscribir a un usuario sin rol General de Plataforma.
- Una acción no puede operar sobre un curso eliminado o inexistente.
- Un alumno ya inscripto no aparece entre los usuarios disponibles para inscribir.
- No se permite una fecha de fin anterior a la fecha de inicio.

## Criterios de aceptación

- Las acciones de servidor validan sesión, permiso y datos; ocultar botones no reemplaza la autorización del servidor.
- Los cambios de curso se reflejan en el catálogo y su detalle.
- La desinscripción mantiene entregas y notas, pero quita al alumno de la inscripción y del rol del curso.
- Un usuario sin permiso recibe una respuesta de acceso denegado y no modifica datos.
