import { CreateUserDTO } from "../../aplication/dtos/user/CreateUserDTO";
import { IUser } from "../entities/IUser";
import { IPrismaError } from "../errors/IPrismaErrors";
import { CreateRecordDTO } from "../../aplication/dtos/expedients/CreateExpedientDTO";
import { UpdateRecordDTO } from "../../aplication/dtos/expedients/UpdateExpedientDTO";
import { ExpedientDTO } from "../../aplication/dtos/expedients/ExpedientDTO";
export interface IExpedientRepository {
  createRecord(
    expedient: CreateRecordDTO
  ): Promise<ExpedientDTO  | IPrismaError>;
  updateRecord(
    expedient: UpdateRecordDTO,
    expedient_id: number
  ): Promise<UpdateRecordDTO | IPrismaError>;
  deleteRecord(expedient_id: string): Promise<CreateRecordDTO | IPrismaError>;
  getExpedients(): Promise<ExpedientDTO[] | IPrismaError>;
  getExpedient(expedient_id: number): Promise<ExpedientDTO | IPrismaError|null>;
  /** Primer record_id del paciente (para MCP: patientId → recordId). */
  getRecordIdByPatientId(patientId: number): Promise<number | null>;
}
