import { AppointmentDTO } from "../../aplication/dtos/appointments/AppointmentDTO";
import { CreateAppointmentDTO } from "../../aplication/dtos/appointments/AppointmentCreationDTO";
import { UpdateAppointmentDTO } from "../../aplication/dtos/appointments/AppointmentUpdateDTO";
import { IPrismaError } from "../errors/IPrismaErrors";

export interface IAppointmentRepository {
  createAppointment(dto: CreateAppointmentDTO): Promise<AppointmentDTO | IPrismaError>;
  updateAppointment(id: number, dto: UpdateAppointmentDTO): Promise<AppointmentDTO | IPrismaError | null>;
  deleteAppointment(id: number): Promise<AppointmentDTO | IPrismaError>;
  getAppointment(id: number): Promise<AppointmentDTO | IPrismaError | null>;
  getAppointments(
    patientId?: number,
    dateFrom?: string,
    dateTo?: string
  ): Promise<AppointmentDTO[] | IPrismaError>;
}