/**
 * Tests de integración: API de Notas Clínicas (POST, PUT, DELETE, GET)
 *
 * CONTEXTO: Jest + Supertest | ORM: Prisma (mockeado) | TypeScript
 * DEPENDENCIAS EXTERNAS: ninguna (Prisma mockeado, JWT generado en test)
 *
 * Cobertura:
 * - Camino feliz: crear, editar, eliminar, obtener
 * - Caminos tristes: validación, auth, nota inexistente
 * - Edge cases: sin token, token inválido, recordId inválido, fecha inválida, nota vacía
 * - Mock: Prisma (clinicalNote + $connect)
 *
 * Estructura: Arrange / Act / Assert — un escenario por test.
 */

import request from "supertest";
import { TokenService } from "../../src/infrastructure/services/TokenServiceImpl";

const RECORD_ID = 1;
const OWNER_USER_ID = 1;
const OTHER_USER_ID = 2;
let token: string;
let tokenOtherUser: string;
let app: import("express").Express;
let nextId = 1;
const deletedNoteIds = new Set<number>();
let firstCreatedNoteId: number;

jest.mock("../../src/infrastructure/database/prisma/prisma.client", () => ({
  __esModule: true,
  default: {
    clinicalNote: {
      create: jest.fn().mockImplementation((args: { data: { date: Date | string; note: string; record?: { connect: { id: number } } } }) => {
        const id = nextId++;
        const recordId = args.data.record?.connect?.id ?? RECORD_ID;
        return Promise.resolve({
          id,
          date: args.data.date,
          note: args.data.note,
          recordId,
        });
      }),
      update: jest.fn().mockImplementation((args: { where: { id: number }; data: { date?: Date; note?: string } }) => {
        return Promise.resolve({
          id: args.where.id,
          date: args.data.date ?? new Date(),
          note: args.data.note ?? "Nota editada",
          recordId: RECORD_ID,
        });
      }),
      delete: jest.fn().mockImplementation((args: { where: { id: number } }) => {
        deletedNoteIds.add(args.where.id);
        return Promise.resolve({
          id: args.where.id,
          date: new Date(),
          note: "",
          recordId: RECORD_ID,
        });
      }),
      findUnique: jest.fn().mockImplementation((args: { where: { id: number }; select?: unknown; include?: unknown }) => {
        if (deletedNoteIds.has(args.where.id)) {
          return Promise.reject(new Error("Record to update not found."));
        }
        const base = {
          id: args.where.id,
          date: new Date(),
          note: "Nota",
          recordId: RECORD_ID,
        };
        // Use case ownership check pide record.patient.user_id (user_id: 1 = token sub)
        const withRecord = args.select || args.include
          ? { ...base, record: { patient: { user_id: OWNER_USER_ID } } }
          : base;
        return Promise.resolve(withRecord);
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

const notaValida = (offset = 0) => ({
  date: new Date(Date.now() + offset * 60000).toISOString(),
  note: `Nota clínica ${offset}`,
  recordId: RECORD_ID,
});

describe("Notas clínicas – Integración (Prisma mockeado)", () => {
  // —— Camino feliz ——
  describe("Camino feliz", () => {
    it("Crear una nota clínica con datos válidos devuelve 200 y la nota con id", async () => {
      // Arrange
      const payload = notaValida(0);
      // Act
      const res = await request(app)
        .post("/api/clinical-notes")
        .set("Authorization", `Bearer ${token}`)
        .send(payload);
      // Assert
      expect(res.status).toBe(200);
      expect(res.body.result).toBe(true);
      expect(res.body.data).toHaveProperty("id");
      expect(res.body.data.note).toBe(payload.note);
      expect(res.body.data.recordId).toBe(RECORD_ID);
      firstCreatedNoteId = res.body.data.id;
    });

    it("Editar una nota existente con date y note devuelve 200 y la nota actualizada", async () => {
      // Arrange
      const update = { date: new Date().toISOString(), note: "Nota editada correctamente" };
      // Act
      const res = await request(app)
        .put(`/api/clinical-notes/${firstCreatedNoteId}`)
        .set("Authorization", `Bearer ${token}`)
        .send(update);
      // Assert
      expect(res.status).toBe(200);
      expect(res.body.result).toBe(true);
      expect(res.body.data.note).toBe(update.note);
    });

    it("Eliminar una nota existente devuelve 200 y el cuerpo de la nota eliminada", async () => {
      // Arrange (firstCreatedNoteId ya existe por tests anteriores)
      // Act
      const res = await request(app)
        .delete(`/api/clinical-notes/${firstCreatedNoteId}`)
        .set("Authorization", `Bearer ${token}`);
      // Assert
      expect(res.status).toBe(200);
      expect(res.body.result).toBe(true);
      expect(res.body.data).toHaveProperty("id", firstCreatedNoteId);
    });

    it("Obtener una nota ya eliminada devuelve error (status > 400 y result false)", async () => {
      // Arrange (la nota firstCreatedNoteId fue eliminada en el test anterior)
      // Act
      const res = await request(app)
        .get(`/api/clinical-notes/${firstCreatedNoteId}`)
        .set("Authorization", `Bearer ${token}`);
      // Assert
      expect(res.status).toBeGreaterThan(400);
      expect(res.body.result).toBe(false);
    });
  });

  // —— Caminos tristes (validación / errores esperados) ——
  describe("Caminos tristes – validación y auth", () => {
    beforeEach(() => deletedNoteIds.clear());

    it("Crear nota sin Authorization devuelve 401", async () => {
      // Arrange: body válido, sin cabecera Authorization
      // Act
      const res = await request(app).post("/api/clinical-notes").send(notaValida());
      // Assert
      expect(res.status).toBe(401);
    });

    it("Crear nota con token inválido devuelve 401", async () => {
      // Arrange: token que no verifica
      // Act
      const res = await request(app)
        .post("/api/clinical-notes")
        .set("Authorization", "Bearer token-invalido")
        .send(notaValida());
      // Assert
      expect(res.status).toBe(401);
    });

    it("Crear nota sin recordId devuelve 400 y result false", async () => {
      // Arrange: body sin recordId
      const body = { date: notaValida().date, note: notaValida().note };
      // Act
      const res = await request(app)
        .post("/api/clinical-notes")
        .set("Authorization", `Bearer ${token}`)
        .send(body);
      // Assert
      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.body.result).toBe(false);
    });

    it("Crear nota con recordId no entero devuelve 400 con código de validación", async () => {
      // Arrange: recordId no numérico
      const body = { ...notaValida(), recordId: "no-numero" };
      // Act
      const res = await request(app)
        .post("/api/clinical-notes")
        .set("Authorization", `Bearer ${token}`)
        .send(body);
      // Assert
      expect(res.status).toBe(400);
      expect(res.body.result).toBe(false);
      expect(res.body.code).toBe("VALIDATION_ERROR");
    });

    it("Crear nota con fecha no ISO 8601 devuelve 400", async () => {
      // Arrange: date con formato inválido
      const body = { ...notaValida(), date: "no-es-fecha" };
      // Act
      const res = await request(app)
        .post("/api/clinical-notes")
        .set("Authorization", `Bearer ${token}`)
        .send(body);
      // Assert
      expect(res.status).toBe(400);
      expect(res.body.result).toBe(false);
    });

    it("Crear nota con campo note vacío devuelve 400", async () => {
      // Arrange: note vacío
      const body = { ...notaValida(), note: "" };
      // Act
      const res = await request(app)
        .post("/api/clinical-notes")
        .set("Authorization", `Bearer ${token}`)
        .send(body);
      // Assert
      expect(res.status).toBe(400);
      expect(res.body.result).toBe(false);
    });
  });

  // —— Edge cases ——
  describe("Edge cases", () => {
    beforeEach(() => deletedNoteIds.clear());

    it("Crear varias notas seguidas devuelve 200 y un id distinto por cada una", async () => {
      // Arrange
      const ids: number[] = [];
      // Act
      for (let i = 0; i < 3; i++) {
        const res = await request(app)
          .post("/api/clinical-notes")
          .set("Authorization", `Bearer ${token}`)
          .send(notaValida(i));
        expect(res.status).toBe(200);
        expect(res.body.data.id).toBeDefined();
        ids.push(res.body.data.id);
      }
      // Assert
      expect(new Set(ids).size).toBe(3);
    });

    it("Actualizar nota con solo el campo note devuelve 200", async () => {
      // Arrange: crear nota y luego actualizar solo note
      const createRes = await request(app)
        .post("/api/clinical-notes")
        .set("Authorization", `Bearer ${token}`)
        .send(notaValida(10));
      const id = createRes.body.data.id;
      // Act
      const res = await request(app)
        .put(`/api/clinical-notes/${id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ note: "Solo cambio el texto" });
      // Assert
      expect(res.status).toBe(200);
      expect(res.body.data.note).toBe("Solo cambio el texto");
    });
  });

  describe("Ownership (403 al acceder a la nota de otro usuario)", () => {
    it("Debe devolver 403 al obtener nota de otro usuario", async () => {
      const res = await request(app)
        .get("/api/clinical-notes/1")
        .set("Authorization", `Bearer ${tokenOtherUser}`);

      expect(res.status).toBe(403);
      expect(res.body.result).toBe(false);
    });

    it("Debe devolver 403 al editar nota de otro usuario", async () => {
      const res = await request(app)
        .put("/api/clinical-notes/1")
        .set("Authorization", `Bearer ${tokenOtherUser}`)
        .send({ date: new Date().toISOString(), note: "Hack" });

      expect(res.status).toBe(403);
      expect(res.body.result).toBe(false);
    });

    it("Debe devolver 403 al eliminar nota de otro usuario", async () => {
      const res = await request(app)
        .delete("/api/clinical-notes/1")
        .set("Authorization", `Bearer ${tokenOtherUser}`);

      expect(res.status).toBe(403);
      expect(res.body.result).toBe(false);
    });
  });
});
