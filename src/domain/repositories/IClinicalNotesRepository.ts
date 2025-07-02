import { ClinicalNote } from "@prisma/client";
import { CreateClinicalNoteDTO } from "../../aplication/dtos/clinical_notes/CreateClinicalNoteDTO";
import { UpdateClinicalNoteDTO } from "../../aplication/dtos/clinical_notes/UpdateClinicalNoteDTO";
import { IPrismaError } from "../errors/IPrismaErrors";
import { ClinicalNoteDTO } from "../../aplication/dtos/clinical_notes/ClinicalNoteDTO";

export interface IClinicalNotesRepository {
    createNote(note:CreateClinicalNoteDTO): Promise<CreateClinicalNoteDTO  | IPrismaError>;
    updateNote(note:UpdateClinicalNoteDTO,note_id:number): Promise<UpdateClinicalNoteDTO | IPrismaError>;
    deleteNote(note_id:number): Promise<ClinicalNote | IPrismaError>;
    getNotes(record_id:number): Promise<ClinicalNote[] | IPrismaError>;
    getNote(note_id:number): Promise<ClinicalNote | IPrismaError|null>;

}