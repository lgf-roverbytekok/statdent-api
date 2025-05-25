import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const bcryptSaltRounds = 10;

async function main() {
  console.log('🍀 Preparing for seeding...');

  // Clean up the database (in the correct order to avoid foreign key breaches)
  console.log('🧹 Cleaning old data...');
  await prisma.registro.deleteMany();
  await prisma.rol_permiso.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.operador.deleteMany();
  await prisma.persona.deleteMany();
  await prisma.codigo.deleteMany();
  await prisma.seccion.deleteMany();
  await prisma.grupo_edad.deleteMany();
  await prisma.permiso.deleteMany();
  await prisma.rol.deleteMany();

  console.log('😬 Starting seeding...');

  // Crear roles
  const roles = [
    {
      id_rol: 1,
      nombre_rol: 'Admin',
      descripcion: 'Administrador del sistema',
    },
    {
      id_rol: 2,
      nombre_rol: 'Estadístico',
      descripcion: 'Usuario encargado de la estadística',
    },
  ];

  await prisma.rol.createMany({
    data: roles,
  });

  // Create permissions (optional, if the app requires them)
  const permissions = [
    /*   {
         id_permiso: 1,
         nombre_permiso: 'manage_users',
         descripcion: 'Permite gestionar usuarios',
       },
       {
         id_permiso: 2,
         nombre_permiso: 'view_reports',
         descripcion: 'Permite ver reportes',
       },*/
  ];

  await prisma.permiso.createMany({
    data: permissions,
  });

  // Assign permissions to roles (optional)
  await prisma.rol_permiso.createMany({
    data: [
      /*      { id_rol: 1, id_permiso: 1 }, // Admin has permission to manage users
            { id_rol: 1, id_permiso: 2 }, // Admin has permission to view reports*/
    ],
  });

  // Create the Admin User password
  const passwordAdmin = await bcrypt.hash('Admin1234', bcryptSaltRounds);

  // Create the person associated with the Admin user
  const adminPersona = await prisma.persona.create({
    data: {
      nombre: 'Admin',
      apellido: 'Default',
      email: 'admin@admin.com',
      telefono: '123456789',
    },
  });

  // Create the Admin Use
  await prisma.usuario.create({
    data: {
      id_usuario: adminPersona.id_persona, // Relationship with the PERSON table
      contrasena: passwordAdmin,
      id_rol: 1, // Admin Role
    },
  });

  console.log('👤 Admin user created successfully!');

  // NOTE: Populate other tables if necessary
  // Example: Create age groups, sections, codes, etc.

  console.log('🎉 Seeding completed successfully!');
}

main()
  .then(async () => {
    console.log('✅ Seeding done!');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.log('❌ Seeding error');
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
