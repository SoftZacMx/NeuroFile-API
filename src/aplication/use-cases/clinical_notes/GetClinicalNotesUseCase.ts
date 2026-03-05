import { ClinicalNoteDTO } from "../../dtos/clinical_notes/ClinicalNoteDTO";
import { IClinicalNotesRepository } from "../../../domain/repositories/IClinicalNotesRepository";
import { IPrismaError } from "../../../domain/errors/IPrismaErrors";

export class GetClinicalNotesUseCase {

  constructor(
    private clinicalNoteRepository: IClinicalNotesRepository
  ) {}

  async execute(
    record_id: number,
    dateFrom?: string,
    dateTo?: string
  ): Promise<ClinicalNoteDTO[] | IPrismaError> {
    return this.clinicalNoteRepository.getNotes(record_id, dateFrom, dateTo);
  }

}
