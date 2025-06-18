import { PrismaClient, Language } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// ----------------------------------------------------------------------

const prisma = new PrismaClient();
const bcryptSaltRounds = 10;

// ----------------------------------------------------------------------

// Logger profesional con niveles de severidad
const logger = {
  info: (message: string) =>
    console.log(`ℹ️ [INFO] ${new Date().toISOString()} - ${message}`),
  warn: (message: string) =>
    console.warn(`⚠️ [WARN] ${new Date().toISOString()} - ${message}`),
  error: (message: string, error?: any) => {
    console.error(`⛔ [ERROR] ${new Date().toISOString()} - ${message}`);
    if (error) console.error(error);
  },
  success: (message: string) =>
    console.log(`✅ [SUCCESS] ${new Date().toISOString()} - ${message}`),
};

// Interfaz para representar ítems de código jerárquico
interface CodeItem {
  fullPath: string;
  numberPath: string;
  name: string;
  level: number;
  parentPath?: string;
}

// Limpieza de datos en orden seguro para FK
async function cleanDatabase() {
  logger.info('🧹 Starting database cleanup...');

  const deleteOrder = [
    'registro',
    'registro_diario',
    'operador',
    'usuario',
    'rol_permiso',
    'persona',
    'permiso',
    'rol',
    'codigo',
    'seccion',
    'grupo_edad',
    'company',
  ];

  for (const model of deleteOrder) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${model}" CASCADE;`);
      logger.info(`🗑️ Truncated table: ${model}`);
    } catch (error) {
      logger.error(`Failed to truncate table ${model}`, error);
      throw error;
    }
  }

  logger.success('Database cleanup completed successfully');
}

// Creación de roles y permisos base
async function seedRolesAndPermissions() {
  logger.info('👮 Seeding roles and permissions...');

  const roles = [
    {
      id_rol: 1,
      nombre_rol: 'Admin',
      descripcion: 'Administrador del sistema',
    },
    {
      id_rol: 2,
      nombre_rol: 'Estadístico',
      descripcion: 'Usuario que registra datos diarios y genera reportes',
    },
  ];

  const permissions = [
    {
      id_permiso: 1,
      nombre_permiso: 'manage_system',
      descripcion: 'Administración del sistema',
    },
    {
      id_permiso: 2,
      nombre_permiso: 'view_reports',
      descripcion: 'Visualización de reportes estadísticos',
    },
    {
      id_permiso: 3,
      nombre_permiso: 'manage_data',
      descripcion: 'Gestión de datos maestros',
    },
    {
      id_permiso: 4,
      nombre_permiso: 'record_entries',
      descripcion: 'Registro de datos diarios',
    },
  ];

  const rolePermissions = [
    { id_rol: 1, id_permiso: 1 }, // Admin - manage_system
    { id_rol: 1, id_permiso: 3 }, // Admin - manage_data
    { id_rol: 2, id_permiso: 2 }, // Estadístico - view_reports
    { id_rol: 2, id_permiso: 4 }, // Estadístico - record_entries
  ];

  await prisma.rol.createMany({ data: roles });
  await prisma.permiso.createMany({ data: permissions });
  await prisma.rol_permiso.createMany({ data: rolePermissions });

  logger.success('Roles and permissions seeded');
}

// Creación de usuarios iniciales
async function seedUsers() {
  logger.info('👤 Seeding initial users...');

  const passwordAdmin = await bcrypt.hash('Admin1234', bcryptSaltRounds);

  // Personas
  const adminPersona = await prisma.persona.create({
    data: {
      nombre: 'Admin',
      apellido: 'Sistema',
      email: 'admin@estomatologia.cu',
      telefono: '+5300000000',
    },
  });

  // Usuarios
  await prisma.usuario.create({
    data: {
      id_usuario: adminPersona.id_persona,
      contrasena: passwordAdmin,
      id_rol: 1,
      language: Language.SPANISH,
    },
  });

  logger.success('Users seeded');
}

// Creación de grupos de edad
async function seedAgeGroups() {
  logger.info('👶 Seeding age groups...');

  const ageGroups = [
    {
      nombre_grupo_edad: 'Lactantes (0-2 años)',
      descripcion: 'Niños desde nacimiento hasta 2 años',
      edad_minima: 0,
      edad_maxima: 2,
    },
    {
      nombre_grupo_edad: 'Preescolares (3-5 años)',
      descripcion: 'Niños en edad preescolar',
      edad_minima: 3,
      edad_maxima: 5,
    },
    {
      nombre_grupo_edad: 'Escolares (6-11 años)',
      descripcion: 'Niños en edad escolar primaria',
      edad_minima: 6,
      edad_maxima: 11,
    },
    {
      nombre_grupo_edad: 'Adolescentes (12-18 años)',
      descripcion: 'Adolescentes y jóvenes',
      edad_minima: 12,
      edad_maxima: 18,
    },
    {
      nombre_grupo_edad: 'Adultos (19-64 años)',
      descripcion: 'Población adulta',
      edad_minima: 19,
      edad_maxima: 64,
    },
    {
      nombre_grupo_edad: 'Adultos mayores (65+ años)',
      descripcion: 'Personas de la tercera edad',
      edad_minima: 65,
      edad_maxima: null,
    },
  ];

  await prisma.grupo_edad.createMany({ data: ageGroups });
  logger.success('Age groups seeded');
}

// Función para parsear datos jerárquicos de códigos
function parseCodeData(data: string): CodeItem[] {
  logger.info('📝 Parsing hierarchical code data...');

  const lines = data
    .trim()
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const codeItems: CodeItem[] = [];

  for (const line of lines) {
    // Expresión robusta para manejar diferentes formatos de números
    const match = line.match(/^(\d+(?:\.\d+)*)\.\s+([\s\S]+)$/);

    if (!match) {
      logger.warn(`⚠️ Skipping malformed line: ${line}`);
      continue;
    }

    const numberPath = match[1];
    const name = match[2].trim();
    const level = numberPath.split('.').length;

    // Validar estructura numérica
    if (!/^\d+(\.\d+)*$/.test(numberPath)) {
      logger.warn(`⚠️ Invalid number format in: ${line}`);
      continue;
    }

    // Determinar parentPath para jerarquía
    const parentPath =
      level > 1 ? numberPath.split('.').slice(0, -1).join('.') : undefined;

    codeItems.push({
      fullPath: line,
      numberPath,
      name,
      level,
      parentPath,
    });
  }

  // Validación de integridad jerárquica
  const pathSet = new Set(codeItems.map((item) => item.numberPath));
  const missingParents = codeItems
    .filter((item) => item.parentPath && !pathSet.has(item.parentPath))
    .map((item) => item.fullPath);

  if (missingParents.length > 0) {
    logger.warn('⚠️ Found items with missing parents:');
    missingParents.forEach((path) => logger.warn(`  - ${path}`));
  }

  logger.info(`Parsed ${codeItems.length} valid code items`);
  return codeItems;
}

// Función para sembrar secciones y códigos
async function seedSectionsAndCodes() {
  logger.info('📊 Seeding sections and codes...');

  const codeData = `
1.	Grupos priorizados
1.1.	Embarazadas.
1.2.	Madres con hijos < 1 año.
1.3.	Personas con discapacidad.
1.3.1.	Discapacidad intelectual.
1.4.	Niños de Atención en el Hogar (NAHO)
1.5.	Escolares de Primaria.
1.6.	Escolares de Secundaria.
1.7.	Población de 15 a 18 años.
1.8.	Combatientes.
1.9.	Pre reclutas.
2.	Actividades de prevención.
2.1.	Aplicación de Laca Flúor.
2.2.	Enjuagatorio de Flúor.
2.3.	Control de Placa Dentobacteriana.
2.4.	Sellantes de Fosas y Fisuras.
2.5.	Act. Educativas en Consejería.
2.6.	Act. Educativas en Comunidad.
2.7.	Pesquisa activa del PDCB.
2.8.	Orientación integral a la familia o a grupos priorizados en el terreno.
3.	Consultas.
3.1.	Estomatología General Integral.
3.2.	Periodoncia.
3.3.	Ortodoncia.
3.4.	Prótesis.
3.5.	Cirugía Maxilofacial.
3.6.	Con Tratamiento de medicina natural y tradicional.
3.7.	En el terreno.
3.8.	Implantología.
3.9.	Urgencia.
4.	Examinados e ingresos.
4.1.	Examinados.
4.2.	No requieren tratamiento (NRT)
4.3.	Ingresos en Estomatología general integral.
4.4.	Ingresos en Periodoncia.
4.5.	Ingresos en Ortodoncia.
4.6.	Ingresos en Prótesis.
4.7.	De ello con implante.
4.8.	De ello Combatientes.
4.9.	De ello coronas espigas confeccionadas en clínicas.
4.10.	Ingresos en maxilofacial.
5.	Atención concluida.
5.1.	Estomatología General Integral.
5.2.	Periodoncia.
5.3.	Ortodoncia.
5.4.	Prótesis.
5.5.	De ello con implante,
5.6.	De ello combatiente.
5.7.	De ello coronas espigas confeccionadas en clínicas.
5.8.	Maxilofacial.
6.	Otras actividades realizadas.
6.1.	Extracciones dentales.
6.1.1.	Extracciones dentales de dientes temporales extoliados.
6.2.	Obturaciones de amalgama.
6.3.	Obturaciones de resina.
6.3.1.	Obturaciones de ionómero de vidrio tipo 2.
6.4.	Obturaciones temporales.
6.5.	Tartrectomía.
6.6.	TPR concluido.
6.7.	Pulpotomía concluida.
6.8.	Tto. Quirúrgico de periodoncia.
6.9.	Tto. De maxilofacial.
6.9.1.	De ello mayores.
6.10.	Impresiones de alginato (prótesis)
6.11.	Impresiones de alginato (ortodoncia)
6.12.	Número de implantes.
6.13.	Anestesias aplicadas.
6.14.	Paciente implantado en acto quirúrgico.
6.15.	Laserterapia.
6.16.	Total de pacientes con brackets colocados.
6.17.	Brackets colocados.
7.	Tratamiento de medicina natural y tradicional.
7.1.	Acupuntura.
7.2.	Fitoterapia.
7.3.	Apiterapia y propóleos.
7.4.	Homeopatía.
7.5.	Téc. Eléctri. (Electro magnetoter, Tens, Electro estimulo)
7.6.	Digitopuntura.
7.7.	Exodoncia por Acupuntura.
7.8.	Exodoncia por Homeopatía.
7.9.	Laserpuntura.
7.10.	Terapia floral.
8.	PDP del cáncer bucal.
8.1.	Examinados por el PDCB.
8.2.	Remitidos por el PDCB.
8.3.	Positivo.
8.4.	De ello Leucoplasias.
8.5.	De ello Otras Premalignidades.
9.	Laboratorio.
9.1.	Aparato de cromo-cobalto terminado.
  `.trim();

  const codeItems = parseCodeData(codeData);

  // Ordenar por jerarquía numérica
  codeItems.sort((a, b) => {
    const aParts = a.numberPath.split('.').map(Number);
    const bParts = b.numberPath.split('.').map(Number);

    for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
      if (aParts[i] !== bParts[i]) {
        return aParts[i] - bParts[i];
      }
    }

    return aParts.length - bParts.length;
  });

  const sectionMap = new Map<string, number>();
  const codeMap = new Map<string, number>();

  // Crear secciones y códigos en transacción atómica
  await prisma.$transaction(async (tx) => {
    for (const item of codeItems) {
      const topLevel = item.numberPath.split('.')[0];

      // Crear sección para nivel superior
      if (item.level === 1 && !sectionMap.has(topLevel)) {
        const section = await tx.seccion.create({
          data: {
            nombre_seccion: item.name,
            descripcion: `Sección ${topLevel}: ${item.name}`,
          },
        });

        sectionMap.set(topLevel, section.id_seccion);
        logger.info(
          `📁 Created section: ${section.nombre_seccion} (ID: ${section.id_seccion})`,
        );

        // No crear código para la sección principal
        continue;
      }

      // Crear código
      const sectionId = sectionMap.get(topLevel);
      if (!sectionId)
        throw new Error(`Missing section for top-level: ${topLevel}`);

      const parentCodeId = item.parentPath
        ? codeMap.get(item.parentPath)
        : null;

      const code = await tx.codigo.create({
        data: {
          nombre_codigo: item.numberPath,
          descripcion: `${item.name}`,
          seccion_id: sectionId,
          parent_id: parentCodeId || undefined,
        },
      });

      codeMap.set(item.numberPath, code.id_codigo);
      logger.info(
        `  ↳ Created code: ${item.numberPath} - ${item.name} (ID: ${code.id_codigo})`,
      );
    }
  });

  logger.success(
    `Sections and codes seeded: ${sectionMap.size} sections, ${codeMap.size} codes`,
  );
}

// Función principal
async function main() {
  try {
    logger.info('🌱 Starting comprehensive database seeding...');

    await cleanDatabase();
    await seedRolesAndPermissions();
    await seedUsers();
    await seedAgeGroups();
    await seedSectionsAndCodes();

    logger.success('🚀 Seeding completed successfully!');
  } catch (error) {
    logger.error('❌ Critical error during seeding', error);
    throw error;
  }
}

// Ejecución controlada
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    logger.error('⛔ Fatal seeding error', e);
    await prisma.$disconnect();
    process.exit(1);
  });
