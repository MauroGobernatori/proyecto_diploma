import { PrismaClient, RolPlataforma, RolCurso, EstadoCurso, EstadoRecompensa } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando carga de datos de prueba (Seed)...')

  // 1. Limpiar base de datos
  await prisma.recompensaObtenida.deleteMany()
  await prisma.recompensa.deleteMany()
  await prisma.recurso.deleteMany()
  await prisma.seccion.deleteMany()
  await prisma.usuarioCurso.deleteMany()
  await prisma.curso.deleteMany()
  await prisma.usuario.deleteMany()

  // 2. Crear Usuarios
  const admin = await prisma.usuario.create({
    data: {
      usuario: 'admin',
      contrasenia: 'admin123', // En desarrollo real va encriptado con bcrypt
      nombre: 'Mauro',
      apellido: 'Admin',
      email: 'admin@hunko.com',
      rolPlataforma: RolPlataforma.ADMINISTRADOR,
      empresa: 'Hunko Education',
    },
  })

  const gestor = await prisma.usuario.create({
    data: {
      usuario: 'gestor',
      contrasenia: 'gestor123',
      nombre: 'Pablo',
      apellido: 'Audoglio',
      email: 'gestor@hunko.com',
      rolPlataforma: RolPlataforma.GESTOR,
      empresa: 'Hunko Education',
    },
  })

  const alumno = await prisma.usuario.create({
    data: {
      usuario: 'alumno1',
      contrasenia: 'alumno123',
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan.perez@empresa.com',
      rolPlataforma: RolPlataforma.GENERAL,
      empresa: 'Empresa Cliente S.A.',
    },
  })

  // 3. Crear Cursos
  const cursoIngSoftware = await prisma.curso.create({
    data: {
      nombre: 'Ingeniería de Software II',
      descripcion: 'Curso sobre metodologías ágiles, UML y arquitectura.',
      estado: EstadoCurso.EN_CURSO,
      secciones: {
        create: [
          {
            nombre: 'Sección 1: Introducción',
            orden: 1,
            recursos: {
              create: [
                { nombre: 'Video de bienvenida', tipo: 'Video', orden: 1 },
                { nombre: 'Documento de requerimientos', tipo: 'Documento', orden: 2 },
              ],
            },
          },
        ],
      },
    },
  })

  const cursoBasesDatos = await prisma.curso.create({
    data: {
      nombre: 'Bases de Datos II',
      descripcion: 'Diseño y optimización de bases de datos relacionales con PostgreSQL.',
      estado: EstadoCurso.EN_CURSO,
    },
  })

  // 4. Inscribir Alumno y Docente en Cursos
  await prisma.usuarioCurso.createMany({
    data: [
      { usuarioId: alumno.id, cursoId: cursoIngSoftware.id, rol: RolCurso.ALUMNO },
      { usuarioId: alumno.id, cursoId: cursoBasesDatos.id, rol: RolCurso.ALUMNO },
      { usuarioId: gestor.id, cursoId: cursoIngSoftware.id, rol: RolCurso.DOCENTE },
    ],
  })

  // 5. Crear Recompensas
  const hoy = new Date()
  const unMesDespues = new Date()
  unMesDespues.setMonth(hoy.getMonth() + 1)

  const recompensaDiaLibre = await prisma.recompensa.create({
    data: {
      nombre: '1 Día Libre',
      descripcion: 'Otorgado al completar el curso de Ingeniería de Software.',
      fechaHabilitacion: hoy,
      fechaInhabilitacion: unMesDespues,
      otorgamientoMultiple: false,
      estado: EstadoRecompensa.ACTIVO,
      cursos: {
        connect: [{ id: cursoIngSoftware.id }],
      },
    },
  })

  const recompensaCupon = await prisma.recompensa.create({
    data: {
      nombre: 'Cupón 10% Descuento en Local Gastronómico',
      descripcion: 'Otorgado al completar el programa completo (Ing. Software y Bases de Datos).',
      fechaHabilitacion: hoy,
      fechaInhabilitacion: unMesDespues,
      otorgamientoMultiple: false,
      estado: EstadoRecompensa.ACTIVO,
      cursos: {
        connect: [{ id: cursoIngSoftware.id }, { id: cursoBasesDatos.id }],
      },
    },
  })

  // 6. Otorgar una Recompensa de prueba al Alumno
  await prisma.recompensaObtenida.create({
    data: {
      usuarioId: alumno.id,
      recompensaId: recompensaDiaLibre.id,
    },
  })

  console.log('Seed ejecutado con éxito. Datos creados en Supabase.')
}

main()
  .catch((e) => {
    console.error('Error durante el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })