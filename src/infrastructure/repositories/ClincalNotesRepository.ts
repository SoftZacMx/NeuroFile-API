// src/infrastructure/repositories/ClinicalNoteRepositoryImpl.ts
import prisma from "../database/prisma/prisma.client";
import { CreateClinicalNoteDTO } from "../../aplication/dtos/clinical_notes/CreateClinicalNoteDTO";
import { UpdateClinicalNoteDTO } from "../../aplication/dtos/clinical_notes/UpdateClinicalNoteDTO";
import { mapPrismaError } from "../../domain/errors/IPrismaErrorsMapers";

export class ClinicalNoteRepositoryImpl {

  async createNote(dto: CreateClinicalNoteDTO) {
    try {
      const note = await prisma.clinicalNote.create({
        data: {
          date: dto.date,
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
      const updatedNote = await prisma.clinicalNote.update({
        where: { id: note_id },
        data: {
          date: dto.date,
          note: dto.note,
        },
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

  async getNotes(recordId: number) {
    try {
      return await prisma.clinicalNote.findMany({
        where: { recordId },
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
