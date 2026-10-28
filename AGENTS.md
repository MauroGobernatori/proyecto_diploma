# Instrucciones para agentes de IA

## Contexto
Este repositorio contiene una aplicación de gestión de cursos y usuarios.

## Reglas generales
- Antes de modificar código, inspeccioná la estructura del proyecto y su documentación.
- Respetá la arquitectura, las convenciones y las dependencias existentes.
- No agregues funcionalidades que no estén solicitadas.
- No inventes reglas de negocio: documentá las dudas y pedí aclaraciones.
- Para funcionalidades nuevas, revisá o prepará la especificación antes de implementar.
- Dividí el trabajo en cambios pequeños y verificables.
- Agregá o actualizá pruebas para cada cambio de comportamiento.
- No declares una tarea terminada sin ejecutar las verificaciones disponibles.
- No elimines datos, ejecutes migraciones destructivas ni despliegues a producción sin autorización explícita.
- No expongas credenciales, tokens, contraseñas ni información sensible.

## Flujo de trabajo
1. Analizar el requisito.
2. Identificar las especificaciones y el código afectados.
3. Proponer un plan de implementación.
4. Esperar revisión del plan cuando haya decisiones importantes.
5. Implementar y ejecutar pruebas.
6. Informar los archivos modificados, las pruebas ejecutadas y las limitaciones pendientes.

## Git y control de ramas

- Nunca realices cambios de código directamente en la rama `main`.
- Antes de modificar archivos, verificá la rama actual y el estado del repositorio.
- Si la rama actual es `main`, no modifiques archivos. Solicitá crear o seleccionar una rama de trabajo.
- Utilizá una rama independiente para cada funcionalidad o corrección.
- Usá nombres descriptivos, como `feat/rewards-system`, `fix/login-validation` o `docs/update-readme`.
- No realices merges ni integres cambios en `main`.
- No hagas push, commits, merges ni otras operaciones que modifiquen el repositorio remoto sin autorización explícita.
- No sobrescribas ni descartes cambios existentes del usuario.
- Antes de finalizar, informá la rama utilizada, los archivos modificados, las pruebas ejecutadas y el estado de los cambios.
- Los cambios deben revisarse mediante un Pull Request antes de integrarse en `main`.

## Commits y publicación de ramas

- Cuando el usuario solicite explícitamente realizar un commit, podés ejecutarlo después de revisar los cambios y verificar que sean adecuados.
- Cuando el usuario autorice explícitamente hacer push, podés publicar la rama de trabajo actual en el remoto configurado.
- La autorización para hacer commit no implica autorización para hacer push, merge ni integrar cambios en `main`.
- Antes de crear un commit, revisá `git status`, el diff completo y los archivos que se incluirán. No incluyas cambios preexistentes o ajenos a la tarea.
- Ejecutá las pruebas y verificaciones pertinentes antes de crear el commit. Si alguna falla, informalo y no presentes el trabajo como completamente verificado.
- Utilizá mensajes de commit descriptivos que expliquen el propósito del cambio. No uses mensajes genéricos como `update`, `changes` o `fix`.
- El mensaje debe incluir un título breve y, cuando el cambio lo justifique, un cuerpo con los principales cambios realizados y su motivación.
- No inventes cambios ni afirmes que se ejecutaron pruebas que no se realizaron.
- Antes de hacer push, verificá que estés en la rama de trabajo correcta y que el destino remoto sea el esperado.
- Publicá únicamente la rama autorizada. No utilices `--force` ni `--force-with-lease` sin autorización explícita.
- Si el commit o el push falla, informá el error y la causa probable. No afirmes que se publicó una rama si la operación no se completó.
- Al finalizar, informá el identificador del commit, su mensaje, la rama publicada y el resultado de las verificaciones.
- Nunca realices commits, push ni merges en `main` como parte de este flujo.
- Cuando el usuario solicite explícitamente crear o actualizar una Pull Request para la rama de trabajo, podés hacerlo después de verificar el diff y publicar la rama correspondiente. Nunca apruebes, aceptes ni integres la Pull Request; el usuario realizará esa acción manualmente.
- Al crear o actualizar una Pull Request, redactá un título y una descripción claros que expliquen el propósito, los principales cambios y las verificaciones ejecutadas. No afirmes verificaciones que no se realizaron.

## Documentación del proyecto

### README.md: información general

- `README.md` debe contener únicamente información general del proyecto, como su descripción, objetivos, funcionalidades principales, tecnologías utilizadas, requisitos previos para ejecutar el sistema e instrucciones de instalación y ejecución.
- No debe contener el análisis funcional detallado del sistema.
- Los listados completos de roles, historias de usuario, criterios de aceptación, reglas de negocio, requisitos funcionales y no funcionales, casos de uso, supuestos y restricciones deben documentarse en `docs/spec.md`.
- Si una modificación vuelve obsoleta alguna información general del README, actualizala para mantenerla coherente con el estado real del proyecto.

### docs/spec.md: especificación funcional general

- `docs/spec.md` es la fuente principal del análisis funcional actualizado del sistema.
- Antes de modificar el comportamiento del sistema, consultá `docs/spec.md` y revisá los apartados relevantes para la tarea.
- Utilizá este documento para conocer los roles, las historias de usuario, los criterios de aceptación, las reglas de negocio y los requisitos funcionales y no funcionales.
- Cuando una tarea afecte al análisis funcional, identificá qué apartados deben actualizarse y proponé o realizá las actualizaciones correspondientes según el alcance autorizado.
- No inventes requerimientos ni resuelvas contradicciones de negocio sin consultar.
- Si `docs/spec.md` no existe, está incompleto o contradice el comportamiento solicitado, informá la situación antes de tomar decisiones importantes.

### specs/: especificaciones de funcionalidades

- `specs/` contiene documentos específicos de funcionalidades o cambios acotados del sistema.
- Cada especificación debe describir el alcance de la funcionalidad, su objetivo, las historias de usuario o requerimientos afectados, los criterios de aceptación, las reglas de negocio relevantes y los casos límite que corresponda contemplar.
- Las especificaciones deben ser consistentes con `docs/spec.md`. No deben introducir reglas de negocio contradictorias.
- Antes de implementar una funcionalidad, revisá si existe una especificación relacionada en `specs/`.
- Si la funcionalidad no tiene especificación, prepará una antes de implementar.
- Si ya existe una especificación para la misma funcionalidad, evaluá si corresponde actualizarla o crear otra para un cambio nuevo claramente delimitado.
- No dupliques todo `docs/spec.md` dentro de cada especificación. Incluí únicamente el contexto necesario para comprender y verificar el cambio.
- Cuando una especificación y `docs/spec.md` difieran, identificá la discrepancia y solicitá aclaración si no puede resolverse a partir del alcance aprobado.
- No implementes automáticamente todos los cambios pendientes mencionados en la documentación. Trabajá únicamente sobre el alcance solicitado.

### Relación entre documentación e implementación

- La documentación funcional describe el comportamiento esperado; el código y las pruebas permiten verificar el comportamiento implementado.
- Cuando cambie una funcionalidad, revisá tanto la documentación como el código y las pruebas relacionadas.
- Actualizá los criterios de aceptación y las pruebas cuando cambie el comportamiento esperado.
- No consideres una funcionalidad terminada únicamente porque su documentación esté completa.
- Conservá la trazabilidad entre los requerimientos generales, las especificaciones particulares y las pruebas que verifican su cumplimiento.
