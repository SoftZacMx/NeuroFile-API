import { CreateClinicalNoteDTO } from "../../dtos/clinical_notes/CreateClinicalNoteDTO";
import { IClinicalNotesRepository } from "../../../domain/repositories/IClinicalNotesRepository";
import { IPrismaError } from "../../../domain/errors/IPrismaErrors";
export class CreateClinicalNoteUseCase {
  constructor(
    private clinicalNoteRepository: IClinicalNotesRepository
  ) {}

  async execute(dto: CreateClinicalNoteDTO): Promise<CreateClinicalNoteDTO  | IPrismaError>  {
    return this.clinicalNoteRepository.createNote(dto);
  }
}
