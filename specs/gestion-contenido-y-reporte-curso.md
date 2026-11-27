# Gestión de contenido y reporte de curso

## Objetivo y alcance

Permitir que Administrador, Gestor y Docente administren las secciones y recursos de un curso, registrar entregas y notas de actividades contenidas en lecciones y evaluaciones, y descargar el estado de los alumnos inscriptos.

Esta especificación desarrolla H7, H13, H14 y RF-43–RF-53 de `docs/spec.md`.

## Permisos de contenido

- Administrador, Gestor y Docente pueden crear, modificar y eliminar secciones y recursos en los cursos sobre los que tienen alcance.
- Un Alumno puede consultar los recursos visibles de un curso al que tiene acceso, pero no administrar contenido.
- Los recursos tienen una propiedad de visibilidad. Los recursos ocultos no se muestran a Alumnos; Administrador, Gestor y Docente pueden consultarlos.
- Eliminar una sección muestra una confirmación que advierte que la sección y todos sus recursos se borrarán permanentemente; al confirmar, elimina los datos asociados. Eliminar un recurso lo marca inactivo.
- El recurso `PAGINA_CONTENIDO` guarda y muestra texto además de su nombre y descripción.

## Actividades y calificaciones

- Lección y Evaluación son contenedores de actividades; una actividad pertenece a uno de esos contenedores.
- Los tipos de actividad de esta iteración son Opción múltiple, Verdadero/Falso y Respuesta abierta.
- Cada Alumno puede entregar una vez cada actividad.
- Opción múltiple y Verdadero/Falso se corrigen automáticamente: una respuesta correcta recibe 10 y una incorrecta 0, en escala de 0 a 10. La entrega pasa directamente a `RESUELTA`.
- Respuesta abierta queda en `ENTREGADA` sin nota hasta que Administrador, Gestor o Docente la corrige. Al asignar una nota de 0 a 10, pasa a `RESUELTA`.
- El contenido de respuesta y la calificación pertenecen a la inscripción del usuario y a la actividad, no a la actividad compartida.

## Reporte del curso

- Administrador, Gestor y Docente pueden descargar un reporte del curso desde su detalle.
- El reporte incluye nombre, fecha de inicio y fin, y cada Alumno inscripto con estado y fechas de participación.
- Por cada Alumno se informa el porcentaje de actividades resueltas sobre las actividades activas y visibles del curso.
- Se incluye el estado, la nota y las fechas de entrega/corrección de cada actividad. Las actividades con entrega pendiente de corrección no se consideran resueltas y aún no tienen nota.
- Si el curso no tiene actividades visibles, el porcentaje se muestra como no disponible.
- El archivo se descarga como libro Excel `.xlsx` con una hoja filtrable.
- El libro incluye una hoja de resumen con un gráfico de columnas que distribuye las notas resueltas en cinco rangos: 0–1,99; 2–3,99; 4–5,99; 6–7,99 y 8–10.
- El gráfico considera las entregas resueltas con nota, tanto automática como manual; la hoja de detalle conserva las notas individuales y los estados.

## Casos límite

- Los cursos sin fechas configuradas muestran esas fechas como no establecidas.
- Solo las cuentas con rol Alumno en el curso aparecen en la lista de alumnos, aunque otras personas tengan inscripción por participar con otro rol.
- Las actividades ocultas no son accesibles ni forman parte del denominador del progreso del Alumno.
- El reporte no calcula una nota final del curso ni promedia actividades, porque no hay una regla de ponderación definida.
- Los recursos `ACTIVIDAD` preexistentes que no tengan una configuración de actividad siguen conservados y no admiten entrega ni participan del cálculo hasta que se configuren.

## Fuera de alcance

- Reentregas, múltiples intentos o historial de intentos.
- Otros tipos de autocorrección además de Opción múltiple y Verdadero/Falso.
- Carga de archivos para recursos; el enlace del recurso se administra mediante URL.
