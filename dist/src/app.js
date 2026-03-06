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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
// index.ts
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = require("./interfaces/routes");
const swagger_1 = require("./infrastructure/config/swagger");
const prisma_client_1 = __importDefault(require("./infrastructure/database/prisma/prisma.client"));
exports.app = (0, express_1.default)();
exports.app.use((0, cors_1.default)());
exports.app.use(express_1.default.json());
exports.app.use(routes_1.router);
(0, swagger_1.setupSwagger)(exports.app);
const PORT = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3000;
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield prisma_client_1.default.$connect();
            console.log('✅ Conectado a la base de datos');
        }
        catch (error) {
            console.error('❌ Error al conectar con la base de datos:', error);
            process.exit(1);
        }
        exports.app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
            console.log(`Documentación Swagger en http://localhost:${PORT}/api/api-docs`);
        });
    });
}
start();
