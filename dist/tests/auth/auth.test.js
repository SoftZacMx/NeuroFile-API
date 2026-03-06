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
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
describe('🔐 Pruebas de Login', () => {
    const testUser = {
        email: 'loginuser@example.com',
        password: 'supersecure',
    };
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Crea un usuario de prueba con contraseña encriptada
        const hashedPassword = yield bcrypt_1.default.hash(testUser.password, 10);
        yield prisma.user.upsert({
            where: { email: testUser.email },
            update: {},
            create: {
                email: testUser.email,
                password: hashedPassword,
                first_name: 'Login',
                last_name: 'Tester',
                middle_last_name: 'Unit',
                role: 'admin',
                is_active: true,
                phone: '5559990000',
            },
        });
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield prisma.user.deleteMany({
            where: {
                email: {
                    in: [testUser.email, 'nonexistent@example.com'],
                },
            },
        });
        yield prisma.$disconnect();
    }));
    it('✅ Login exitoso con credenciales válidas', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.app)
            .post('/api/auth/login')
            .send({
            email: testUser.email,
            password: testUser.password,
        });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('data.token');
        expect(res.body.data.user.email).toBe(testUser.email);
    }));
    it('❌ Login fallido con contraseña incorrecta', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.app)
            .post('/api/auth/login')
            .send({
            email: testUser.email,
            password: 'wrongpassword',
        });
        expect(res.status).toBe(401); // o 400 dependiendo de tu API
        expect(res.body).toHaveProperty('result', false);
        expect(res.body).toHaveProperty('message');
    }));
    it('❌ Login fallido con email inexistente', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.app)
            .post('/api/auth/login')
            .send({
            email: 'nonexistent@example.com',
            password: 'somepassword',
        });
        expect(res.status).toBe(401); // o 400
        expect(res.body.result).toBe(false);
        expect(res.body).toHaveProperty('message');
    }));
    it('❌ Login fallido con campos faltantes', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.app)
            .post('/api/auth/login')
            .send({
            email: '', // vacío
            password: '',
        });
        expect(res.status).toBe(400); // Valida que tu backend esté manejando esto correctamente
        expect(res.body.result).toBe(false);
    }));
});
