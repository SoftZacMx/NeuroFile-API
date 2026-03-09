import request from "supertest";
import bcrypt from "bcrypt";

const testUser = {
  email: "loginuser@example.com",
  password: "supersecure",
};

const mockPrisma = {
  user: {
    findFirst: jest.fn(),
  },
  $connect: jest.fn().mockResolvedValue(undefined),
};

jest.mock("../../src/infrastructure/database/prisma/prisma.client", () => ({
  __esModule: true,
  default: mockPrisma,
}));

describe("🔐 Pruebas de Login", () => {
  let app: import("express").Express;

  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash(testUser.password, 10);

    mockPrisma.user.findFirst.mockImplementation(
      async (args: { where: { email: string } }) => {
        if (args.where.email === testUser.email) {
          return {
            id: 1,
            email: testUser.email,
            password: hashedPassword,
            first_name: "Login",
            last_name: "Tester",
            middle_last_name: "Unit",
            role: "admin",
            is_active: true,
            phone: "5559990000",
          };
        }
        return null;
      }
    );

    process.env.JWT_SECRET = "test-secret";
    const { app: appModule, appReady } = await import("../../src/app");
    app = appModule;
    await appReady;
    await new Promise<void>((r) => setImmediate(r));
    await new Promise((r) => setTimeout(r, 80));
  });

  it("✅ Login exitoso con credenciales válidas", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data.token");
    expect(res.body.data.user.email).toBe(testUser.email);
  });

  it("❌ Login fallido con contraseña incorrecta", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: "wrongpassword",
    });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("result", false);
    expect(res.body).toHaveProperty("message");
  });

  it("❌ Login fallido con email inexistente", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "nonexistent@example.com",
      password: "somepassword",
    });

    expect(res.status).toBe(500);
    expect(res.body.result).toBe(false);
    expect(res.body).toHaveProperty("message");
  });

  it("❌ Login fallido con campos faltantes", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "",
      password: "",
    });

    expect(res.status).toBe(400);
    expect(res.body.result).toBe(false);
  });
});
