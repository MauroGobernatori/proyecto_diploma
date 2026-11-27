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
- Administración de recursos educativos, como enlaces, videos, documentos, páginas de contenido, lecciones y evaluaciones con actividades.
- Seguimiento de entregas y calificaciones, y descarga de reportes de curso en Excel.
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

## Especificación

Los requisitos, criterios de aceptación, casos de uso, iteraciones, hitos, supuestos, restricciones y requisitos previos del proyecto se documentan en [`docs/spec.md`](./docs/spec.md).

## Tecnologías y arquitectura del repositorio

- **Next.js 16** con App Router, **React 19** y **TypeScript** para la aplicación web.
- **Prisma 6** y **PostgreSQL** para persistencia.
- **Zod** para validación de datos.
- **ExcelJS** para generar libros `.xlsx` con reportes de curso.
- **PureImage** para generar el gráfico PNG de distribución de notas incluido en el libro Excel.
- **Auth.js** para sesiones e inicio de sesión con credenciales de la base propia.
- **Argon2id** para proteger las contraseñas almacenadas.
- **Tailwind CSS 4** para estilos.
- **Vitest** para pruebas unitarias y **ESLint 9** para análisis estático.

La estructura actual está organizada así:

```text
app/             Interfaz, acciones y rutas de Next.js
lib/             Lógica de dominio, autenticación, validaciones y errores
lib/db/          Consultas de persistencia mediante Prisma
lib/schemas/     Esquemas y tipos de entrada con Zod
prisma/          Modelo de datos y seed de demostración
specs/           Especificaciones acotadas de funcionalidades
```

El esquema de Prisma representa usuarios y roles con permisos y ámbitos de Plataforma/Curso/Grupo, cursos con secciones y recursos, actividades con entregas y notas, grupos, recompensas con reglas y recompensas obtenidas, y reportes.

## Ejecución local

Instalá las dependencias (el `postinstall` del proyecto genera el cliente Prisma):

```bash
npm install
```

Configurá `DATABASE_URL` y `DIRECT_URL` para tu base PostgreSQL. Aplicá las migraciones y convertí las contraseñas guardadas por versiones anteriores antes de iniciar la aplicación:

```bash
npx prisma migrate dev
npm run db:hash-passwords
```

Generá el secreto de sesión y luego iniciá el servidor de desarrollo:

```bash
npx auth secret
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

Para compilar y ejecutar en modo producción:

```bash
npm run build
npm run start
```

El login utiliza cuentas activas de la base y permite ingresar con nombre de usuario o email. La conversión conserva las cuentas y se puede repetir con seguridad.

El seed declarado en `package.json` es `tsx prisma/seed.ts`. Agrega de forma idempotente un curso, tres alumnos y actividades de demostración, y no elimina registros ni modifica las contraseñas de cuentas existentes. Configurá `SEED_STUDENT_PASSWORD` con al menos 12 caracteres; `SEED_ADMIN_PASSWORD` también es necesaria si todavía no existe un Administrador global. No guardes esas claves en Git. Para invocarlo con Prisma:

```bash
npx prisma db seed
```

## Pruebas y calidad

Ejecutá las pruebas unitarias y ESLint con:

```bash
npm test
npm run lint
```

Las pruebas actuales cubren reglas de acceso a cursos, otorgamiento de recompensas, validaciones de entrada, calificación automática y la estructura del reporte Excel. No se observó una suite de pruebas de interfaz o de extremo a extremo.
