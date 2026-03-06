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
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const bcryptjs_1 = require("bcryptjs");
const prisma = new client_1.PrismaClient();
const PASSWORD_SEED = 'NeuroFile2025';
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const passwordHash = yield (0, bcryptjs_1.hash)(PASSWORD_SEED, 8);
        // Limpiar en orden por dependencias (hijos antes que padres)
        yield prisma.clinicalNote.deleteMany({});
        yield prisma.symptom.deleteMany({});
        yield prisma.therapeuticModality.deleteMany({});
        yield prisma.diagnosticImpression.deleteMany({});
        yield prisma.record.deleteMany({});
        yield prisma.appointment.deleteMany({});
        yield prisma.patient.deleteMany({});
        yield prisma.user.deleteMany({});
        const user1 = yield prisma.user.create({
            data: {
                first_name: 'María',
                last_name: 'García',
                middle_last_name: 'López',
                role: 'admin',
                password: passwordHash,
                email: 'maria.garcia@neurofile.com',
                phone: '+5215512345001',
                is_active: true,
            },
        });
        const user2 = yield prisma.user.create({
            data: {
                first_name: 'Carlos',
                last_name: 'Rodríguez',
                middle_last_name: null,
                role: 'therapist',
                password: passwordHash,
                email: 'carlos.rodriguez@neurofile.com',
                phone: '+5215512345002',
                is_active: true,
            },
        });
        const user3 = yield prisma.user.create({
            data: {
                first_name: 'Ana',
                last_name: 'Martínez',
                middle_last_name: 'Sánchez',
                role: 'therapist',
                password: passwordHash,
                email: 'ana.martinez@neurofile.com',
                phone: '+5215512345003',
                is_active: true,
            },
        });
        yield prisma.patient.create({
            data: {
                first_name: 'Luis',
                last_name: 'Hernández',
                second_last_name: 'Pérez',
                age: '28',
                gender: 'M',
                address: 'Calle Principal 123, Ciudad de México',
                occupation: 'Ingeniero',
                phone: '+5215598765001',
                user_id: user1.id,
                is_active: true,
            },
        });
        yield prisma.patient.create({
            data: {
                first_name: 'Rosa',
                last_name: 'Flores',
                second_last_name: null,
                age: '35',
                gender: 'F',
                address: 'Av. Central 456',
                occupation: 'Docente',
                phone: '+5215598765002',
                user_id: user1.id,
                is_active: true,
            },
        });
        yield prisma.patient.create({
            data: {
                first_name: 'Pedro',
                last_name: 'Ramírez',
                second_last_name: 'Gómez',
                age: '42',
                gender: 'M',
                address: null,
                occupation: 'Arquitecto',
                phone: '+5215598765003',
                user_id: user2.id,
                is_active: true,
            },
        });
        yield prisma.patient.create({
            data: {
                first_name: 'Laura',
                last_name: 'Díaz',
                second_last_name: 'Torres',
                age: '31',
                gender: 'F',
                address: 'Col. Centro 789',
                occupation: 'Psicóloga',
                phone: '+5215598765004',
                user_id: user3.id,
                is_active: true,
            },
        });
        console.log('✅ Seed completado: 3 usuarios y 4 pacientes creados.');
        console.log('   Contraseña para todos los usuarios:', PASSWORD_SEED);
    });
}
main()
    .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
