# Especificación: inscripción y finalización individual de cursos

## Objetivo y alcance

Registrar cuándo se inscribe cada usuario a un curso y si ese usuario lo completó, para que las recompensas se calculen a partir de cursos efectivamente finalizados. Esta especificación desarrolla RF-42 y los criterios de H6 y H10 de `docs/spec.md`.

## Comportamiento esperado

- Al asignar a un usuario a un curso, el sistema registra una relación usuario-curso con `fechaRegistro`, estado `EN_CURSO` y `fechaFinalizacion` vacía.
- Una relación usuario-curso es única. Reasignar o agregar otro rol en el curso conserva la fecha de registro y el estado existentes.
- Cuando el usuario finaliza el curso, la relación pasa a `FINALIZADO` y se registra `fechaFinalizacion`.
- No se considera completado un curso por el mero hecho de tener un rol asignado en él.
- Las reglas de recompensa son alternativas entre sí (OR); todos los cursos de una misma regla deben estar finalizados (AND). Una recompensa configurada con una regla individual y otra grupal puede obtenerse al cumplir cualquiera de las dos.

## Criterios de aceptación

- La inscripción persiste la fecha de registro y comienza en estado `EN_CURSO`.
- La finalización persiste estado `FINALIZADO` y una fecha de finalización.
- El evaluador de recompensas solo cuenta cursos del usuario cuyo estado sea `FINALIZADO`.
- Una regla de un curso se satisface al finalizar ese curso.
- Una regla de varios cursos no se satisface hasta que todos estén finalizados.
- Cuando una recompensa tiene varias reglas, cumplir cualquiera de ellas permite otorgarla, sujeto a su vigencia y configuración de otorgamiento.

## Casos límite

- Si el usuario ya tiene una relación usuario-curso, agregar otro rol no reinicia estado, fecha de registro ni fecha de finalización.
- La transición a `FINALIZADO` solo ocurre para una relación usuario-curso existente.
- Una finalización repetida no vuelve a procesar el mismo cambio de estado.

## Fuera de alcance

- Historial de múltiples inscripciones o intentos del mismo usuario en el mismo curso.
- Cambios en las reglas de autorización de roles y permisos.
