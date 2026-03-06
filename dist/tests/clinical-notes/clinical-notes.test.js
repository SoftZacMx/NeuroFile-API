"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../../src/app");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
let token;
let userId;
let patientId;
let recordId;
let createdNoteId;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    const loginRes = yield (0, supertest_1.default)(app_1.app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "iamsecure" });
    token = loginRes.body.data.token;
    const user = yield prisma.user.create({
        data: {
            first_name: "Clinical",
            last_name: "Tester",
            email: "clinote@example.com",
            password: "123456",
            role: "admin",
            phone: "555555551",
            is_active: true,
        },
    });
    userId = user.id;
    const patient = yield prisma.patient.create({
        data: {
            first_name: "Paciente",
            last_name: "Notas",
            age: "30",
            gender: "Femenino",
            address: "Calle Nota",
            is_active: true,
            occupation: "Psicóloga",
            phone: "555555552",
            user_id: user.id,
        },
    });
    patientId = patient.id;
    const record = yield prisma.record.create({
        data: {
            patient_id: patient.id,
            incident_details: "Incidente",
            physical_description: "Descripción",
            treatment_demand: "Demanda",
            school_area: "Área escolar",
            work_area: "Área laboral",
            significant_events: "Eventos",
            psychosexual_history: "Historia",
            therapeutic_focus: "Enfoque",
            therapeutic_goal: "Meta",
            therapeutic_strategy: "Estrategia",
            therapeutic_forecast: "Pronóstico",
            family_diagram: "Diagrama",
            family_relationship: "Relaciones",
            family_mapping: "Mapeo",
            diagnostic_impression: "Impresión",
            family_hypothesis: "Hipótesis",
            mental_exam: "Examen mental",
            diagnostic_notes: "Notas diagnósticas",
            consultation_reason: "Consulta",
        },
    });
    recordId = record.id;
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.clinicalNote.deleteMany({ where: { recordId } });
    yield prisma.record.delete({ where: { id: recordId } });
    yield prisma.patient.delete({ where: { id: patientId } });
    yield prisma.user.delete({ where: { id: userId } });
    yield prisma.$disconnect();
}));
const createNoteData = (offset = 0) => ({
    date: new Date(Date.now() + offset * 60000).toISOString(),
    note: `Nota clínica con offset ${offset}`,
    recordId,
});
const createNoteRequest = (note) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, supertest_1.default)(app_1.app)
        .post("/api/clinical-notes")
        .set("Authorization", `Bearer ${token}`)
        .send(note);
});
describe("Pruebas de Clinical Notes", () => {
    it("Debe crear varias notas clínicas correctamente", () => __awaiter(void 0, void 0, void 0, function* () {
        for (let i = 0; i < 3; i++) {
            const res = yield createNoteRequest(createNoteData(i));
            expect(res.status).toBe(200);
            expect(res.body.result).toBe(true);
            expect(res.body.data).toHaveProperty("id");
            if (i === 0)
                createdNoteId = res.body.data.id; // para futuras pruebas
        }
    }));
    it("Debe fallar al crear sin recordId", () => __awaiter(void 0, void 0, void 0, function* () {
        const note = Object.assign(Object.assign({}, createNoteData()), { recordId: undefined });
        const res = yield createNoteRequest(note);
        expect(res.status).toBeGreaterThanOrEqual(400);
        expect(res.body.result).toBe(false);
    }));
    it("Debe editar una nota correctamente", () => __awaiter(void 0, void 0, void 0, function* () {
        const update = {
            date: new Date().toISOString(),
            note: "Nota editada correctamente",
        };
        const res = yield (0, supertest_1.default)(app_1.app)
            .put(`/api/clinical-notes/${createdNoteId}`)
            .set("Authorization", `Bearer ${token}`)
            .send(update);
        expect(res.status).toBe(200);
        expect(res.body.result).toBe(true);
        expect(res.body.data.note).toBe(update.note);
    }));
    it("Debe eliminar una nota correctamente", () => __awaiter(void 0, void 0, void 0, function* () {
        const deleteRes = yield (0, supertest_1.default)(app_1.app)
            .delete(`/api/clinical-notes/${createdNoteId}`)
            .set("Authorization", `Bearer ${token}`);
        expect(deleteRes.status).toBe(200);
        expect(deleteRes.body.result).toBe(true);
        const getRes = yield (0, supertest_1.default)(app_1.app)
            .get(`/api/clinical-notes/${createdNoteId}`)
            .set("Authorization", `Bearer ${token}`);
        expect(getRes.status).toBeGreaterThan(404);
        expect(getRes.body.result).toBe(false);
    }));
});
