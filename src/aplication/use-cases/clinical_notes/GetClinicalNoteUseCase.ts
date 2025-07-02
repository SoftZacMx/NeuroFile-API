import { ClinicalNoteDTO } from "../../dtos/clinical_notes/ClinicalNoteDTO";
import { IClinicalNotesRepository } from "../../../domain/repositories/IClinicalNotesRepository";
import { IPrismaError } from "../../../domain/errors/IPrismaErrors";
import { ClinicalNote } from "@prisma/client";

export class GetClinicalNoteUseCase {

  constructor(
    private clinicalNoteRepository: IClinicalNotesRepository
  ) {}

  async execute(note_id:number): Promise<ClinicalNote|IPrismaError|null>  {
    return this.clinicalNoteRepository.getNote(note_id);
  }

}
