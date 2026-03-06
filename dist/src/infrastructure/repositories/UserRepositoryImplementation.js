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
exports.UserRepositoryImpl = void 0;
const prisma_client_1 = __importDefault(require("../database/prisma/prisma.client"));
class UserRepositoryImpl {
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_client_1.default.user.findFirst({ where: { email } });
        });
    }
    createUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newUser = yield prisma_client_1.default.user.create({ data: user });
                return newUser;
            }
            catch (error) {
                console.error("Error creating user:", error);
                return null;
            }
        });
    }
    updateUser(user, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedUser = yield prisma_client_1.default.user.update({
                    where: { id: parseInt(user_id) },
                    data: user,
                });
                return updatedUser;
            }
            catch (error) {
                console.error("Error updating the user:", error);
                return null;
            }
        });
    }
    deleteUser(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedUser = yield prisma_client_1.default.user.delete({
                    where: { id: parseInt(user_id) },
                });
                return updatedUser;
            }
            catch (error) {
                console.error("Error deleting the user:", error);
                return null;
            }
        });
    }
    getUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const getUsers = yield prisma_client_1.default.user.findMany({ omit: { password: true } });
                return getUsers;
            }
            catch (error) {
                console.error("Error geting the users:", error);
                return null;
            }
        });
    }
    getUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const getUser = yield prisma_client_1.default.user.findUnique({
                    where: { id: parseInt(id) },
                });
                return getUser;
            }
            catch (error) {
                console.error("Error geting the user:", error);
                return null;
            }
        });
    }
}
exports.UserRepositoryImpl = UserRepositoryImpl;
