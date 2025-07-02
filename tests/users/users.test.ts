import request from 'supertest';
import { app } from '../../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const totalUsers = 20;
let token: string;

beforeAll(async () => {
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'karina.gomex@example.com', password: 'iamsecure' });

  token = loginRes.body.data.token;
});

afterAll(async () => {
  // Limpia los usuarios de prueba que se crearon
  await prisma.user.deleteMany({
    where: {
      email: {
        startsWith: 'testuser',
      },
    },
  });

  await prisma.$disconnect();
});

// ✅ Función para generar datos únicos
const generateUserData = (index: number) => ({
  phone: `555000${index.toString().padStart(4, '0')}`,
  first_name: `Nombre${index}`,
  last_name: `ApellidoP${index}`,
  middle_last_name: `ApellidoM${index}`,
  role: 'admin',
  password: 'password',
  email: `testuser${index}@example.com`,
  is_active: true,
});

// ✅ Función auxiliar para crear usuario
const createTestUser = async (user: any, token: string) => {
  return await request(app)
    .post('/api/users')
    .set('Authorization', `Bearer ${token}`)
    .send(user);
};

// ✅ Función auxiliar para editar usuario
const editTestUser = async (userId: number, updatedData: any, token: string) => {
  return await request(app)
    .put(`/api/users/${userId}`)
    .set('Authorization', `Bearer ${token}`)
    .send(updatedData);
};

describe('Pruebas de creación y edición de usuarios', () => {
  it(`Debe crear ${totalUsers} usuarios únicos correctamente`, async () => {
    for (let i = 0; i < totalUsers; i++) {
      const user = generateUserData(i);
      const res = await createTestUser(user, token);

      expect(res.status).toBe(200);
      expect(res.body.result).toBe(true);
      expect(res.body.data).toHaveProperty('id');
    }
  });

  it('Debe fallar si el correo ya existe', async () => {
    const user = generateUserData(999);
    await createTestUser(user, token); // crear primero

    const res = await createTestUser(user, token); // intentar duplicar

    expect(res.status).toBeGreaterThanOrEqual(500);
    expect(res.body.result).toBe(false);
  });

  it('Debe fallar si falta el email', async () => {
    const baseUser = generateUserData(1000);

    const user: Partial<typeof baseUser> = { ...baseUser };
    delete user.email;

    const res = await createTestUser(user, token);

    expect(res.status).toBe(500);
    expect(res.body.result).toBe(false);
  });

  it('Debe editar correctamente un usuario existente', async () => {
    // Crear usuario base
    const originalUser = generateUserData(2000);
    const createRes = await createTestUser(originalUser, token);

    expect(createRes.status).toBe(200);
    const userId = createRes.body.data.id;

    // Datos actualizados
    const updatedData = {
      first_name: 'NombreActualizado',
      last_name: 'ApellidoActualizado',
      phone: '5551234567',
    };

    // Ejecutar edición
    const editRes = await editTestUser(userId, updatedData, token);

    expect(editRes.status).toBe(200);
    expect(editRes.body.result).toBe(true);
    expect(editRes.body.data.first_name).toBe('NombreActualizado');
    expect(editRes.body.data.last_name).toBe('ApellidoActualizado');
    expect(editRes.body.data.phone).toBe('5551234567');
  });
});
