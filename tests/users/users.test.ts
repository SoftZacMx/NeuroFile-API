import request from "supertest";
import { TokenService } from "../../src/infrastructure/services/TokenServiceImpl";

const totalUsers = 20;
let token: string;
let tokenUser2: string;
let app: import("express").Express;
let nextId = 1;
const existingEmails = new Set<string>();

jest.mock("../../src/infrastructure/database/prisma/prisma.client", () => ({
  __esModule: true,
  default: {
    user: {
      create: jest.fn().mockImplementation((args: { data: { email?: string; [key: string]: unknown } }) => {
        const data = args.data;
        if (!data.email) {
          return Promise.reject(new Error("Email is required"));
        }
        if (existingEmails.has(data.email)) {
          return Promise.reject(new Error("Unique constraint failed on the fields: (`email`)"));
        }
        existingEmails.add(data.email);
        return Promise.resolve({
          id: nextId++,
          phone: data.phone,
          first_name: data.first_name,
          last_name: data.last_name,
          middle_last_name: data.middle_last_name ?? null,
          role: data.role,
          password: data.password,
          email: data.email,
          is_active: data.is_active ?? true,
        });
      }),
      update: jest.fn().mockImplementation((args: { where: { id: number }; data: Record<string, unknown> }) => {
        return Promise.resolve({
          id: args.where.id,
          phone: args.data.phone ?? "5550000000",
          first_name: args.data.first_name ?? "Nombre",
          last_name: args.data.last_name ?? "Apellido",
          middle_last_name: args.data.middle_last_name ?? null,
          role: args.data.role ?? "admin",
          password: args.data.password ?? "",
          email: args.data.email ?? "user@example.com",
          is_active: args.data.is_active ?? true,
        });
      }),
      findFirst: jest.fn().mockResolvedValue(null),
      findUnique: jest.fn().mockImplementation((args: { where: { id: number } }) => {
        if (args.where.id === 1) {
          return Promise.resolve({
            id: 1,
            phone: "5550000001",
            first_name: "Nombre1",
            last_name: "ApellidoP1",
            middle_last_name: "ApellidoM1",
            role: "admin",
            password: "",
            email: "testuser1@example.com",
            is_active: true,
          });
        }
        return Promise.resolve(null);
      }),
      findMany: jest.fn().mockResolvedValue([]),
      delete: jest.fn().mockResolvedValue({}),
    },
    $connect: jest.fn().mockResolvedValue(undefined),
  },
}));

beforeAll(async () => {
  process.env.JWT_SECRET = "test-secret";
  const tokenService = new TokenService();
  token = tokenService.generate({ sub: "1", type: "access", role: "admin" });
  tokenUser2 = tokenService.generate({ sub: "2", type: "access", role: "admin" });
  const { app: appModule, appReady } = await import("../../src/app");
  app = appModule;
  await appReady;
  await new Promise<void>((r) => setImmediate(r));
  await new Promise((r) => setTimeout(r, 80));
});

beforeEach(() => {
  existingEmails.clear();
});

const generateUserData = (index: number) => ({
  phone: `555000${String(index).padStart(4, "0")}`,
  first_name: `Nombre${index}`,
  last_name: `ApellidoP${index}`,
  middle_last_name: `ApellidoM${index}`,
  role: "admin",
  password: "password",
  email: `testuser${index}@example.com`,
  is_active: true,
});

const createTestUser = async (user: ReturnType<typeof generateUserData>) => {
  return request(app).post("/api/users").set("Authorization", `Bearer ${token}`).send(user);
};

const editTestUser = async (userId: number, updatedData: Record<string, unknown>) => {
  return request(app)
    .put(`/api/users/${userId}`)
    .set("Authorization", `Bearer ${token}`)
    .send(updatedData);
};

describe("Pruebas de creación y edición de usuarios", () => {
  it(`Debe crear ${totalUsers} usuarios únicos correctamente`, async () => {
    for (let i = 0; i < totalUsers; i++) {
      const user = generateUserData(i);
      const res = await createTestUser(user);

      expect(res.status).toBe(200);
      expect(res.body.result).toBe(true);
      expect(res.body.data).toHaveProperty("id");
    }
  });

  it("Debe fallar si el correo ya existe", async () => {
    const user = generateUserData(999);
    await createTestUser(user);

    const res = await createTestUser(user);

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body.result).toBe(false);
  });

  it("Debe fallar si falta el email", async () => {
    const baseUser = generateUserData(1000);
    const { email: _, ...userWithoutEmail } = baseUser;

    const res = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${token}`)
      .send(userWithoutEmail);

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body.result).toBe(false);
  });

  it("Debe editar correctamente un usuario existente (solo el propio)", async () => {
    const updatedData = {
      first_name: "NombreActualizado",
      last_name: "ApellidoActualizado",
      phone: "5551234567",
    };

    const editRes = await editTestUser(1, updatedData);

    expect(editRes.status).toBe(200);
    expect(editRes.body.result).toBe(true);
    expect(editRes.body.data.first_name).toBe("NombreActualizado");
    expect(editRes.body.data.last_name).toBe("ApellidoActualizado");
    expect(editRes.body.data.phone).toBe("5551234567");
  });

  it("Debe crear un usuario con rol admin correctamente", async () => {
    const user = { ...generateUserData(3000), role: "admin" };
    const res = await createTestUser(user);

    expect(res.status).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.data.role).toBe("admin");
  });

  it("Debe crear un usuario con rol therapist correctamente", async () => {
    const user = { ...generateUserData(3001), role: "therapist" };
    const res = await createTestUser(user);

    expect(res.status).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.data.role).toBe("therapist");
  });

  it("Debe fallar si el rol no es admin ni therapist", async () => {
    const user = { ...generateUserData(3002), role: "inválido" };

    const res = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${token}`)
      .send(user);

    expect(res.status).toBe(400);
    expect(res.body.result).toBe(false);
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });

  it("Debe fallar si no se envía token", async () => {
    const user = generateUserData(3003);

    const res = await request(app).post("/api/users").send(user);

    expect(res.status).toBe(401);
  });

  describe("Ownership (403 al acceder a otro usuario)", () => {
    it("Debe devolver 403 al editar otro usuario", async () => {
      const res = await request(app)
        .put("/api/users/1")
        .set("Authorization", `Bearer ${tokenUser2}`)
        .send({ first_name: "Hack", phone: "5550000000" });

      expect(res.status).toBe(403);
      expect(res.body.result).toBe(false);
    });

    it("Debe devolver 403 al obtener otro usuario", async () => {
      const res = await request(app)
        .get("/api/users/1")
        .set("Authorization", `Bearer ${tokenUser2}`);

      expect(res.status).toBe(403);
      expect(res.body.result).toBe(false);
    });

    it("Debe devolver 403 al eliminar otro usuario", async () => {
      const res = await request(app)
        .delete("/api/users/1")
        .set("Authorization", `Bearer ${tokenUser2}`);

      expect(res.status).toBe(403);
      expect(res.body.result).toBe(false);
    });
  });
});
