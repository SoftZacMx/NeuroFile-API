import { CreateClinicalNoteDTO } from "../../dtos/clinical_notes/CreateClinicalNoteDTO";
import { IClinicalNotesRepository } from "../../../domain/repositories/IClinicalNotesRepository";
import { IPrismaError } from "../../../domain/errors/IPrismaErrors";
import { UpdateClinicalNoteDTO } from "../../dtos/clinical_notes/UpdateClinicalNoteDTO";
export class UpdateClinicalNoteUseCase {

  constructor(
    private clinicalNoteRepository: IClinicalNotesRepository
  ) {}

  async execute(dto: UpdateClinicalNoteDTO,note_id:number): Promise<UpdateClinicalNoteDTO  | IPrismaError>  {
    return this.clinicalNoteRepository.updateNote(dto,note_id);
  }

}
