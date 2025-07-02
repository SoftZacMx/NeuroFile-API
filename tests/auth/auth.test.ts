import request from 'supertest';
import { app } from '../../src/app';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();

describe('🔐 Pruebas de Login', () => {
  const testUser = {
    email: 'loginuser@example.com',
    password: 'supersecure',
  };

  beforeAll(async () => {
    // Crea un usuario de prueba con contraseña encriptada
    const hashedPassword = await bcrypt.hash(testUser.password, 10);

    await prisma.user.upsert({
      where: { email: testUser.email },
      update: {},
      create: {
        email: testUser.email,
        password: hashedPassword,
        first_name: 'Login',
        last_name: 'Tester',
        middle_last_name: 'Unit',
        role: 'admin',
        is_active: true,
        phone: '5559990000',
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [testUser.email, 'nonexistent@example.com'],
        },
      },
    });

    await prisma.$disconnect();
  });

  it('✅ Login exitoso con credenciales válidas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data.token');
    expect(res.body.data.user.email).toBe(testUser.email);
  });

  it('❌ Login fallido con contraseña incorrecta', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword',
      });

    expect(res.status).toBe(401); // o 400 dependiendo de tu API
    expect(res.body).toHaveProperty('result', false);
    expect(res.body).toHaveProperty('message');
  });

  it('❌ Login fallido con email inexistente', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'somepassword',
      });

    expect(res.status).toBe(401); // o 400
    expect(res.body.result).toBe(false);
    expect(res.body).toHaveProperty('message');
  });

  it('❌ Login fallido con campos faltantes', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: '', // vacío
        password: '',
      });

    expect(res.status).toBe(400); // Valida que tu backend esté manejando esto correctamente
    expect(res.body.result).toBe(false);
  });
});
