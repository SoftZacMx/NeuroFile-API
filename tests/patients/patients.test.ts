import request from "supertest";
import { TokenService } from "../../src/infrastructure/services/TokenServiceImpl";

const USER_ID = 1;
const OTHER_USER_ID = 2;
let token: string;
let tokenOtherUser: string;
let app: import("express").Express;
let nextId = 1;
const existingPhones = new Set<string>();

jest.mock("../../src/infrastructure/database/prisma/prisma.client", () => ({
  __esModule: true,
  default: {
    patient: {
      create: jest.fn().mockImplementation((args: { data: { phone: string; user_id: number; [key: string]: unknown } }) => {
        const { data } = args;
        if (existingPhones.has(data.phone)) {
          return Promise.reject(new Error("Unique constraint failed on the fields: (`phone`)"));
        }
        existingPhones.add(data.phone);
        return Promise.resolve({
          id: nextId++,
          first_name: data.first_name,
          last_name: data.last_name,
          second_last_name: data.second_last_name ?? null,
          age: data.age,
          gender: data.gender,
          address: data.address ?? null,
          is_active: data.is_active ?? true,
          occupation: data.occupation,
          phone: data.phone,
          user_id: data.user_id,
        });
      }),
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn().mockImplementation((args: { where: { id?: number } }) => {
        if (args.where.id === 1) {
          return Promise.resolve({
            id: 1,
            first_name: "Paciente",
            last_name: "Otro",
            second_last_name: null,
            age: "25",
            gender: "Masculino",
            address: null,
            is_active: true,
            occupation: "Ingeniero",
            phone: "5557770000",
            user_id: USER_ID,
          });
        }
        return Promise.resolve(null);
      }),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $connect: jest.fn().mockResolvedValue(undefined),
  },
}));

beforeAll(async () => {
  process.env.JWT_SECRET = "test-secret";
  const tokenService = new TokenService();
  token = tokenService.generate({ sub: String(USER_ID), type: "access", role: "admin" });
  tokenOtherUser = tokenService.generate({ sub: String(OTHER_USER_ID), type: "access", role: "admin" });
  const { app: appModule, appReady } = await import("../../src/app");
  app = appModule;
  await appReady;
  await new Promise<void>((r) => setImmediate(r));
  await new Promise((r) => setTimeout(r, 80));
});

beforeEach(() => {
  existingPhones.clear();
});

const generatePatientData = (index: number) => ({
  first_name: `Paciente${index}`,
  last_name: `Apellido${index}`,
  second_last_name: `Apellido2${index}`,
  age: `${20 + index}`,
  gender: "Masculino",
  address: `Calle falsa ${index}`,
  is_active: true,
  occupation: "Ingeniero",
  phone: `555777${String(index).padStart(4, "0")}`,
  user_id: USER_ID,
});

const createTestPatient = async (patient: ReturnType<typeof generatePatientData>) => {
  return request(app)
    .post("/api/patients")
    .set("Authorization", `Bearer ${token}`)
    .send(patient);
};

describe("Pruebas de creación de pacientes", () => {
  it("Debe crear un paciente correctamente", async () => {
    const patient = generatePatientData(1);
    const res = await createTestPatient(patient);

    expect(res.status).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data.phone).toBe(patient.phone);
  });

  it("Debe fallar si el teléfono ya existe", async () => {
    const patient = generatePatientData(2);
    await createTestPatient(patient);

    const res = await createTestPatient(patient);

    // Repo devuelve error de restricción única; puede ser 4xx/5xx o 200 con data.code (según controller)
    if (res.status >= 400) {
      expect(res.body.result).toBe(false);
    } else {
      expect(res.body.data).toHaveProperty("code");
    }
  });

  it("Debe fallar si falta el nombre", async () => {
    const basePatient = generatePatientData(3);
    const { first_name: _, ...patientWithoutName } = basePatient;

    const res = await request(app)
      .post("/api/patients")
      .set("Authorization", `Bearer ${token}`)
      .send(patientWithoutName);

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body.result).toBe(false);
  });

  it("Debe fallar si no hay user_id", async () => {
    const basePatient = generatePatientData(4);
    const { user_id: __, ...patientWithoutUserId } = basePatient;

    const res = await request(app)
      .post("/api/patients")
      .set("Authorization", `Bearer ${token}`)
      .send(patientWithoutUserId);

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body.result).toBe(false);
  });

  describe("Ownership (403 al acceder al paciente de otro usuario)", () => {
    it("Debe devolver 403 al obtener paciente de otro usuario", async () => {
      const res = await request(app)
        .get("/api/patients/1")
        .set("Authorization", `Bearer ${tokenOtherUser}`);

      expect(res.status).toBe(403);
      expect(res.body.result).toBe(false);
    });

    it("Debe devolver 403 al editar paciente de otro usuario", async () => {
      const res = await request(app)
        .put("/api/patients/1")
        .set("Authorization", `Bearer ${tokenOtherUser}`)
        .send({ first_name: "Hack", last_name: "Hack", age: "30", gender: "Masculino", occupation: "N/A", phone: "5557770001", user_id: OTHER_USER_ID });

      expect(res.status).toBe(403);
      expect(res.body.result).toBe(false);
    });

    it("Debe devolver 403 al eliminar paciente de otro usuario", async () => {
      const res = await request(app)
        .delete("/api/patients/1")
        .set("Authorization", `Bearer ${tokenOtherUser}`);

      expect(res.status).toBe(403);
      expect(res.body.result).toBe(false);
    });
  });
});
