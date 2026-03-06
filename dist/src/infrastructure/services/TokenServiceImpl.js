"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
// src/infrastructure/services/TokenService.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class TokenService {
    constructor() {
        this.secret = process.env.JWT_SECRET || "default_secret";
    }
    generate(payload) {
        return jsonwebtoken_1.default.sign(payload, this.secret, {
            expiresIn: payload.type === "access" ? "1h" : "15m",
        });
    }
    verify(token) {
        try {
            return jsonwebtoken_1.default.verify(token, this.secret);
        }
        catch (error) {
            console.log('Error verifying token', error.TokenExpiredError);
            return null;
        }
    }
}
exports.TokenService = TokenService;
