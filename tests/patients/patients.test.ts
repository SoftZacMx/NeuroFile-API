import request from "supertest";
import { app } from "../../src/app";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
let token: string;
let userId: number;

beforeAll(async () => {
  // Iniciar sesión y obtener token
  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email: "test@example.com", password: "iamsecure" });

  token = loginRes.body.data.token;

  // Crear un usuario base para asociar pacientes
  const userRes = await prisma.user.create({
    data: {
      first_name: "PacienteRelacionado",
      last_name: "User",
      middle_last_name: null,
      role: "admin",
      password: "123456",
      email: `pacienteuser@example.com`,
      is_active: true,
      phone: `5558880000`,
    },
  });

  userId = userRes.id;
});

afterAll(async () => {
  // Eliminar pacientes de prueba
  await prisma.patient.deleteMany({
    where: {
      phone: {
        startsWith: "555777",
      },
    },
  });

  // Eliminar el usuario de prueba
  await prisma.user.delete({
    where: { id: userId },
  });

  await prisma.$disconnect();
});

// Función auxiliar para generar datos de paciente
const generatePatientData = (index: number) => ({
  first_name: `Paciente${index}`,
  last_name: `Apellido${index}`,
  second_last_name: `Apellido2${index}`,
  age: `${20 + index}`, // string
  gender: "Masculino",
  address: `Calle falsa ${index}`,
  is_active: true,
  occupation: "Ingeniero",
  phone: `555777${index.toString()}`,
  user_id: userId,
});

// Función auxiliar para crear paciente
const createTestPatient = async (patient: any, token: string) => {
  return await request(app)
    .post("/api/patients")
    .set("Authorization", `Bearer ${token}`)
    .send(patient);
};

describe("Pruebas de creación de pacientes", () => {
  it("Debe crear un paciente correctamente", async () => {
    const patient = generatePatientData(1);
    const res = await createTestPatient(patient, token);

    expect(res.status).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data.phone).toBe(patient.phone);
  });

  it("Debe fallar si el teléfono ya existe", async () => {
    const patient = generatePatientData(2);
    await createTestPatient(patient, token); // crear primero

    const res = await createTestPatient(patient, token); // intentar duplicar

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body.result).toBe(false);
  });
  it("Debe fallar si falta el nombre", async () => {
    const basePatient = generatePatientData(3);

    // Hacemos que todas las propiedades sean opcionales para poder usar delete
    const patient: Partial<ReturnType<typeof generatePatientData>> = {
      ...basePatient,
    };

    delete patient.first_name;

    const res = await createTestPatient(patient, token);

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body.result).toBe(false);
  });

it('Debe fallar si no hay user_id', async () => {
  const basePatient = generatePatientData(4);

  const patient: Partial<ReturnType<typeof generatePatientData>> = {
    ...basePatient,
  };

  delete patient.user_id;

  const res = await createTestPatient(patient, token);

  expect(res.status).toBeGreaterThanOrEqual(400);
  expect(res.body.result).toBe(false);
});

});
