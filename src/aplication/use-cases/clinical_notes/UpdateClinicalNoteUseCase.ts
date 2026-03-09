import { IClinicalNotesRepository } from "../../../domain/repositories/IClinicalNotesRepository";
import { IPrismaError } from "../../../domain/errors/IPrismaErrors";
import { UpdateClinicalNoteDTO } from "../../dtos/clinical_notes/UpdateClinicalNoteDTO";
import { ForbiddenError } from "../../../domain/errors/ForbiddenError";

export class UpdateClinicalNoteUseCase {
  constructor(private clinicalNoteRepository: IClinicalNotesRepository) {}

  async execute(dto: UpdateClinicalNoteDTO, note_id: number, currentUserId: number): Promise<UpdateClinicalNoteDTO | IPrismaError> {
    const note = await this.clinicalNoteRepository.getNote(note_id);
    if (!note || (typeof note === "object" && "code" in note)) return this.clinicalNoteRepository.updateNote(dto, note_id);
    const withRecord = note as { record?: { patient?: { user_id: number } } };
    if (withRecord.record?.patient?.user_id !== currentUserId) throw new ForbiddenError();
    return this.clinicalNoteRepository.updateNote(dto, note_id);
  }
}
