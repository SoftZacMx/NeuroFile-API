// src/infrastructure/repositories/ClinicalNoteRepositoryImpl.ts
import prisma from "../database/prisma/prisma.client";
import { CreateClinicalNoteDTO } from "../../aplication/dtos/clinical_notes/CreateClinicalNoteDTO";
import { UpdateClinicalNoteDTO } from "../../aplication/dtos/clinical_notes/UpdateClinicalNoteDTO";
import { mapPrismaError } from "../../domain/errors/IPrismaErrorsMapers";

function toDate(value: Date | string): Date {
  if (value instanceof Date) return value;
  const str = String(value);
  return new Date(str.includes("T") ? str : `${str}T12:00:00.000Z`);
}

export class ClinicalNoteRepositoryImpl {

  async createNote(dto: CreateClinicalNoteDTO) {
    try {
      const dateValue = toDate(dto.date as Date | string);
      const note = await prisma.clinicalNote.create({
        data: {
          date: dateValue,
          note: dto.note,
          record: {
            connect: { id: dto.recordId },
          },
        },
      });
      return note;
    } catch (error) {
      return mapPrismaError(error);
    }
  }

  async updateNote(dto: UpdateClinicalNoteDTO, note_id: number) {
    try {
      const data: { date?: Date; note?: string } = {};
      if (dto.note !== undefined) data.note = dto.note;
      if (dto.date !== undefined) {
        data.date = toDate(dto.date as Date | string);
      }
      const updatedNote = await prisma.clinicalNote.update({
        where: { id: note_id },
        data,
      });
      return updatedNote;
    } catch (error) {
      console.error("Error updating clinical note:", error);
      return mapPrismaError(error);
    }
  }

  async deleteNote(noteId: number) {
    try {
      return await prisma.clinicalNote.delete({
        where: { id: noteId },
      });
    } catch (error) {
      console.error("Error deleting clinical note:", error);
      return mapPrismaError(error);
    }
  }

  async getNotes(recordId: number, dateFrom?: string, dateTo?: string) {
    try {
      const where: { recordId: number; date?: { gte?: Date; lte?: Date } } = {
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
      return await prisma.clinicalNote.findMany({
        where,
        orderBy: { date: "desc" },
      });
    } catch (error) {
      console.error("Error retrieving clinical notes:", error);
      return mapPrismaError(error);
    }
  }

  async getNote(noteId: number){
    try {
      console.log('note id',noteId);
      
      return await prisma.clinicalNote.findUnique({
        where: { id: noteId },
      });
    } catch (error) {
      return mapPrismaError(error);
    }
  }
}
