import request from "supertest";
import { TokenService } from "../../src/infrastructure/services/TokenServiceImpl";

const PATIENT_ID = 1;
const OWNER_USER_ID = 1;
const OTHER_USER_ID = 2;
let token: string;
let tokenOtherUser: string;
let app: import("express").Express;
let nextId = 1;
const deletedIds = new Set<number>();

jest.mock("../../src/infrastructure/database/prisma/prisma.client", () => ({
  __esModule: true,
  default: {
    patient: {
      findFirst: jest.fn().mockImplementation((args: { where: { id: number } }) => {
        if (args.where.id === PATIENT_ID) {
          return Promise.resolve({
            id: PATIENT_ID,
            user_id: OWNER_USER_ID,
            first_name: "P",
            last_name: "P",
            second_last_name: null,
            age: "25",
            gender: "M",
            address: null,
            is_active: true,
            occupation: "Ing",
            phone: "5550000000",
          });
        }
        return Promise.resolve(null);
      }),
    },
    appointment: {
      create: jest.fn().mockImplementation((args: { data: Record<string, unknown> }) => {
        const id = nextId++;
        return Promise.resolve({
          id,
          date: args.data.date ?? new Date(),
          attended: args.data.attended ?? false,
          status: args.data.status ?? null,
          patientId: args.data.patientId ?? PATIENT_ID,
        });
      }),
      update: jest.fn().mockImplementation((args: { where: { id: number }; data: Record<string, unknown> }) => {
        return Promise.resolve({
          id: args.where.id,
          date: args.data.date ?? new Date(Date.now() + 3600 * 1000),
          attended: args.data.attended ?? true,
          status: args.data.status ?? null,
          patientId: PATIENT_ID,
        });
      }),
      delete: jest.fn().mockImplementation((args: { where: { id: number } }) => {
        deletedIds.add(args.where.id);
        return Promise.resolve({
          id: args.where.id,
          date: new Date(),
          attended: false,
          status: null,
          patientId: PATIENT_ID,
        });
      }),
      findUnique: jest.fn().mockImplementation((args: { where: { id: number }; select?: unknown; include?: unknown }) => {
        if (deletedIds.has(args.where.id)) {
          return Promise.reject(new Error("Record to update not found."));
        }
        const base = {
          id: args.where.id,
          date: new Date(),
          attended: false,
          status: null,
          patientId: PATIENT_ID,
        };
        const withPatient = args.select || args.include
          ? { ...base, patient: { user_id: OWNER_USER_ID } }
          : base;
        return Promise.resolve(withPatient);
      }),
      findMany: jest.fn().mockResolvedValue([]),
    },
    $connect: jest.fn().mockResolvedValue(undefined),
  },
}));

beforeAll(async () => {
  process.env.JWT_SECRET = "test-secret";
  const tokenService = new TokenService();
  token = tokenService.generate({ sub: String(OWNER_USER_ID), type: "access", role: "admin" });
  tokenOtherUser = tokenService.generate({ sub: String(OTHER_USER_ID), type: "access", role: "admin" });
  const { app: appModule, appReady } = await import("../../src/app");
  app = appModule;
  await appReady;
  await new Promise<void>((r) => setImmediate(r));
  await new Promise((r) => setTimeout(r, 80));
});

beforeEach(() => {
  deletedIds.clear();
});

const generateAppointmentData = (offsetMinutes = 0) => ({
  date: new Date(Date.now() + offsetMinutes * 60 * 1000).toISOString(),
  attended: false,
  patientId: PATIENT_ID,
});

const createTestAppointment = async (appointment: ReturnType<typeof generateAppointmentData>) => {
  return request(app)
    .post("/api/appointments")
    .set("Authorization", `Bearer ${token}`)
    .send(appointment);
};

describe("Pruebas de creación, edición y eliminación de citas", () => {
  it("Debe crear múltiples citas correctamente", async () => {
    const count = 5;
    for (let i = 0; i < count; i++) {
      const appointment = generateAppointmentData(i * 10);
      const res = await createTestAppointment(appointment);

      expect(res.status).toBe(200);
      expect(res.body.result).toBe(true);
      expect(res.body.data).toHaveProperty("id");
    }
  });

  it("Debe editar una cita correctamente", async () => {
    const appointment = generateAppointmentData();
    const resCreate = await createTestAppointment(appointment);
    const appointmentId = resCreate.body.data.id;

    const updatedData = {
      date: new Date(Date.now() + 3600 * 1000).toISOString(),
      attended: true,
    };

    const resUpdate = await request(app)
      .put(`/api/appointments/${appointmentId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updatedData);

    expect(resUpdate.status).toBe(200);
    expect(resUpdate.body.data.attended).toBe(true);
    expect(new Date(resUpdate.body.data.date).getTime()).toBeGreaterThan(Date.now());
  });

  it("Debe eliminar una cita correctamente", async () => {
    const appointment = generateAppointmentData();
    const resCreate = await createTestAppointment(appointment);
    const appointmentId = resCreate.body.data.id;

    const resDelete = await request(app)
      .delete(`/api/appointments/${appointmentId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(resDelete.status).toBe(200);
    expect(resDelete.body.data.id).toBe(appointmentId);

    const resGet = await request(app)
      .get(`/api/appointments/${appointmentId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(resGet.status).toBe(404);
  });

  describe("Ownership (403 al acceder a la cita de otro usuario)", () => {
    it("Debe devolver 403 al obtener cita de otro usuario", async () => {
      const res = await request(app)
        .get("/api/appointments/1")
        .set("Authorization", `Bearer ${tokenOtherUser}`);

      expect(res.status).toBe(403);
      expect(res.body.result).toBe(false);
    });

    it("Debe devolver 403 al editar cita de otro usuario", async () => {
      const res = await request(app)
        .put("/api/appointments/1")
        .set("Authorization", `Bearer ${tokenOtherUser}`)
        .send({ date: new Date().toISOString(), attended: true });

      expect(res.status).toBe(403);
      expect(res.body.result).toBe(false);
    });

    it("Debe devolver 403 al eliminar cita de otro usuario", async () => {
      const res = await request(app)
        .delete("/api/appointments/999")
        .set("Authorization", `Bearer ${tokenOtherUser}`);

      expect(res.status).toBe(403);
      expect(res.body.result).toBe(false);
    });
  });
});
