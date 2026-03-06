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
exports.getUserController = exports.getUsersController = exports.deleteUserController = exports.updateUserController = exports.createUserController = void 0;
const CreateUserUseCase_1 = require("../../aplication/use-cases/users/CreateUserUseCase");
const UserRepositoryImplementation_1 = require("../../infrastructure/repositories/UserRepositoryImplementation");
const response_helper_1 = require("../../shared/helpers/response.helper");
const UpdateUserUseCase_1 = require("../../aplication/use-cases/users/UpdateUserUseCase");
const DeleteUserUseCase_1 = require("../../aplication/use-cases/users/DeleteUserUseCase");
const GetUsersUseCase_1 = require("../../aplication/use-cases/users/GetUsersUseCase");
const GetUserUseCase_1 = require("../../aplication/use-cases/users/GetUserUseCase");
const userRepository = new UserRepositoryImplementation_1.UserRepositoryImpl();
const createUserUseCase = new CreateUserUseCase_1.CreateUserUseCase(userRepository);
const updateUserUseCase = new UpdateUserUseCase_1.UpdateUserUseCase(userRepository);
const deleteUserUseCase = new DeleteUserUseCase_1.DeleteUserUseCase(userRepository);
const getUsersUseCase = new GetUsersUseCase_1.GetUsersUseCase(userRepository);
const getUserUseCase = new GetUserUseCase_1.GetUserUseCase(userRepository);
const createUserController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newUser = yield createUserUseCase.execute(req.body);
        console.log("user creation user", newUser);
        if (newUser == null) {
            const error = (0, response_helper_1.errorResponse)('No pudo ser creado el usuario', 500);
            res.status(error.status_code).json(error);
        }
        const success = (0, response_helper_1.successResponse)(newUser, "Usuario creado con éxito");
        res.status(success.status_code).json(success);
    }
    catch (err) {
        console.error(err);
        const error = (0, response_helper_1.errorResponse)("Error al intentar crear el usario", 500);
        res.status(error.status_code).json(error);
    }
});
exports.createUserController = createUserController;
const updateUserController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id } = req.params;
        const userUpdated = yield updateUserUseCase.execute(req.body, user_id);
        if (!userUpdated) {
            const error = (0, response_helper_1.errorResponse)("It was not possible to update the user.", 400);
            res.status(error.status_code).json(error);
            return;
        }
        const success = (0, response_helper_1.successResponse)(userUpdated, "User updated successfuly");
        res.status(success.status_code).json(success);
    }
    catch (err) {
        console.error(err);
        const error = (0, response_helper_1.errorResponse)("Error trying to update the user", 500);
        res.status(error.status_code).json(error);
    }
});
exports.updateUserController = updateUserController;
const deleteUserController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id } = req.params;
        const userDeleted = yield deleteUserUseCase.execute(user_id);
        if (!userDeleted) {
            const error = (0, response_helper_1.errorResponse)("It was not possible to delete the user.", 400);
            res.status(error.status_code).json(error);
            return;
        }
        const success = (0, response_helper_1.successResponse)(userDeleted, "User deleted successfuly");
        res.status(success.status_code).json(success);
    }
    catch (err) {
        console.error(err);
        const error = (0, response_helper_1.errorResponse)("Error trying to delete the user", 500);
        res.status(error.status_code).json(error);
    }
});
exports.deleteUserController = deleteUserController;
const getUsersController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const usersGeted = yield getUsersUseCase.execute();
        if (!usersGeted) {
            const error = (0, response_helper_1.errorResponse)("It was not possible to get the users.", 400);
            res.status(error.status_code).json(error);
            return;
        }
        const success = (0, response_helper_1.successResponse)(usersGeted, "Users geted successfuly");
        res.status(success.status_code).json(success);
    }
    catch (err) {
        console.error(err);
        const error = (0, response_helper_1.errorResponse)("Error trying to get the users", 500);
        res.status(error.status_code).json(error);
    }
});
exports.getUsersController = getUsersController;
const getUserController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id } = req.params;
        const userGeted = yield getUserUseCase.execute(user_id);
        if (!userGeted) {
            const error = (0, response_helper_1.errorResponse)("It was not possible to find the user.", 400);
            res.status(error.status_code).json(error);
            return;
        }
        const success = (0, response_helper_1.successResponse)(userGeted, "Users geted successfuly");
        res.status(success.status_code).json(success);
    }
    catch (err) {
        console.error(err);
        const error = (0, response_helper_1.errorResponse)("Error trying to get the user", 500);
        res.status(error.status_code).json(error);
    }
});
exports.getUserController = getUserController;
