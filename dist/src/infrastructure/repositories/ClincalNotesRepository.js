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
exports.ClinicalNoteRepositoryImpl = void 0;
// src/infrastructure/repositories/ClinicalNoteRepositoryImpl.ts
const prisma_client_1 = __importDefault(require("../database/prisma/prisma.client"));
const IPrismaErrorsMapers_1 = require("../../domain/errors/IPrismaErrorsMapers");
function toDate(value) {
    if (value instanceof Date)
        return value;
    const str = String(value);
    return new Date(str.includes("T") ? str : `${str}T12:00:00.000Z`);
}
class ClinicalNoteRepositoryImpl {
    createNote(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const dateValue = toDate(dto.date);
                const note = yield prisma_client_1.default.clinicalNote.create({
                    data: {
                        date: dateValue,
                        note: dto.note,
                        record: {
                            connect: { id: dto.recordId },
                        },
                    },
                });
                return note;
            }
            catch (error) {
                return (0, IPrismaErrorsMapers_1.mapPrismaError)(error);
            }
        });
    }
    updateNote(dto, note_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = {};
                if (dto.note !== undefined)
                    data.note = dto.note;
                if (dto.date !== undefined) {
                    data.date = toDate(dto.date);
                }
                const updatedNote = yield prisma_client_1.default.clinicalNote.update({
                    where: { id: note_id },
                    data,
                });
                return updatedNote;
            }
            catch (error) {
                console.error("Error updating clinical note:", error);
                return (0, IPrismaErrorsMapers_1.mapPrismaError)(error);
            }
        });
    }
    deleteNote(noteId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield prisma_client_1.default.clinicalNote.delete({
                    where: { id: noteId },
                });
            }
            catch (error) {
                console.error("Error deleting clinical note:", error);
                return (0, IPrismaErrorsMapers_1.mapPrismaError)(error);
            }
        });
    }
    getNotes(recordId, dateFrom, dateTo) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const where = {
                    recordId,
                };
                if (dateFrom != null || dateTo != null) {
                    where.date = {};
                    if (dateFrom != null) {
                        where.date.gte = new Date(`${dateFrom}T00:00:00.000Z`);
                    }
                    if (dateTo != null) {
                        where.date.lte = new Date(`${dateTo}T23:59:59.999Z`);
                    }
                }
                return yield prisma_client_1.default.clinicalNote.findMany({
                    where,
                    orderBy: { date: "desc" },
                });
            }
            catch (error) {
                console.error("Error retrieving clinical notes:", error);
                return (0, IPrismaErrorsMapers_1.mapPrismaError)(error);
            }
        });
    }
    getNote(noteId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('note id', noteId);
                return yield prisma_client_1.default.clinicalNote.findUnique({
                    where: { id: noteId },
                });
            }
            catch (error) {
                return (0, IPrismaErrorsMapers_1.mapPrismaError)(error);
            }
        });
    }
}
exports.ClinicalNoteRepositoryImpl = ClinicalNoteRepositoryImpl;
