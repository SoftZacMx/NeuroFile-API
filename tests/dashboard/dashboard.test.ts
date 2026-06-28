import request from "supertest";
import { TokenService } from "../../src/infrastructure/services/TokenServiceImpl";

const THERAPIST_USER_ID = 1;
const ADMIN_USER_ID = 2;

let therapistToken: string;
let adminToken: string;
let app: import("express").Express;

const patientCountMock = jest.fn().mockResolvedValue(3);
const appointmentCountMock = jest.fn().mockResolvedValue(2);
const appointmentFindManyMock = jest.fn().mockResolvedValue([
  {
    id: 10,
    date: new Date(),
    status: true,
    attended: null,
    patient: {
      id: 5,
      first_name: "Ana",
      last_name: "López",
      second_last_name: null,
    },
  },
]);

jest.mock("../../src/infrastructure/database/prisma/prisma.client", () => ({
  __esModule: true,
  default: {
    patient: {
      count: (...args: unknown[]) => patientCountMock(...args),
    },
    appointment: {
      count: (...args: unknown[]) => appointmentCountMock(...args),
      findMany: (...args: unknown[]) => appointmentFindManyMock(...args),
    },
    $connect: jest.fn().mockResolvedValue(undefined),
  },
}));

beforeAll(async () => {
  process.env.JWT_SECRET = "test-secret";
  const tokenService = new TokenService();
  therapistToken = tokenService.generate({
    sub: String(THERAPIST_USER_ID),
    type: "access",
    role: "therapist",
  });
  adminToken = tokenService.generate({
    sub: String(ADMIN_USER_ID),
    type: "access",
    role: "admin",
  });
  const { app: appModule, appReady } = await import("../../src/app");
  app = appModule;
  await appReady;
  await new Promise<void>((r) => setImmediate(r));
  await new Promise((r) => setTimeout(r, 80));
});

beforeEach(() => {
  patientCountMock.mockClear();
  appointmentCountMock.mockClear();
  appointmentFindManyMock.mockClear();
  patientCountMock.mockResolvedValue(3);
  appointmentCountMock.mockResolvedValue(2);
  appointmentFindManyMock.mockResolvedValue([
    {
      id: 10,
      date: new Date(),
      status: true,
      attended: null,
      patient: {
        id: 5,
        first_name: "Ana",
        last_name: "López",
        second_last_name: null,
      },
    },
  ]);
});

describe("Dashboard API", () => {
  it("GET /api/dashboard/stats responde 401 sin token", async () => {
    const res = await request(app).get("/api/dashboard/stats");
    expect(res.status).toBe(401);
  });

  it("GET /api/dashboard/stats filtra por terapeuta", async () => {
    const res = await request(app)
      .get("/api/dashboard/stats")
      .set("Authorization", `Bearer ${therapistToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({
      activePatients: 3,
      appointmentsToday: 2,
      appointmentsNextDay: 2,
    });

    expect(patientCountMock).toHaveBeenCalledWith({
      where: { user_id: THERAPIST_USER_ID, is_active: true },
    });
    expect(appointmentCountMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          patient: { user_id: THERAPIST_USER_ID },
          status: true,
        }),
      })
    );
  });

  it("GET /api/dashboard/stats filtra por cuenta también para admin", async () => {
    const res = await request(app)
      .get("/api/dashboard/stats")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(patientCountMock).toHaveBeenCalledWith({
      where: { user_id: ADMIN_USER_ID, is_active: true },
    });
    expect(appointmentCountMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          patient: { user_id: ADMIN_USER_ID },
          status: true,
        }),
      })
    );
  });

  it("GET /api/dashboard/appointments/today excluye canceladas y filtra por terapeuta", async () => {
    const res = await request(app)
      .get("/api/dashboard/appointments/today")
      .set("Authorization", `Bearer ${therapistToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0]).toMatchObject({
      id: 10,
      patientId: 5,
      patientName: "Ana López",
      status: true,
    });

    expect(appointmentFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          patient: { user_id: THERAPIST_USER_ID },
          status: true,
        }),
      })
    );
  });

  it("GET /api/dashboard/appointments/tomorrow filtra por cuenta también para admin", async () => {
    const res = await request(app)
      .get("/api/dashboard/appointments/tomorrow")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(appointmentFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          patient: { user_id: ADMIN_USER_ID },
          status: true,
        }),
      })
    );
  });
});
