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
let createdAppointments = [];
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    const loginRes = yield (0, supertest_1.default)(app_1.app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "iamsecure" });
    token = loginRes.body.data.token;
    const user = yield prisma.user.create({
        data: {
            first_name: "Appointment",
            last_name: "Test",
            middle_last_name: null,
            role: "admin",
            password: "123456",
            email: `apptestuser@example.com`,
            is_active: true,
            phone: `5559990000`,
        },
    });
    userId = user.id;
    const patient = yield prisma.patient.create({
        data: {
            first_name: "Cita",
            last_name: "Paciente",
            second_last_name: null,
            age: "30",
            gender: "Masculino",
            address: "Av. Siempre Viva 123",
            is_active: true,
            occupation: "Doctor",
            phone: `5557779999`,
            user_id: user.id,
        },
    });
    patientId = patient.id;
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.appointment.deleteMany({
        where: { id: { in: createdAppointments } },
    });
    yield prisma.patient.delete({ where: { id: patientId } });
    yield prisma.user.delete({ where: { id: userId } });
    yield prisma.$disconnect();
}));
const generateAppointmentData = (offsetMinutes = 0) => ({
    date: new Date(Date.now() + offsetMinutes * 60 * 1000).toISOString(),
    attended: false,
    patientId,
});
const createTestAppointment = (appointment) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const res = yield (0, supertest_1.default)(app_1.app)
        .post("/api/appointments")
        .set("Authorization", `Bearer ${token}`)
        .send(appointment);
    if ((_b = (_a = res.body) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.id)
        createdAppointments.push(res.body.data.id);
    return res;
});
describe("Pruebas de creación, edición y eliminación de citas", () => {
    it("Debe crear múltiples citas correctamente", () => __awaiter(void 0, void 0, void 0, function* () {
        const count = 5;
        for (let i = 0; i < count; i++) {
            const appointment = generateAppointmentData(i * 10); // cada 10 minutos
            const res = yield createTestAppointment(appointment);
            expect(res.status).toBe(200);
            expect(res.body.result).toBe(true);
            expect(res.body.data).toHaveProperty("id");
        }
    }));
    it("Debe editar una cita correctamente", () => __awaiter(void 0, void 0, void 0, function* () {
        const appointment = generateAppointmentData();
        const resCreate = yield createTestAppointment(appointment);
        const appointmentId = resCreate.body.data.id;
        console.log('resCreate', resCreate.body);
        const updatedData = {
            date: new Date(Date.now() + 3600 * 1000).toISOString(), // +1 hora
            attended: true,
        };
        const resUpdate = yield (0, supertest_1.default)(app_1.app)
            .put(`/api/appointments/${appointmentId}`)
            .set("Authorization", `Bearer ${token}`)
            .send(updatedData);
        expect(resUpdate.status).toBe(200);
        expect(resUpdate.body.data.attended).toBe(true);
        expect(new Date(resUpdate.body.data.date).getTime()).toBeGreaterThan(Date.now());
    }));
    it("Debe eliminar una cita correctamente", () => __awaiter(void 0, void 0, void 0, function* () {
        const appointment = generateAppointmentData();
        const resCreate = yield createTestAppointment(appointment);
        const appointmentId = resCreate.body.data.id;
        const resDelete = yield (0, supertest_1.default)(app_1.app)
            .delete(`/api/appointments/${appointmentId}`)
            .set("Authorization", `Bearer ${token}`);
        expect(resDelete.status).toBe(200);
        expect(resDelete.body.data.id).toBe(appointmentId);
        // Validar que ya no existe
        const resGet = yield (0, supertest_1.default)(app_1.app)
            .get(`/api/appointments/${appointmentId}`)
            .set("Authorization", `Bearer ${token}`);
        expect(resGet.status).toBe(500);
    }));
});
