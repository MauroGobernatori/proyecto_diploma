# Administrador único de Plataforma

## Objetivo y alcance

Garantizar que como máximo una cuenta tenga el rol Administrador en el ámbito global de Plataforma y que esa cuenta pueda ejercer todos los permisos de la aplicación. La identidad persistida es la fuente de verdad; una instancia Singleton de servicio centraliza las comprobaciones dentro de la aplicación.

Esta especificación desarrolla RF-10 y H4 de `docs/spec.md`.

## Comportamiento esperado

- Solo una asignación global de Administrador puede existir a la vez.
- El Administrador global recibe autorización para cualquier clave de permiso, incluso si una relación de permisos todavía no fue asociada explícitamente al rol.
- El rol Administrador no puede asignarse a un ámbito de Curso o Grupo.
- La baja lógica de la cuenta Administrador está protegida.
- La creación de una segunda asignación global se rechaza también cuando dos operaciones concurrentes intentan crearla.
- Los datos preexistentes no se eliminan ni se reasignan automáticamente durante la migración.

## Criterios de aceptación

- La base de datos rechaza una segunda asignación global de Administrador.
- La migración conserva los registros existentes y se detiene con un error explícito si encuentra más de una asignación global de Administrador, para que la resolución no se haga eligiendo una cuenta en forma automática.
- La migración también se detiene si encuentra asignaciones de Administrador con ámbito de Curso/Grupo o un nivel distinto de Plataforma; deben resolverse manualmente antes de reintentar.
- Un Administrador tiene todos los permisos consultados por la aplicación.
- Un Administrador no puede ser desactivado desde el ABM de usuarios.

## Casos límite

- La política implementa unicidad máxima (cero o una cuenta) en la base. El seed de instalación crea la cuenta inicial.
- El Singleton es un servicio sin estado por proceso. La restricción de unicidad reside en PostgreSQL y evita depender de una única instancia de servidor.
- La interfaz de cambio de roles no forma parte de este alcance.
