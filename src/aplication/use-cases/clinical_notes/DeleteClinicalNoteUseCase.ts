import { ClinicalNoteDTO } from "../../dtos/clinical_notes/ClinicalNoteDTO";
import { IClinicalNotesRepository } from "../../../domain/repositories/IClinicalNotesRepository";
import { IPrismaError } from "../../../domain/errors/IPrismaErrors";

export class RemoveClinicalNoteUseCase {

  constructor(
    private clinicalNoteRepository: IClinicalNotesRepository
  ) {}

  async execute(note_id:number): Promise<ClinicalNoteDTO  | IPrismaError>  {
    return this.clinicalNoteRepository.deleteNote(note_id);
  }

}
