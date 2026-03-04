import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

const PASSWORD_SEED = 'NeuroFile2025';

async function main() {
  const passwordHash = await hash(PASSWORD_SEED, 8);

  // Limpiar en orden por dependencias (hijos antes que padres)
  await prisma.clinicalNote.deleteMany({});
  await prisma.symptom.deleteMany({});
  await prisma.therapeuticModality.deleteMany({});
  await prisma.diagnosticImpression.deleteMany({});
  await prisma.record.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.patient.deleteMany({});
  await prisma.user.deleteMany({});

  const user1 = await prisma.user.create({
    data: {
      first_name: 'María',
      last_name: 'García',
      middle_last_name: 'López',
      role: 'admin',
      password: passwordHash,
      email: 'maria.garcia@neurofile.com',
      phone: '+5215512345001',
      is_active: true,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      first_name: 'Carlos',
      last_name: 'Rodríguez',
      middle_last_name: null,
      role: 'therapist',
      password: passwordHash,
      email: 'carlos.rodriguez@neurofile.com',
      phone: '+5215512345002',
      is_active: true,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      first_name: 'Ana',
      last_name: 'Martínez',
      middle_last_name: 'Sánchez',
      role: 'therapist',
      password: passwordHash,
      email: 'ana.martinez@neurofile.com',
      phone: '+5215512345003',
      is_active: true,
    },
  });

  await prisma.patient.create({
    data: {
      first_name: 'Luis',
      last_name: 'Hernández',
      second_last_name: 'Pérez',
      age: '28',
      gender: 'M',
      address: 'Calle Principal 123, Ciudad de México',
      occupation: 'Ingeniero',
      phone: '+5215598765001',
      user_id: user1.id,
      is_active: true,
    },
  });

  await prisma.patient.create({
    data: {
      first_name: 'Rosa',
      last_name: 'Flores',
      second_last_name: null,
      age: '35',
      gender: 'F',
      address: 'Av. Central 456',
      occupation: 'Docente',
      phone: '+5215598765002',
      user_id: user1.id,
      is_active: true,
    },
  });

  await prisma.patient.create({
    data: {
      first_name: 'Pedro',
      last_name: 'Ramírez',
      second_last_name: 'Gómez',
      age: '42',
      gender: 'M',
      address: null,
      occupation: 'Arquitecto',
      phone: '+5215598765003',
      user_id: user2.id,
      is_active: true,
    },
  });

  await prisma.patient.create({
    data: {
      first_name: 'Laura',
      last_name: 'Díaz',
      second_last_name: 'Torres',
      age: '31',
      gender: 'F',
      address: 'Col. Centro 789',
      occupation: 'Psicóloga',
      phone: '+5215598765004',
      user_id: user3.id,
      is_active: true,
    },
  });

  console.log('✅ Seed completado: 3 usuarios y 4 pacientes creados.');
  console.log('   Contraseña para todos los usuarios:', PASSWORD_SEED);
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
