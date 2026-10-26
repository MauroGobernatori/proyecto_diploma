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