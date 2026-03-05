import { IPatient } from "../../../domain/entities/IPatients";
import { AppointmentDTO } from "../appointments/AppointmentDTO";

export interface PatientListItemDTO extends IPatient {
  last_appointment: AppointmentDTO | null;
}
