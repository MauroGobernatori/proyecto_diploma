import {
  EstadoCurso,
  EstadoEntregaActividad,
  EstadoRecompensa,
  EstadoUsuarioCurso,
  NivelRol,
  Prisma,
  PrismaClient,
  TipoActividad,
  TipoRecurso,
} from '@prisma/client'
import { hashPassword } from '../lib/security/passwords'

const prisma = new PrismaClient()

const cursoNombre = 'Demo de actividades y reporte'
const textoPagina = 'Este es un recurso de página de contenido donde se podrá insertar el texto que se quiera.'

async function obtenerOCrearRol(nombre: string, nivel: NivelRol) {
  return prisma.rol.upsert({
    where: { nombre_nivel: { nombre, nivel } },
    update: { esSistema: true },
    create: { nombre, nivel, esSistema: true },
  })
}

async function obtenerOCrearUsuario({
  usuario,
  email,
  nombre,
  apellido,
  password,
}: {
  usuario: string
  email: string
  nombre: string
  apellido: string
  password: string
}) {
  const existente = await prisma.usuario.findFirst({
    where: { OR: [{ usuario }, { email }] },
  })
  if (existente) return existente

  return prisma.usuario.create({
    data: {
      usuario,
      email,
      nombre,
      apellido,
      contraseniaHash: await hashPassword(password),
      activo: true,
    },
  })
}

async function asegurarRolUsuario(usuarioId: string, rolId: string, cursoId: string | null = null) {
  const existente = await prisma.usuarioRol.findFirst({
    where: { usuarioId, rolId, cursoId, grupoId: null },
    select: { id: true },
  })
  if (!existente) {
    await prisma.usuarioRol.create({
      data: { usuarioId, rolId, cursoId, grupoId: null },
    })
  }
}

async function obtenerOCrearRecurso({
  seccionId,
  padreId = null,
  nombre,
  descripcion,
  tipo,
  orden,
  contenido = null,
}: {
  seccionId: string
  padreId?: string | null
  nombre: string
  descripcion?: string
  tipo: TipoRecurso
  orden: number
  contenido?: string | null
}) {
  const existente = await prisma.recurso.findFirst({
    where: { seccionId, padreId, nombre, tipo },
  })
  if (existente) {
    if (tipo === TipoRecurso.PAGINA_CONTENIDO && existente.contenido !== contenido) {
      return prisma.recurso.update({
        where: { id: existente.id },
        data: { contenido },
      })
    }
    return existente
  }

  return prisma.recurso.create({
    data: {
      seccionId,
      padreId,
      nombre,
      descripcion,
      contenido,
      tipo,
      orden,
      visibilidad: true,
      estado: true,
    },
  })
}

async function obtenerOCrearActividad({
  recursoId,
  tipo,
  opciones,
  respuestaCorrecta,
}: {
  recursoId: string
  tipo: TipoActividad
  opciones?: Prisma.InputJsonValue
  respuestaCorrecta?: string
}) {
  return prisma.actividad.upsert({
    where: { recursoId },
    update: {},
    create: { recursoId, tipo, opciones, respuestaCorrecta },
  })
}

async function asegurarEntrega({
  actividadId,
  usuarioId,
  respuesta,
  nota,
  diasAtras,
  corregidaPorId = null,
}: {
  actividadId: string
  usuarioId: string
  respuesta: string
  nota: number | null
  diasAtras: number
  corregidaPorId?: string | null
}) {
  const fechaEntrega = new Date(Date.now() - diasAtras * 24 * 60 * 60 * 1000)
  const estado = nota === null ? EstadoEntregaActividad.ENTREGADA : EstadoEntregaActividad.RESUELTA
  await prisma.actividadEntrega.upsert({
    where: { actividadId_usuarioId: { actividadId, usuarioId } },
    update: {},
    create: {
      actividadId,
      usuarioId,
      respuesta,
      estado,
      nota,
      fechaEntrega,
      fechaCorreccion: nota === null ? null : fechaEntrega,
      corregidaPorId,
    },
  })
}

async function main() {
  console.log('Agregando datos de demostración de forma idempotente; no se eliminan registros.')

  const passwordAdmin = process.env.SEED_ADMIN_PASSWORD
  const passwordDemo = process.env.SEED_STUDENT_PASSWORD
  if (!passwordDemo || passwordDemo.length < 12) {
    throw new Error('Definí SEED_STUDENT_PASSWORD con al menos 12 caracteres para crear las cuentas demo.')
  }

  const permisosData = [
    { nombre: 'Crear usuario', clave: 'usuario:crear', categoria: 'Gestión de Usuarios' },
    { nombre: 'Modificar usuario', clave: 'usuario:modificar', categoria: 'Gestión de Usuarios' },
    { nombre: 'Eliminar usuario', clave: 'usuario:eliminar', categoria: 'Gestión de Usuarios' },
    { nombre: 'Crear curso', clave: 'curso:crear', categoria: 'Gestión de Cursos' },
    { nombre: 'Modificar curso', clave: 'curso:modificar', categoria: 'Gestión de Cursos' },
    { nombre: 'Eliminar curso', clave: 'curso:eliminar', categoria: 'Gestión de Cursos' },
    { nombre: 'Gestionar inscripciones', clave: 'curso:inscripcion:gestionar', categoria: 'Gestión de Cursos' },
    { nombre: 'Crear grupo', clave: 'grupo:crear', categoria: 'Gestión de Grupos' },
    { nombre: 'Modificar grupo', clave: 'grupo:modificar', categoria: 'Gestión de Grupos' },
    { nombre: 'Eliminar grupo', clave: 'grupo:eliminar', categoria: 'Gestión de Grupos' },
    { nombre: 'Crear recompensa', clave: 'recompensa:crear', categoria: 'Gestión de Recompensas' },
    { nombre: 'Modificar recompensa', clave: 'recompensa:modificar', categoria: 'Gestión de Recompensas' },
    { nombre: 'Eliminar recompensa', clave: 'recompensa:eliminar', categoria: 'Gestión de Recompensas' },
    { nombre: 'Crear sección', clave: 'seccion:crear', categoria: 'Contenido de cursos' },
    { nombre: 'Modificar sección', clave: 'seccion:modificar', categoria: 'Contenido de cursos' },
    { nombre: 'Eliminar sección', clave: 'seccion:eliminar', categoria: 'Contenido de cursos' },
    { nombre: 'Crear recurso', clave: 'recurso:crear', categoria: 'Contenido de cursos' },
    { nombre: 'Modificar recurso', clave: 'recurso:modificar', categoria: 'Contenido de cursos' },
    { nombre: 'Eliminar recurso', clave: 'recurso:eliminar', categoria: 'Contenido de cursos' },
    { nombre: 'Ver recursos ocultos', clave: 'recurso:oculto:ver', categoria: 'Contenido de cursos' },
    { nombre: 'Descargar reporte de curso', clave: 'reporte:curso:descargar', categoria: 'Reportes' },
    { nombre: 'Entregar actividad', clave: 'actividad:entregar', categoria: 'Actividades' },
    { nombre: 'Corregir actividad', clave: 'actividad:corregir', categoria: 'Actividades' },
  ]

  const permisos = await Promise.all(permisosData.map((permiso) =>
    prisma.permiso.upsert({
      where: { clave: permiso.clave },
      update: { nombre: permiso.nombre, categoria: permiso.categoria },
      create: permiso,
    })
  ))
  const [rolAdmin, rolGestor, rolGeneral, rolDocente, rolAlumno] = await Promise.all([
    obtenerOCrearRol('Administrador', NivelRol.PLATAFORMA),
    obtenerOCrearRol('Gestor', NivelRol.PLATAFORMA),
    obtenerOCrearRol('General', NivelRol.PLATAFORMA),
    obtenerOCrearRol('Docente', NivelRol.CURSO),
    obtenerOCrearRol('Alumno', NivelRol.CURSO),
  ])
  await Promise.all([
    obtenerOCrearRol('Jefe', NivelRol.GRUPO),
    obtenerOCrearRol('Integrante', NivelRol.GRUPO),
  ])

  const permisosAdmin = permisos.map(({ id }) => ({ rolId: rolAdmin.id, permisoId: id }))
  const permisosContenido = permisos.filter(({ clave }) => [
    'seccion:crear', 'seccion:modificar', 'seccion:eliminar',
    'recurso:crear', 'recurso:modificar', 'recurso:eliminar',
    'recurso:oculto:ver', 'reporte:curso:descargar', 'actividad:corregir',
  ].includes(clave))
  const permisosCurso = permisos.filter(({ clave }) => [
    'curso:crear', 'curso:modificar', 'curso:eliminar', 'curso:inscripcion:gestionar',
  ].includes(clave))
  const permisoEntregar = permisos.find(({ clave }) => clave === 'actividad:entregar')
  await Promise.all([
    prisma.rolPermiso.createMany({ data: permisosAdmin, skipDuplicates: true }),
    prisma.rolPermiso.createMany({
      data: [rolGestor, rolDocente].flatMap((rol) => permisosContenido.map(({ id }) => ({ rolId: rol.id, permisoId: id }))),
      skipDuplicates: true,
    }),
    prisma.rolPermiso.createMany({
      data: permisosCurso.map(({ id }) => ({ rolId: rolGestor.id, permisoId: id })),
      skipDuplicates: true,
    }),
    permisoEntregar
      ? prisma.rolPermiso.createMany({ data: [{ rolId: rolAlumno.id, permisoId: permisoEntregar.id }], skipDuplicates: true })
      : Promise.resolve({ count: 0 }),
  ])

  let asignacionAdmin = await prisma.usuarioRol.findFirst({
    where: { cursoId: null, grupoId: null, rol: { nombre: 'Administrador', nivel: NivelRol.PLATAFORMA } },
    select: { usuarioId: true },
  })
  if (!asignacionAdmin) {
    if (!passwordAdmin || passwordAdmin.length < 12) {
      throw new Error('No hay Administrador global. Definí SEED_ADMIN_PASSWORD con al menos 12 caracteres para crear la cuenta inicial.')
    }
    const admin = await obtenerOCrearUsuario({
      usuario: 'admin_demo',
      email: 'admin_demo@example.test',
      nombre: 'Administrador',
      apellido: 'Demo',
      password: passwordAdmin,
    })
    await asegurarRolUsuario(admin.id, rolAdmin.id)
    asignacionAdmin = { usuarioId: admin.id }
  }

  const curso = await prisma.curso.findFirst({ where: { nombre: cursoNombre } }) ?? await prisma.curso.create({
    data: {
      nombre: cursoNombre,
      descripcion: 'Curso de demostración para revisar entregas, notas y el reporte en Excel.',
      estado: EstadoCurso.EN_CURSO,
      fechaInicio: new Date(),
      fechaFin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      visibilidad: true,
      matriculacionLibre: true,
    },
  })
  const seccion = await prisma.seccion.findFirst({ where: { cursoId: curso.id, nombre: 'Contenido de demostración' } }) ?? await prisma.seccion.create({
    data: { cursoId: curso.id, nombre: 'Contenido de demostración', orden: 1 },
  })

  const adminDemo = await prisma.usuario.findUnique({ where: { id: asignacionAdmin.usuarioId } })
  if (!adminDemo) throw new Error('No se encontró la cuenta Administrador global.')
  const docente = await obtenerOCrearUsuario({
    usuario: 'docente_reporte',
    email: 'docente_reporte@example.test',
    nombre: 'Docente',
    apellido: 'Demo',
    password: passwordDemo,
  })
  await asegurarRolUsuario(docente.id, rolGeneral.id)
  await asegurarRolUsuario(docente.id, rolDocente.id, curso.id)

  const estudiantes = await Promise.all([
    obtenerOCrearUsuario({ usuario: 'alumno_reporte_1', email: 'alumno_reporte_1@example.test', nombre: 'Ana', apellido: 'Demo', password: passwordDemo }),
    obtenerOCrearUsuario({ usuario: 'alumno_reporte_2', email: 'alumno_reporte_2@example.test', nombre: 'Bruno', apellido: 'Demo', password: passwordDemo }),
    obtenerOCrearUsuario({ usuario: 'alumno_reporte_3', email: 'alumno_reporte_3@example.test', nombre: 'Carla', apellido: 'Demo', password: passwordDemo }),
  ])
  await Promise.all(estudiantes.map(async (estudiante, indice) => {
    await asegurarRolUsuario(estudiante.id, rolGeneral.id)
    await asegurarRolUsuario(estudiante.id, rolAlumno.id, curso.id)
    await prisma.usuarioCurso.upsert({
      where: { usuarioId_cursoId: { usuarioId: estudiante.id, cursoId: curso.id } },
      update: {},
      create: {
        usuarioId: estudiante.id,
        cursoId: curso.id,
        estado: indice === 0 ? EstadoUsuarioCurso.FINALIZADO : EstadoUsuarioCurso.EN_CURSO,
        fechaFinalizacion: indice === 0 ? new Date() : null,
      },
    })
  }))

  await obtenerOCrearRecurso({
    seccionId: seccion.id,
    nombre: 'Página de contenido de ejemplo',
    descripcion: 'Recurso de demostración con texto editable.',
    contenido: textoPagina,
    tipo: TipoRecurso.PAGINA_CONTENIDO,
    orden: 1,
  })
  const leccion = await obtenerOCrearRecurso({
    seccionId: seccion.id,
    nombre: 'Lección de demostración',
    descripcion: 'Contiene preguntas de autocorrección y respuesta abierta.',
    tipo: TipoRecurso.LECCION,
    orden: 2,
  })
  const evaluacion = await obtenerOCrearRecurso({
    seccionId: seccion.id,
    nombre: 'Evaluación de demostración',
    descripcion: 'Incluye una pregunta objetiva.',
    tipo: TipoRecurso.EVALUACION,
    orden: 3,
  })

  const recursoOpcion = await obtenerOCrearRecurso({
    seccionId: seccion.id,
    padreId: leccion.id,
    nombre: 'Opción múltiple: arquitectura',
    descripcion: 'Elegí la opción correcta.',
    tipo: TipoRecurso.ACTIVIDAD,
    orden: 1,
  })
  const actividadOpcion = await obtenerOCrearActividad({
    recursoId: recursoOpcion.id,
    tipo: TipoActividad.OPCION_MULTIPLE,
    opciones: [{ id: 'a', texto: 'Una estructura organizada de componentes' }, { id: 'b', texto: 'Una lista de contraseñas' }],
    respuestaCorrecta: 'a',
  })
  const recursoVerdaderoFalso = await obtenerOCrearRecurso({ seccionId: seccion.id, padreId: leccion.id, nombre: 'Verdadero o falso: permisos', descripcion: 'Respondé verdadero o falso.', tipo: TipoRecurso.ACTIVIDAD, orden: 2 })
  const actividadVerdaderoFalso = await obtenerOCrearActividad({ recursoId: recursoVerdaderoFalso.id, tipo: TipoActividad.VERDADERO_FALSO, respuestaCorrecta: 'true' })
  const recursoAbierto = await obtenerOCrearRecurso({ seccionId: seccion.id, padreId: leccion.id, nombre: 'Respuesta abierta: aprendizaje', descripcion: 'Explicá brevemente tu respuesta.', tipo: TipoRecurso.ACTIVIDAD, orden: 3 })
  const actividadAbierta = await obtenerOCrearActividad({ recursoId: recursoAbierto.id, tipo: TipoActividad.RESPUESTA_ABIERTA })
  const recursoEvaluacion = await obtenerOCrearRecurso({ seccionId: seccion.id, padreId: evaluacion.id, nombre: 'Opción múltiple: evaluación', descripcion: 'Pregunta de evaluación.', tipo: TipoRecurso.ACTIVIDAD, orden: 1 })
  const actividadEvaluacion = await obtenerOCrearActividad({
    recursoId: recursoEvaluacion.id,
    tipo: TipoActividad.OPCION_MULTIPLE,
    opciones: [{ id: 'a', texto: 'Respuesta incorrecta' }, { id: 'b', texto: 'Respuesta correcta' }],
    respuestaCorrecta: 'b',
  })

  await Promise.all([
    asegurarEntrega({ actividadId: actividadOpcion.id, usuarioId: estudiantes[0].id, respuesta: 'a', nota: 10, diasAtras: 8 }),
    asegurarEntrega({ actividadId: actividadVerdaderoFalso.id, usuarioId: estudiantes[0].id, respuesta: 'true', nota: 10, diasAtras: 7 }),
    asegurarEntrega({ actividadId: actividadAbierta.id, usuarioId: estudiantes[0].id, respuesta: 'Permite organizar el contenido y las actividades del curso.', nota: 8.5, diasAtras: 6, corregidaPorId: docente.id }),
    asegurarEntrega({ actividadId: actividadEvaluacion.id, usuarioId: estudiantes[0].id, respuesta: 'a', nota: 0, diasAtras: 5 }),
    asegurarEntrega({ actividadId: actividadOpcion.id, usuarioId: estudiantes[1].id, respuesta: 'b', nota: 0, diasAtras: 4 }),
    asegurarEntrega({ actividadId: actividadVerdaderoFalso.id, usuarioId: estudiantes[1].id, respuesta: 'true', nota: 10, diasAtras: 3 }),
    asegurarEntrega({ actividadId: actividadAbierta.id, usuarioId: estudiantes[1].id, respuesta: 'Mi respuesta necesita corrección del docente.', nota: null, diasAtras: 2 }),
    asegurarEntrega({ actividadId: actividadOpcion.id, usuarioId: estudiantes[2].id, respuesta: 'a', nota: 10, diasAtras: 1 }),
  ])

  const nombreRecompensa = 'Recompensa demo del reporte'
  let recompensa = await prisma.recompensa.findFirst({ where: { nombre: nombreRecompensa } })
  if (!recompensa) {
    const fechaHabilitacion = new Date()
    const fechaInhabilitacion = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    recompensa = await prisma.recompensa.create({
      data: {
        nombre: nombreRecompensa,
        descripcion: 'Recompensa de demostración asociada al curso de prueba.',
        fechaHabilitacion,
        fechaInhabilitacion,
        otorgamientoMultiple: false,
        estado: EstadoRecompensa.ACTIVO,
        reglas: {
          create: [{ nombre: 'Regla curso de demostración', cursos: { connect: [{ id: curso.id }] } }],
        },
      },
    })
  }
  const recompensaObtenida = await prisma.recompensaObtenida.findFirst({
    where: { usuarioId: estudiantes[0].id, recompensaId: recompensa.id },
  })
  if (!recompensaObtenida) {
    await prisma.recompensaObtenida.create({ data: { usuarioId: estudiantes[0].id, recompensaId: recompensa.id } })
  }

  console.log(`Seed listo: ${curso.nombre}; 3 alumnos, una página, una lección, una evaluación y entregas de muestra.`)
  console.log(`Administrador de demostración: ${adminDemo.usuario}; las contraseñas provienen de las variables SEED_* y no se imprimen.`)
}

main()
  .catch((error) => {
    console.error('Error al ejecutar el seed:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
