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
exports.verifyUserController = exports.loginController = void 0;
const UserRepositoryImplementation_1 = require("../../infrastructure/repositories/UserRepositoryImplementation");
const VerfifyUserUseCase_1 = require("../../aplication/use-cases/auth/VerfifyUserUseCase");
const AuthUseCase_1 = require("../../aplication/use-cases/auth/AuthUseCase");
const response_helper_1 = require("../../shared/helpers/response.helper");
const userRepository = new UserRepositoryImplementation_1.UserRepositoryImpl();
const verifyUseCase = new VerfifyUserUseCase_1.VerifyUserUseCase(userRepository);
const authUseCase = new AuthUseCase_1.AuthUseCase(userRepository);
const loginController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { email, password } = req.body;
        const token = yield authUseCase.execute(email, password);
        if (!token) {
            const error = (0, response_helper_1.errorResponse)('The token was not generated', 500);
            res.status(error.status_code).json(error);
            return;
        }
        const success = (0, response_helper_1.successResponse)(token, 'Login successful');
        res.status(success.status_code).json(success);
    }
    catch (error) {
        console.log('Auth - login - error: ', error);
        const error_response = (0, response_helper_1.errorResponse)((_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : 'Error en login', 500);
        res.status(error_response.status_code).json(error_response);
    }
});
exports.loginController = loginController;
const verifyUserController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield verifyUseCase.execute(email);
        console.log('user controller', user);
        if (!user) {
            res.status(401).send({ error: true, message: 'User not found' });
            return; // Termina aquí, sin return res.
        }
        res.status(200).send({ error: false, data: user, message: 'User found' });
    }
    catch (error) {
        console.log('Auth - verify user - error: ', error);
        res.status(500).send({ error: true, message: 'Server error' });
    }
});
exports.verifyUserController = verifyUserController;
