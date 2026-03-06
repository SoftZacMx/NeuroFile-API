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
const totalUsers = 20;
let token;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    const loginRes = yield (0, supertest_1.default)(app_1.app)
        .post('/api/auth/login')
        .send({ email: 'karina.gomex@example.com', password: 'iamsecure' });
    token = loginRes.body.data.token;
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    // Limpia los usuarios de prueba que se crearon
    yield prisma.user.deleteMany({
        where: {
            email: {
                startsWith: 'testuser',
            },
        },
    });
    yield prisma.$disconnect();
}));
// ✅ Función para generar datos únicos
const generateUserData = (index) => ({
    phone: `555000${index.toString().padStart(4, '0')}`,
    first_name: `Nombre${index}`,
    last_name: `ApellidoP${index}`,
    middle_last_name: `ApellidoM${index}`,
    role: 'admin',
    password: 'password',
    email: `testuser${index}@example.com`,
    is_active: true,
});
// ✅ Función auxiliar para crear usuario
const createTestUser = (user, token) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, supertest_1.default)(app_1.app)
        .post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send(user);
});
// ✅ Función auxiliar para editar usuario
const editTestUser = (userId, updatedData, token) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, supertest_1.default)(app_1.app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData);
});
describe('Pruebas de creación y edición de usuarios', () => {
    it(`Debe crear ${totalUsers} usuarios únicos correctamente`, () => __awaiter(void 0, void 0, void 0, function* () {
        for (let i = 0; i < totalUsers; i++) {
            const user = generateUserData(i);
            const res = yield createTestUser(user, token);
            expect(res.status).toBe(200);
            expect(res.body.result).toBe(true);
            expect(res.body.data).toHaveProperty('id');
        }
    }));
    it('Debe fallar si el correo ya existe', () => __awaiter(void 0, void 0, void 0, function* () {
        const user = generateUserData(999);
        yield createTestUser(user, token); // crear primero
        const res = yield createTestUser(user, token); // intentar duplicar
        expect(res.status).toBeGreaterThanOrEqual(500);
        expect(res.body.result).toBe(false);
    }));
    it('Debe fallar si falta el email', () => __awaiter(void 0, void 0, void 0, function* () {
        const baseUser = generateUserData(1000);
        const user = Object.assign({}, baseUser);
        delete user.email;
        const res = yield createTestUser(user, token);
        expect(res.status).toBe(500);
        expect(res.body.result).toBe(false);
    }));
    it('Debe editar correctamente un usuario existente', () => __awaiter(void 0, void 0, void 0, function* () {
        // Crear usuario base
        const originalUser = generateUserData(2000);
        const createRes = yield createTestUser(originalUser, token);
        expect(createRes.status).toBe(200);
        const userId = createRes.body.data.id;
        // Datos actualizados
        const updatedData = {
            first_name: 'NombreActualizado',
            last_name: 'ApellidoActualizado',
            phone: '5551234567',
        };
        // Ejecutar edición
        const editRes = yield editTestUser(userId, updatedData, token);
        expect(editRes.status).toBe(200);
        expect(editRes.body.result).toBe(true);
        expect(editRes.body.data.first_name).toBe('NombreActualizado');
        expect(editRes.body.data.last_name).toBe('ApellidoActualizado');
        expect(editRes.body.data.phone).toBe('5551234567');
    }));
});
