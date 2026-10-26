# Plataforma Web de Gestión de Aprendizaje (PWGA)

Sistema de gestión de aprendizaje (LMS) para organizar, administrar y hacer seguimiento de cursos en línea. Está pensado para aprendizaje asincrónico y a distancia, con acceso a los contenidos desde cualquier lugar y en cualquier momento. La propuesta contempla perfiles de administración, docencia y alumnado, y busca centralizar la información académica para facilitar el seguimiento y la toma de decisiones.

Este proyecto se desarrolla como trabajo de la materia **Ingeniería de Software**. La descripción funcional y los requisitos de este README se basan en el documento de proyecto de la cursada; las secciones de tecnologías, ejecución y estado describen el repositorio actual.

## Objetivos

### Objetivo general

Desarrollar un sistema de gestión de aprendizaje que permita organizar, administrar y realizar el seguimiento de cursos en línea, facilite la interacción entre los actores educativos y mejore el acceso a información útil para tomar decisiones. Se busca centralizar la gestión de contenidos, el progreso de los alumnos y la administración de cursos en una solución accesible y eficiente.

### Objetivos específicos

- Facilitar la organización y administración de cursos y contenidos educativos.
- Mejorar el acceso a la información académica para los distintos usuarios.
- Optimizar el seguimiento del progreso de los estudiantes en los cursos.
- Centralizar la información relevante en una única plataforma.
- Brindar información procesada que apoye la toma de decisiones.

## Alcance

### Incluido

- Alta, baja y modificación de usuarios, con información obligatoria y opcional.
- Asignación de roles en los ámbitos de plataforma, curso y grupo.
- Creación y administración de cursos.
- Organización del contenido de cada curso mediante secciones.
- Administración de recursos educativos, como enlaces, videos, documentos, actividades y evaluaciones.
- Gestión de grupos.
- Gestión y otorgamiento de recompensas relacionadas con cursos.

### Fuera del alcance

- Integraciones con sistemas externos, por ejemplo, plataformas de pago o sistemas académicos.
- Clases en tiempo real o videollamadas.
- Mensajería interna avanzada.
- Aplicaciones móviles.
- Analítica avanzada o inteligencia de datos.
- Infraestructura de alta disponibilidad.

## Actores e interesados

| Actor/interesado | Participación |
| --- | --- |
| Administrador | Administración de la plataforma y asignación de roles. |
| Gestor | Gestión de usuarios, cursos y recompensas según los permisos asignados. |
| Docente | Gestión del contenido de los cursos en los que participa. |
| Alumno | Acceso a cursos y consulta de recompensas obtenidas. |
| Jefe e integrante | Roles disponibles dentro del ámbito de un grupo. |
| Hunko Education | Organización propietaria del sistema. |
| Mauro Gobernatori | Desarrollador del sistema. |
| Pablo Andrés Audoglio | Profesor evaluador. |
| Clientes de Hunko Education y usuarios finales | Interesados en el uso del sistema. |

## Requerimientos funcionales

Los siguientes requerimientos expresan el alcance objetivo del proyecto. Su presencia en este README no implica que todos estén implementados en el repositorio.

### Gestión de usuarios

- **RF-01:** Permitir alta, baja y modificación de usuarios.
- **RF-02:** Gestionar la información de los usuarios, con datos obligatorios y opcionales.
- **RF-03:** Exigir los datos obligatorios para crear un usuario.
- **RF-04:** Permitir almacenar información adicional opcional.
- **RF-05:** Almacenar obligatoriamente nombre, apellido, nombre de usuario, email y contraseña.
- **RF-06:** Permitir almacenar opcionalmente DNI, institución y empresa.
- **RF-07:** Permitir importar y exportar usuarios mediante archivos.
- **RF-08:** Permitir al Administrador y al Gestor visualizar la información de usuarios.
- **RF-09:** Permitir al Administrador y al Gestor crear nuevos campos de información para usuarios.

### Gestión de roles y seguridad

- **RF-10:** Tener un único usuario con rol Administrador a nivel de Plataforma.
- **RF-11:** Permitir los roles Administrador, Gestor y General a nivel de Plataforma.
- **RF-12:** Permitir los roles Docente y Alumno a nivel de Curso.
- **RF-13:** Permitir los roles Jefe e Integrante a nivel de Grupo.
- **RF-14:** Permitir que un usuario tenga distintos roles según el curso al que pertenezca.
- **RF-15:** Permitir que un usuario tenga distintos roles según el grupo al que pertenezca.
- **RF-16:** Asignar el rol General de Plataforma a cada usuario nuevo.
- **RF-17:** Permitir al Administrador cambiar el rol de Plataforma de cualquier usuario.
- **RF-18:** Permitir al Administrador y al Gestor crear roles de Plataforma, Curso y Grupo.

### Gestión de cursos

- **RF-19:** Permitir gestionar la información de los cursos.
- **RF-20:** Permitir definir la estructura y los contenidos de los cursos.
- **RF-21:** Permitir al Administrador y al Gestor crear cursos.
- **RF-22:** Permitir al Administrador y al Gestor modificar cursos.
- **RF-23:** Permitir al Administrador y al Gestor eliminar cursos.

### Inscripciones y roles en cursos

- **RF-24:** Permitir al Administrador asignar cualquier usuario a cursos como Docente o Alumno.
- **RF-25:** Permitir al Gestor asignar usuarios con rol General a cursos como Docente o Alumno.
- **RF-26:** Permitir al Administrador modificar el rol de un Docente o Alumno dentro de un curso.

### Recompensas

- **RF-27:** Permitir al Administrador y al Gestor crear recompensas.
- **RF-28:** Permitir al Administrador y al Gestor modificar recompensas existentes.
- **RF-29:** Permitir al Administrador y al Gestor eliminar recompensas existentes.
- **RF-30:** Permitir al Administrador y al Gestor visualizar las recompensas disponibles.
- **RF-31:** Exigir como mínimo nombre y descripción para una recompensa.
- **RF-32:** Permitir vincular una recompensa con un curso o un grupo de cursos.
- **RF-33:** Permitir modificar los cursos asociados a una recompensa.
- **RF-34:** Permitir desvincular cursos de una recompensa.
- **RF-35:** Otorgar una recompensa a un alumno al completar un curso asociado.
- **RF-36:** Otorgar una recompensa cuando el alumno complete todos los cursos asociados a ella.
- **RF-37:** Verificar las condiciones necesarias antes de otorgar una recompensa.
- **RF-38:** Registrar las recompensas obtenidas por cada alumno.
- **RF-39:** Permitir al alumno consultar sus recompensas desde su perfil.
- **RF-40:** Mostrar como mínimo nombre, descripción y fecha de obtención de cada recompensa obtenida.
- **RF-41:** Permitir configurar si una recompensa puede obtenerse una sola vez o varias veces por alumno.

## Requerimientos no funcionales

- **RNF-01:** Autenticar a los usuarios mediante nombre de usuario y contraseña.
- **RNF-02:** Almacenar las contraseñas de forma encriptada.
- **RNF-03:** Mantener una disponibilidad de al menos el 99%.
- **RNF-04:** Responder a las solicitudes en menos de 3 segundos en condiciones normales.
- **RNF-05:** Ofrecer una interfaz intuitiva y fácil de usar.
- **RNF-06:** Permitir el crecimiento en usuarios, cursos y recursos sin degradación significativa del rendimiento.
- **RNF-07:** Mantener un diseño modular que facilite el mantenimiento y la evolución.
- **RNF-08:** Garantizar la consistencia de los datos almacenados.
- **RNF-09:** Poder ejecutarse en navegadores web modernos.
- **RNF-10:** Realizar copias de seguridad periódicas de la información.

## Criterios de aceptación del producto

- Gestionar usuarios, cursos y contenidos sin errores.
- Dar acceso a las funciones principales según el rol del usuario.
- Permitir navegar y acceder a contenidos de forma clara.
- Permitir crear cursos con secciones y recursos.
- Responder correctamente a operaciones básicas de creación, modificación y eliminación.

## Casos de uso y diseño funcional

La especificación del proyecto detalla estos flujos principales:

- **CUD-01 - Gestionar contenido de curso:** docentes, administradores y gestores acceden al contenido del curso.
- **CUD-02 - Gestionar secciones:** crear, modificar y eliminar secciones de un curso.
- **CUD-03 - Gestionar recursos:** crear, modificar y eliminar recursos de una sección. Al crear, se contempla elegir un tipo (enlace, video, documento, actividad, evaluación, entre otros) y completar campos generales y específicos.
- **CUD-04 - Gestionar recompensas:** administradores y gestores crean, modifican y eliminan recompensas, y asocian cursos y condiciones.
- **CUD-05 - Obtener recompensa:** al completarse la condición de curso, el sistema verifica la vigencia y las reglas, otorga la recompensa y registra la fecha.
- **CUD-06 - Visualizar recompensas obtenidas:** el alumno consulta las recompensas obtenidas.

El documento también contiene bosquejos de la vista del alumno en un curso, la vista del docente/administrador/gestor en un curso y la página “Mis Cursos”. Incluye diagramas de estados de Curso y Recompensa, casos de uso, modelo de dominio, secuencia, clases y persistencia. Los diagramas de dominio, secuencia, clases y persistencia están enlazados en el documento de la cursada:

- [Modelo de dominio (simplificado y completo)](https://drive.google.com/file/d/1jHrZHCHr7Nj1pYpLOvQBF7XD50w8k0RE/view)
- [Diagrama de secuencia](https://drive.google.com/file/d/1QNJgFFc9kTkE1F7QkooVXh30uRiMrQFF/view)
- [Diagrama de clases](https://drive.google.com/file/d/1syfP8_jFxbhjMkAILaGf2yNDsRFkF3Jx/view)
- [Diagrama de persistencia](https://drive.google.com/file/d/1i9UfETbB7gx6FrMrQ-fHJCwYDMss-SBZ/view)

## Iteraciones e hitos

El desarrollo se plantea de forma incremental, comenzando por funcionalidades esenciales y ampliándolas en iteraciones.

### Iteraciones documentadas

1. **Iteración 1 - Cursos y contenidos:** gestión de cursos, secciones y recursos; especificación de casos de uso y diagramas del curso.
2. **Iteración 2 - Recompensas:** gestión, asociación a cursos, evaluación de condiciones, otorgamiento y consulta de recompensas.

El documento registra una revisión del **06/10/2026** que propone agregar bosquejos de interfaz para recompensas, detallar qué es una recompensa, quitar el caso de uso “Obtener Recompensa” de un diagrama de casos de uso y completar atributos y tipos en el modelo de dominio.

### Hitos del plan

| Hito | Fecha indicada | Entregables principales |
| --- | --- | --- |
| 1 | 26/05/2026 | Descripción general y diagramas principales del requerimiento core: casos de uso, estados y modelo de dominio. |
| 2 | 07/07/2026 | Diagramas de secuencia y de clases. |
| 3 | 01/08/2026 | Implementación de código. |

## Supuestos y restricciones

### Supuestos

- Los usuarios tienen acceso a internet.
- Los usuarios tienen conocimientos básicos para usar plataformas digitales.
- El sistema se utilizará en un entorno controlado, de carácter académico.
- Los datos ingresados por los usuarios son válidos.

### Restricciones

- El tiempo de desarrollo está limitado por la duración de la cursada.
- El desarrollo es individual y cuenta con recursos limitados.
- El alcance se limita a las funcionalidades principales.
- No se contempla infraestructura de alta disponibilidad.

## Tecnologías y arquitectura del repositorio

- **Next.js 16** con App Router, **React 19** y **TypeScript** para la aplicación web.
- **Prisma 6** y **PostgreSQL** para persistencia.
- **Zod** para validación de datos.
- **Tailwind CSS 4** para estilos.
- **Vitest** para pruebas unitarias y **ESLint 9** para análisis estático.

La estructura actual está organizada así:

```text
app/             Interfaz y layout de Next.js
lib/             Lógica de dominio, validaciones, errores y respuestas HTTP
lib/db/          Consultas de persistencia mediante Prisma
lib/schemas/     Esquemas y tipos de entrada con Zod
prisma/          Modelo de datos y seed de demostración
```

El esquema de Prisma representa usuarios y roles con permisos y ámbitos de Plataforma/Curso/Grupo, cursos con secciones y recursos, grupos, recompensas con reglas y recompensas obtenidas, y reportes.

### Estado actual del código

El repositorio implementa partes del modelo y lógica para cursos, permisos, usuarios, grupos y recompensas, además de validaciones y algunas pruebas unitarias. La página inicial de `app/` todavía es la pantalla de bienvenida generada por Next.js y no se encontraron rutas API en `app/`. Por lo tanto, el alcance funcional descrito arriba es el objetivo del proyecto y no una afirmación de que la aplicación ya esté completa.

## Requisitos previos

- Node.js y npm.
- Una base de datos PostgreSQL accesible.
- Variables `DATABASE_URL` y `DIRECT_URL` disponibles para Prisma.

## Ejecución local

Instalá las dependencias (el `postinstall` del proyecto genera el cliente Prisma):

```bash
npm install
```

Configurá `DATABASE_URL` y `DIRECT_URL` para tu base PostgreSQL y luego iniciá el servidor de desarrollo:

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

Para compilar y ejecutar en modo producción:

```bash
npm run build
npm run start
```

El seed declarado en `package.json` es `tsx prisma/seed.ts`. **El script elimina los registros existentes de varias tablas antes de cargar los datos demo**; ejecutalo solo contra una base local descartable o después de respaldar los datos. Para invocarlo con Prisma:

```bash
npx prisma db seed
```

## Pruebas y calidad

Ejecutá las pruebas unitarias y ESLint con:

```bash
npm test
npm run lint
```

Las pruebas actuales cubren reglas de acceso a cursos, otorgamiento de recompensas y validaciones de entrada. No se observó una suite de pruebas de interfaz o de extremo a extremo.

## Spec Kit y guía para agentes

El repositorio incluye la integración de Spec Kit con Codex: las skills están en `.agents/skills/`, y los scripts, plantillas, memoria y definición de workflow están bajo `.specify/`. Las instrucciones de trabajo para agentes están en [`AGENTS.md`](./AGENTS.md). La constitución de Spec Kit se encuentra todavía como plantilla, por lo que sus principios deben completarse antes de usarla como guía de gobierno del proyecto.
