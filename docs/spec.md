# Especificación de requisitos

## Roles

| Rol | Ámbito | Responsabilidades descritas |
| --- | --- | --- |
| Administrador | Plataforma | Administra la plataforma y asigna roles; puede gestionar usuarios, cursos y recompensas. |
| Gestor | Plataforma | Gestiona usuarios, cursos y recompensas según los permisos asignados. |
| General | Plataforma | Rol inicial de cada usuario nuevo; puede ser asignado a cursos por un Gestor. |
| Docente | Curso | Gestiona el contenido de los cursos en los que participa. |
| Alumno | Curso | Accede a cursos y consulta las recompensas obtenidas. |
| Jefe | Grupo | Rol disponible dentro del ámbito de un grupo. |
| Integrante | Grupo | Rol disponible dentro del ámbito de un grupo. |

Una persona puede tener roles diferentes según el curso o grupo. El README indica un único usuario con rol Administrador a nivel de Plataforma.

## Historias de Usuario

### H1 — Gestionar datos de usuarios

**Como** Administrador o Gestor, **quiero** dar de alta, baja y modificar usuarios y gestionar sus datos obligatorios y opcionales, **para** mantener actualizada la información de las personas usuarias.

**Criterios de aceptación**

- El sistema permite dar de alta, dar de baja y modificar usuarios.
- Cada usuario creado tiene Nombre, Apellido, Nombre de usuario, Email y Contraseña.
- DNI, Institución y Empresa se pueden guardar como datos opcionales.
- El sistema requiere los datos obligatorios para crear un usuario y permite almacenar información adicional opcional.

### H2 — Importar y exportar usuarios

**Como** Administrador o Gestor, **quiero** importar y exportar usuarios mediante archivos, **para** gestionar información de usuarios en forma masiva.

**Criterios de aceptación**

- Se pueden importar usuarios mediante archivos.
- Se pueden exportar usuarios mediante archivos.

### H3 — Consultar usuarios y ampliar sus datos

**Como** Administrador o Gestor, **quiero** visualizar la información de los usuarios y crear nuevos campos para ella, **para** consultar y adaptar los datos gestionados por la plataforma.

**Criterios de aceptación**

- Administrador y Gestor pueden visualizar la información de los usuarios.
- Administrador y Gestor pueden crear nuevos campos de información para usuarios.

### H4 — Utilizar roles en los ámbitos definidos

**Como** usuario de la plataforma, **quiero** contar con roles definidos para Plataforma, Curso y Grupo, **para** participar con el rol correspondiente en cada ámbito.

**Criterios de aceptación**

- A nivel de Plataforma están disponibles los roles Administrador, Gestor y General.
- A nivel de Curso están disponibles los roles Docente y Alumno.
- A nivel de Grupo están disponibles los roles Jefe e Integrante.
- Un usuario puede tener distintos roles según el Curso al que pertenezca.
- Un usuario puede tener distintos roles según el Grupo al que pertenezca.
- La plataforma tiene únicamente un usuario con rol Administrador a nivel de Plataforma.

### H5 — Asignar y modificar roles

**Como** Administrador o Gestor, **quiero** asignar el rol inicial y gestionar los roles permitidos en cada ámbito, **para** mantener las responsabilidades de los usuarios según las reglas de la plataforma.

**Criterios de aceptación**

- Al crear un usuario, el sistema le asigna el rol General a nivel de Plataforma.
- El Administrador puede cambiar el rol de cualquier usuario a nivel de Plataforma.
- Administrador y Gestor pueden crear roles a nivel de Plataforma, Curso y Grupo.

### H6 — Inscribir usuarios en cursos con un rol

**Como** Administrador o Gestor, **quiero** asignar usuarios a Cursos como Docente o Alumno respetando el alcance de mi rol, **para** conformar la participación de cada curso.

**Criterios de aceptación**

- El Administrador puede asignar cualquier usuario a Cursos con rol Docente o Alumno.
- El Gestor puede asignar a Cursos usuarios con rol General, como Docente o Alumno.
- El Administrador puede modificar dentro de un Curso el rol de un usuario que sea Docente o Alumno.
- Al asignar un usuario a un Curso, se registra su fecha de inscripción y su estado de participación.
- La participación comienza en estado `EN_CURSO`; al finalizar el Curso para ese usuario, cambia a `FINALIZADO` y se guarda la fecha de finalización.

### H7 — Gestionar cursos

**Como** Administrador o Gestor, **quiero** gestionar la información de los cursos y crear, modificar y eliminar cursos, **para** mantener organizada la oferta de cursos.

**Criterios de aceptación**

- El sistema permite gestionar la información de los cursos.
- El sistema permite definir contenidos y estructura dentro de los cursos.
- Administrador y Gestor pueden crear cursos.
- Administrador y Gestor pueden modificar cursos.
- Administrador y Gestor pueden eliminar cursos.

### H8 — Gestionar recompensas

**Como** Administrador o Gestor, **quiero** crear, modificar, eliminar y visualizar recompensas, **para** administrar los reconocimientos disponibles en la plataforma.

**Criterios de aceptación**

- Administrador y Gestor pueden crear, modificar y eliminar recompensas.
- Administrador y Gestor pueden visualizar las recompensas disponibles en la plataforma.
- Para crear una recompensa, se requiere como mínimo nombre y descripción.

### H9 — Asociar recompensas a cursos

**Como** Administrador o Gestor, **quiero** vincular, modificar y desvincular cursos y grupos de cursos de una recompensa, **para** definir a qué cursos se relaciona.

**Criterios de aceptación**

- Administrador y Gestor pueden vincular una recompensa con un curso o un grupo de cursos.
- Administrador y Gestor pueden modificar los cursos y grupos de cursos asociados a una recompensa.
- Administrador y Gestor pueden desvincular cursos y grupos de cursos de una recompensa.

### H10 — Otorgar recompensas según condiciones

**Como** Alumno, **quiero** que el sistema verifique las condiciones de una recompensa y me la otorgue cuando corresponda, **para** recibir el reconocimiento asociado a mis cursos completados.

**Criterios de aceptación**

- El sistema verifica las condiciones necesarias antes de otorgar una recompensa.
- El sistema otorga una recompensa a un alumno cuando completa un curso asociado a ella.
- El sistema otorga una recompensa a un alumno cuando completa todos los cursos asociados a ella.

### H11 — Consultar y registrar recompensas obtenidas

**Como** Alumno, **quiero** que mis recompensas obtenidas queden registradas y poder visualizarlas desde mi perfil, **para** consultar los reconocimientos recibidos.

**Criterios de aceptación**

- El sistema registra las recompensas obtenidas por cada alumno.
- El alumno puede visualizar desde su perfil las recompensas que obtuvo.
- Para cada recompensa obtenida se muestra, como mínimo, el nombre, la descripción y la fecha de obtención.

### H12 — Configurar la frecuencia de obtención

**Como** Administrador o Gestor, **quiero** configurar si una recompensa puede obtenerse una sola vez o múltiples veces por el mismo alumno, **para** definir la frecuencia permitida de obtención.

**Criterios de aceptación**

- Se puede configurar una recompensa para que un mismo alumno la obtenga una única vez.
- Se puede configurar una recompensa para que un mismo alumno la obtenga múltiples veces.

## Requerimientos funcionales

### Gestión de Usuarios

- **RF-01:** El sistema debe permitir la gestión de usuarios (alta, baja y modificación).
- **RF-02:** El sistema debe permitir gestionar la información de los usuarios, incluyendo datos obligatorios y opcionales.
- **RF-03:** El sistema debe requerir datos obligatorios para la creación de usuarios.
- **RF-04:** El sistema debe permitir almacenar información adicional opcional de los usuarios.
- **RF-05:** El sistema debe almacenar Nombre, Apellido, Nombre de usuario, Email y Contraseña de forma obligatoria para cada usuario.
- **RF-06:** El sistema debe permitir almacenar DNI, Institución y Empresa de forma opcional para cada usuario.
- **RF-07:** El sistema debe permitir la importación y exportación de usuarios mediante archivos.
- **RF-08:** El sistema debe permitir al Administrador y Gestor visualizar la información de los usuarios.
- **RF-09:** El sistema debe permitir al Administrador y Gestor crear nuevos campos de información para usuarios.

### Gestión de Roles y Seguridad

- **RF-10:** El sistema debe tener únicamente un usuario con rol Administrador a nivel de Plataforma.
- **RF-11:** El sistema debe permitir a los usuarios tener rol de Administrador, Gestor o General a nivel de Plataforma.
- **RF-12:** El sistema debe permitir a los usuarios tener rol de Docente o Alumno a nivel de Curso.
- **RF-13:** El sistema debe permitir a los usuarios tener rol de Jefe o Integrante a nivel de Grupo.
- **RF-14:** Un usuario podrá tener distintos roles según el Curso al que pertenezca.
- **RF-15:** Un usuario podrá tener distintos roles según el Grupo al que pertenezca.
- **RF-16:** El sistema debe asignar rol de General a nivel de Plataforma a cada usuario nuevo que se crea.
- **RF-17:** El sistema debe permitir al Administrador cambiar el rol de cualquier usuario a nivel de Plataforma.
- **RF-18:** El sistema debe permitir al Administrador y Gestor crear nuevos roles a nivel de Plataforma, Curso y Grupo.

### Gestión de Cursos

- **RF-19:** El sistema debe permitir gestionar la información de los cursos.
- **RF-20:** El sistema debe permitir definir contenidos y estructura dentro de los cursos.
- **RF-21:** El sistema debe permitir al Administrador y Gestor crear Cursos.
- **RF-22:** El sistema debe permitir al Administrador y Gestor modificar Cursos.
- **RF-23:** El sistema debe permitir al Administrador y Gestor eliminar Cursos.

### Gestión de Inscripciones y Roles en Cursos

- **RF-24:** El sistema debe permitir al Administrador asignar cualquier usuario a los Cursos con rol de Docente o Alumno.
- **RF-25:** El sistema debe permitir al Gestor asignar usuarios de rol General a los Cursos con rol de Docente o Alumno.
- **RF-26:** El sistema debe permitir al Administrador modificar el rol de un Docente o Alumno dentro de un Curso.
- **RF-42:** El sistema debe registrar por usuario y Curso la fecha de inscripción, el estado de participación (`EN_CURSO` o `FINALIZADO`) y, al finalizar, la fecha de finalización.

### Gestión de Recompensas

- **RF-27:** El sistema debe permitir al Administrador y Gestor crear recompensas.
- **RF-28:** El sistema debe permitir al Administrador y Gestor modificar recompensas existentes.
- **RF-29:** El sistema debe permitir al Administrador y Gestor eliminar recompensas existentes.
- **RF-30:** El sistema debe permitir al Administrador y Gestor visualizar las recompensas disponibles en la plataforma.
- **RF-31:** El sistema debe requerir información obligatoria de una recompensa, incluyendo como mínimo nombre y descripción.
- **RF-32:** El sistema debe permitir al Administrador y Gestor vincular una recompensa con un curso o un grupo de cursos.
- **RF-33:** El sistema debe permitir al Administrador y Gestor modificar los cursos y grupos de cursos asociados a una recompensa.
- **RF-34:** El sistema debe permitir al Administrador y Gestor desvincular cursos y grupos de cursos de una recompensa.
- **RF-35:** El sistema debe otorgar una recompensa a un alumno cuando complete un curso asociado a dicha recompensa.
- **RF-36:** El sistema debe otorgar una recompensa a un alumno cuando complete todos los cursos asociados a dicha recompensa.
- **RF-37:** El sistema debe verificar el cumplimiento de las condiciones necesarias para obtener una recompensa antes de otorgarla.
- **RF-38:** El sistema debe registrar las recompensas obtenidas por cada alumno.
- **RF-39:** El sistema debe permitir a los alumnos visualizar las recompensas que hayan obtenido desde su perfil.
- **RF-40:** El sistema debe mostrar para cada recompensa obtenida información relevante, incluyendo como mínimo su nombre, descripción y fecha de obtención.
- **RF-41:** El sistema debe permitir configurar si una recompensa puede ser obtenida una única vez o múltiples veces por un mismo alumno.

## Trazabilidad entre requerimientos e historias de usuario

| Requerimiento | Historia(s) de usuario |
| --- | --- |
| RF-01 | H1 |
| RF-02 | H1 |
| RF-03 | H1 |
| RF-04 | H1 |
| RF-05 | H1 |
| RF-06 | H1 |
| RF-07 | H2 |
| RF-08 | H3 |
| RF-09 | H3 |
| RF-10 | H4 |
| RF-11 | H4 |
| RF-12 | H4 |
| RF-13 | H4 |
| RF-14 | H4 |
| RF-15 | H4 |
| RF-16 | H5 |
| RF-17 | H5 |
| RF-18 | H5 |
| RF-19 | H7 |
| RF-20 | H7 |
| RF-21 | H7 |
| RF-22 | H7 |
| RF-23 | H7 |
| RF-24 | H6 |
| RF-25 | H6 |
| RF-26 | H6 |
| RF-42 | H6 |
| RF-27 | H8 |
| RF-28 | H8 |
| RF-29 | H8 |
| RF-30 | H8 |
| RF-31 | H8 |
| RF-32 | H9 |
| RF-33 | H9 |
| RF-34 | H9 |
| RF-35 | H10 |
| RF-36 | H10 |
| RF-37 | H10 |
| RF-38 | H11 |
| RF-39 | H11 |
| RF-40 | H11 |
| RF-41 | H12 |

## Reglas de negocio

Las siguientes reglas se derivan de los requerimientos funcionales RF-01–RF-42 especificados en este documento:

- Debe existir un único usuario con rol Administrador a nivel de Plataforma.
- Todo usuario nuevo recibe el rol General de Plataforma.
- Los roles se asignan en los ámbitos de Plataforma, Curso y Grupo. Un usuario puede tener roles diferentes según el curso o grupo.
- Solo el Administrador puede cambiar el rol de Plataforma de cualquier usuario.
- Un Gestor asigna a cursos únicamente usuarios que tengan rol General; el Administrador puede asignar cualquier usuario.
- Una recompensa requiere nombre y descripción como mínimo y puede asociarse a un curso o a un grupo de cursos.
- El sistema verifica las condiciones de la recompensa antes de otorgarla.
- Una recompensa vinculada a varios cursos se otorga al completar todos los cursos asociados.
- Cada regla de una recompensa representa una alternativa: se cumple cuando se finalizaron todos los cursos asociados a esa regla; basta con que se cumpla una regla para que la recompensa sea elegible.
- La recompensa puede configurarse para obtenerse una o varias veces por alumno y cada obtención se registra con su fecha.

## Requisitos no funcionales

- **RNF-01 — Autenticación:** autenticar a los usuarios mediante nombre de usuario y contraseña.
- **RNF-02 — Protección de credenciales:** almacenar las contraseñas de forma encriptada.
- **RNF-03 — Disponibilidad:** mantener una disponibilidad de al menos el 99%.
- **RNF-04 — Rendimiento:** responder a las solicitudes en menos de 3 segundos en condiciones normales.
- **RNF-05 — Usabilidad:** ofrecer una interfaz intuitiva y fácil de usar.
- **RNF-06 — Escalabilidad:** permitir el crecimiento en usuarios, cursos y recursos sin degradación significativa del rendimiento.
- **RNF-07 — Mantenibilidad:** mantener un diseño modular que facilite el mantenimiento y la evolución.
- **RNF-08 — Integridad:** garantizar la consistencia de los datos almacenados.
- **RNF-09 — Compatibilidad:** poder ejecutarse en navegadores web modernos.
- **RNF-10 — Respaldo:** realizar copias de seguridad periódicas de la información.

## Criterios de aceptación del producto

- Se gestionan usuarios, cursos y contenidos sin errores.
- Las funciones principales se habilitan de acuerdo con el rol del usuario.
- La navegación y el acceso a contenidos son claros.
- Se pueden crear cursos con secciones y recursos.
- Las operaciones básicas de creación, modificación y eliminación responden correctamente.

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
