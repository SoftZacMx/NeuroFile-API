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
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    // Iniciar sesión y obtener token
    const loginRes = yield (0, supertest_1.default)(app_1.app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "iamsecure" });
    token = loginRes.body.data.token;
    // Crear un usuario base para asociar pacientes
    const userRes = yield prisma.user.create({
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
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    // Eliminar pacientes de prueba
    yield prisma.patient.deleteMany({
        where: {
            phone: {
                startsWith: "555777",
            },
        },
    });
    // Eliminar el usuario de prueba
    yield prisma.user.delete({
        where: { id: userId },
    });
    yield prisma.$disconnect();
}));
// Función auxiliar para generar datos de paciente
const generatePatientData = (index) => ({
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
const createTestPatient = (patient, token) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, supertest_1.default)(app_1.app)
        .post("/api/patients")
        .set("Authorization", `Bearer ${token}`)
        .send(patient);
});
describe("Pruebas de creación de pacientes", () => {
    it("Debe crear un paciente correctamente", () => __awaiter(void 0, void 0, void 0, function* () {
        const patient = generatePatientData(1);
        const res = yield createTestPatient(patient, token);
        expect(res.status).toBe(200);
        expect(res.body.result).toBe(true);
        expect(res.body.data).toHaveProperty("id");
        expect(res.body.data.phone).toBe(patient.phone);
    }));
    it("Debe fallar si el teléfono ya existe", () => __awaiter(void 0, void 0, void 0, function* () {
        const patient = generatePatientData(2);
        yield createTestPatient(patient, token); // crear primero
        const res = yield createTestPatient(patient, token); // intentar duplicar
        expect(res.status).toBeGreaterThanOrEqual(400);
        expect(res.body.result).toBe(false);
    }));
    it("Debe fallar si falta el nombre", () => __awaiter(void 0, void 0, void 0, function* () {
        const basePatient = generatePatientData(3);
        // Hacemos que todas las propiedades sean opcionales para poder usar delete
        const patient = Object.assign({}, basePatient);
        delete patient.first_name;
        const res = yield createTestPatient(patient, token);
        expect(res.status).toBeGreaterThanOrEqual(400);
        expect(res.body.result).toBe(false);
    }));
    it('Debe fallar si no hay user_id', () => __awaiter(void 0, void 0, void 0, function* () {
        const basePatient = generatePatientData(4);
        const patient = Object.assign({}, basePatient);
        delete patient.user_id;
        const res = yield createTestPatient(patient, token);
        expect(res.status).toBeGreaterThanOrEqual(400);
        expect(res.body.result).toBe(false);
    }));
});
