import { IClinicalNotesRepository } from "../../../domain/repositories/IClinicalNotesRepository";
import { IPrismaError } from "../../../domain/errors/IPrismaErrors";
import { ClinicalNote } from "@prisma/client";
import { ForbiddenError } from "../../../domain/errors/ForbiddenError";

export class GetClinicalNoteUseCase {
  constructor(private clinicalNoteRepository: IClinicalNotesRepository) {}

  async execute(note_id: number, currentUserId: number): Promise<ClinicalNote | IPrismaError | null> {
    const note = await this.clinicalNoteRepository.getNote(note_id);
    if (!note || (typeof note === "object" && "code" in note)) return note;
    const withRecord = note as ClinicalNote & { record?: { patient?: { user_id: number } } };
    if (withRecord.record?.patient?.user_id !== currentUserId) throw new ForbiddenError();
    return note;
  }
}
