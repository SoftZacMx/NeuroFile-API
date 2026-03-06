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
exports.CreateUserUseCase = void 0;
const HashServiceImpl_1 = require("../../../infrastructure/services/HashServiceImpl");
class CreateUserUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
        this.hasService = new HashServiceImpl_1.BcryptHashService();
    }
    execute(user) {
        return __awaiter(this, void 0, void 0, function* () {
            user.password = yield this.hasService.hash(user.password);
            return this.userRepository.createUser(user);
        });
    }
}
exports.CreateUserUseCase = CreateUserUseCase;
