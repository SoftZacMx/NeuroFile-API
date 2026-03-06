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
exports.AuthUseCase = void 0;
const UserRepositoryImplementation_1 = require("../../../infrastructure/repositories/UserRepositoryImplementation");
const HashServiceImpl_1 = require("../../../infrastructure/services/HashServiceImpl");
const TokenServiceImpl_1 = require("../../../infrastructure/services/TokenServiceImpl");
class AuthUseCase {
    constructor(userRepository) {
        this.userRepository = new UserRepositoryImplementation_1.UserRepositoryImpl();
        this.hashService = new HashServiceImpl_1.BcryptHashService();
        this.tokenService = new TokenServiceImpl_1.TokenService();
    }
    execute(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findByEmail(email);
            if (!user)
                throw new Error('User not found');
            console.log('password', password);
            console.log('user found', user);
            const isMatch = yield this.hashService.compare(password, user.password);
            if (!isMatch)
                throw new Error('Password incorrect').message = 'Password Incorrect';
            const tokenPayload = {
                sub: `${user.id}`,
                type: "access",
                role: user.role,
            };
            const token = yield this.tokenService.generate(tokenPayload);
            return { token: token, user: user };
        });
    }
}
exports.AuthUseCase = AuthUseCase;
