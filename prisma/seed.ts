import {
  PrismaClient,
  NivelRol,
  EstadoCurso,
  TipoRecurso,
  EstadoRecompensa,
} from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando carga de datos de prueba (Seed)...')

  // 1. Limpieza de base de datos (orden inverso a las dependencias)
  await prisma.reporte.deleteMany()
  await prisma.recompensaObtenida.deleteMany()
  await prisma.recompensa.deleteMany()
  await prisma.recurso.deleteMany()
  await prisma.seccion.deleteMany()
  await prisma.usuarioRol.deleteMany()
  await prisma.rolPermiso.deleteMany()
  await prisma.permiso.deleteMany()
  await prisma.rol.deleteMany()
  await prisma.curso.deleteMany()
  await prisma.grupo.deleteMany()
  await prisma.usuario.deleteMany()

  // 2. Crear Permisos Básicos de la Plataforma
  const permisosData = [
    { nombre: 'Crear usuario', clave: 'usuario:crear', categoria: 'Gestión de Usuarios' },
    { nombre: 'Modificar usuario', clave: 'usuario:modificar', categoria: 'Gestión de Usuarios' },
    { nombre: 'Eliminar usuario', clave: 'usuario:eliminar', categoria: 'Gestión de Usuarios' },
    { nombre: 'Crear curso', clave: 'curso:crear', categoria: 'Gestión de Cursos' },
    { nombre: 'Modificar curso', clave: 'curso:modificar', categoria: 'Gestión de Cursos' },
    { nombre: 'Eliminar curso', clave: 'curso:eliminar', categoria: 'Gestión de Cursos' },
    { nombre: 'Crear grupo', clave: 'grupo:crear', categoria: 'Gestión de Grupos' },
    { nombre: 'Modificar grupo', clave: 'grupo:modificar', categoria: 'Gestión de Grupos' },
    { nombre: 'Eliminar grupo', clave: 'grupo:eliminar', categoria: 'Gestión de Grupos' },
    { nombre: 'Crear recompensa', clave: 'recompensa:crear', categoria: 'Gestión de Recompensas' },
    { nombre: 'Modificar recompensa', clave: 'recompensa:modificar', categoria: 'Gestión de Recompensas' },
    { nombre: 'Eliminar recompensa', clave: 'recompensa:eliminar', categoria: 'Gestión de Recompensas' },
  ]

  const permisosCreados = await Promise.all(
    permisosData.map((p) => prisma.permiso.create({ data: p }))
  )

  // 3. Crear Roles Base del Sistema (Nivel Plataforma, Curso y Grupo)
  const rolAdmin = await prisma.rol.create({
    data: {
      nombre: 'Administrador',
      nivel: NivelRol.PLATAFORMA,
      esSistema: true,
    },
  })

  const rolGestor = await prisma.rol.create({
    data: {
      nombre: 'Gestor',
      nivel: NivelRol.PLATAFORMA,
      esSistema: true,
    },
  })

  const rolGeneral = await prisma.rol.create({
    data: {
      nombre: 'General',
      nivel: NivelRol.PLATAFORMA,
      esSistema: true,
    },
  })

  const rolDocente = await prisma.rol.create({
    data: {
      nombre: 'Docente',
      nivel: NivelRol.CURSO,
      esSistema: true,
    },
  })

  const rolAlumno = await prisma.rol.create({
    data: {
      nombre: 'Alumno',
      nivel: NivelRol.CURSO,
      esSistema: true,
    },
  })

  const rolJefe = await prisma.rol.create({
    data: {
      nombre: 'Jefe',
      nivel: NivelRol.GRUPO,
      esSistema: true,
    },
  })

  const rolIntegrante = await prisma.rol.create({
    data: {
      nombre: 'Integrante',
      nivel: NivelRol.GRUPO,
      esSistema: true,
    },
  })

  // 4. Asignar TODOS los permisos al Rol Administrador
  await prisma.rolPermiso.createMany({
    data: permisosCreados.map((permiso) => ({
      rolId: rolAdmin.id,
      permisoId: permiso.id,
    })),
  })

  // 5. Crear Usuario Administrador Único
  const adminUsuario = await prisma.usuario.create({
    data: {
      usuario: 'admin',
      contrasenia: 'admin123', // En producción se almacena con hash (bcrypt/argon2)
      nombre: 'Mauro',
      apellido: 'Gobernatori',
      email: 'admin@hunko.com',
      empresa: 'Hunko Education',
      activo: true,
    },
  })

  // Asignarle el rol de Administrador de Plataforma
  await prisma.usuarioRol.create({
    data: {
      usuarioId: adminUsuario.id,
      rolId: rolAdmin.id,
    },
  })

  // 6. Crear Usuario Alumno de prueba (para probar flujos de alumno/demo)
  const alumnoUsuario = await prisma.usuario.create({
    data: {
      usuario: 'alumno1',
      contrasenia: 'alumno123',
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan.perez@empresa.com',
      empresa: 'Empresa Cliente S.A.',
      activo: true,
    },
  })

  await prisma.usuarioRol.create({
    data: {
      usuarioId: alumnoUsuario.id,
      rolId: rolGeneral.id,
    },
  })

  // 7. Crear 1 Curso Demo con Contenido
  const cursoDemo = await prisma.curso.create({
    data: {
      nombre: 'Ingeniería de Software II',
      descripcion: 'Curso sobre metodologías ágiles, UML y arquitectura de software.',
      estado: EstadoCurso.EN_CURSO,
      visibilidad: true,
      matriculacionLibre: true,
      secciones: {
        create: [
          {
            nombre: 'Unidad 1: Requerimientos y Casos de Uso',
            orden: 1,
            recursos: {
              create: [
                {
                  nombre: 'Especificación de Requerimientos',
                  descripcion: 'Documento en PDF con RF y RNF',
                  tipo: TipoRecurso.DOCUMENTO,
                  orden: 1,
                },
                {
                  nombre: 'Clase Grabada - Casos de Uso',
                  tipo: TipoRecurso.VIDEO,
                  url: 'https://youtube.com/watch?v=demo',
                  orden: 2,
                },
              ],
            },
          },
        ],
      },
    },
  })

  // Inscribir al Alumno en el Curso Demo con rol ALUMNO
  await prisma.usuarioRol.create({
    data: {
      usuarioId: alumnoUsuario.id,
      rolId: rolAlumno.id,
      cursoId: cursoDemo.id,
    },
  })

  // Inscribir al Admin en el Curso Demo como DOCENTE
  await prisma.usuarioRol.create({
    data: {
      usuarioId: adminUsuario.id,
      rolId: rolDocente.id,
      cursoId: cursoDemo.id,
    },
  })

  // 8. Crear 1 Recompensa Demo asociada al Curso
  const hoy = new Date()
  const unMesDespues = new Date()
  unMesDespues.setMonth(hoy.getMonth() + 1)

  const recompensaDemo = await prisma.recompensa.create({
    data: {
      nombre: '1 Día Libre',
      descripcion: 'Beneficio otorgado por finalizar con éxito el curso de Ingeniería de Software II.',
      fechaHabilitacion: hoy,
      fechaInhabilitacion: unMesDespues,
      otorgamientoMultiple: false,
      requiereTodosLosCursos: false,
      estado: EstadoRecompensa.ACTIVO,
      cursos: {
        connect: [{ id: cursoDemo.id }],
      },
    },
  })

  // 9. Asignar Recompensa al Alumno (Demo de otorgamiento)
  await prisma.recompensaObtenida.create({
    data: {
      usuarioId: alumnoUsuario.id,
      recompensaId: recompensaDemo.id,
    },
  })

  console.log('Seed ejecutado con éxito. Base de datos poblada.')
}

main()
  .catch((e) => {
    console.error('Error al ejecutar el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })