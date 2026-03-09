import { ClinicalNoteDTO } from "../../dtos/clinical_notes/ClinicalNoteDTO";
import { IClinicalNotesRepository } from "../../../domain/repositories/IClinicalNotesRepository";
import { IPrismaError } from "../../../domain/errors/IPrismaErrors";
import { ForbiddenError } from "../../../domain/errors/ForbiddenError";

export class RemoveClinicalNoteUseCase {
  constructor(private clinicalNoteRepository: IClinicalNotesRepository) {}

  async execute(note_id: number, currentUserId: number): Promise<ClinicalNoteDTO | IPrismaError> {
    const note = await this.clinicalNoteRepository.getNote(note_id);
    if (!note || (typeof note === "object" && "code" in note)) return this.clinicalNoteRepository.deleteNote(note_id);
    const withRecord = note as { record?: { patient?: { user_id: number } } };
    if (withRecord.record?.patient?.user_id !== currentUserId) throw new ForbiddenError();
    return this.clinicalNoteRepository.deleteNote(note_id);
  }
}
