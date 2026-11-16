# Especificación: primer corte del frontend

## Objetivo y alcance

Construir la primera interfaz de PWGA sobre Next.js, usando las cuentas y los datos ya almacenados en PostgreSQL. Este corte incluye la portada, el inicio de sesión con nombre de usuario o email y contraseña, y cuatro áreas básicas: ABM de usuarios para personas autorizadas, catálogo y detalle de cursos, seguimiento de cursos del usuario y consulta de recompensas obtenidas.

Se relaciona con H1–H3, H6–H8 y H11 de `docs/spec.md`, y con RNF-01, RNF-02, RNF-05, RNF-07, RNF-08 y RNF-09.

## Comportamiento esperado

### Sesión e inicio de sesión

- El usuario inicia sesión con nombre de usuario o email y contraseña contra la base propia.
- Solo se autentican usuarios activos.
- Las contraseñas nuevas se guardan con hash Argon2id; la aplicación nunca compara contraseñas en texto plano.
- Las contraseñas nuevas requieren entre 12 y 128 caracteres; al iniciar sesión se admiten las credenciales legadas sin imponerles longitud nueva.
- La sesión se mantiene en una cookie protegida por Auth.js y las páginas privadas validan la sesión en el servidor.
- El cierre de sesión invalida la sesión del navegador.
- No hay registro público. Las altas las realiza el ABM autorizado.

### Gestión de usuarios

- Administradores y Gestores pueden consultar usuarios activos y crear, modificar y dar de baja usuarios según sus permisos.
- El alta valida los campos de `crearUsuarioSchema`, almacena un hash y asigna el rol General de Plataforma.
- La baja es lógica (`activo = false`); no se borran filas ni relaciones.
- Cada acción verifica la sesión y los permisos en el servidor; ocultar controles en la interfaz no constituye autorización.

### Cursos y progreso

- El catálogo muestra cursos visibles que no estén eliminados.
- El detalle muestra secciones y recursos activos ordenados según los datos persistidos.
- El área de cursos del usuario muestra exclusivamente las inscripciones de la sesión actual, con estado y fechas de registro/finalización.
- Este corte no inscribe usuarios, no modifica progreso y no completa cursos desde la interfaz.

### Recompensas

- El usuario autenticado ve exclusivamente sus recompensas obtenidas.
- Cada resultado muestra nombre, descripción y fecha de obtención.

## Criterios de aceptación

- Un usuario activo puede iniciar sesión con su nombre de usuario o email y contraseña correcta; credenciales incorrectas o cuentas inactivas reciben el mismo mensaje genérico.
- Una sesión inexistente no permite acceder a páginas privadas ni ejecutar acciones de gestión.
- Un usuario sin permiso de plataforma no puede leer ni modificar datos de gestión aunque invoque directamente una acción del servidor.
- Las altas de usuarios persisten un hash Argon2id y asignan el rol General.
- La baja lógica conserva el registro y lo excluye del inicio de sesión y de listados activos.
- El catálogo excluye cursos ocultos y eliminados; el detalle no expone cursos ocultos a usuarios sin acceso.
- Cursos y recompensas mostrados en áreas personales se filtran por el ID de usuario autenticado en el servidor.
- Los errores de formulario se presentan sin exponer detalles internos ni datos de autenticación.

## Reglas y casos límite

- El ámbito de Plataforma requiere asignaciones con `cursoId` y `grupoId` nulos.
- Las asignaciones de roles a otros cursos o grupos no habilitan permisos en el ámbito actual.
- Un curso eliminado se trata como inexistente para el catálogo y el detalle.
- Una inscripción ausente no se infiere a partir de que el usuario tenga un rol de curso.
- El progreso y las recompensas reflejan el estado persistido; la interfaz no calcula ni otorga recompensas.
- Los hashes legados se migran antes de habilitar el nuevo login. La migración conserva usuarios y permite seguir usando sus contraseñas actuales.

## Fuera de alcance

- Registro público, recuperación/cambio de contraseña, segundo factor y acceso social.
- Inscripción automática, finalización de cursos o otorgamiento manual de recompensas.
- Edición del contenido de cursos y administración de roles/permisos.
- Protección distribuida contra fuerza bruta; se debe añadir antes de exponer el login a tráfico público.
