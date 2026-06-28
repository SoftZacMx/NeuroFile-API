import { AppointmentDTO } from "../appointments/AppointmentDTO";
import { ClinicalNoteDTO } from "../clinical_notes/ClinicalNoteDTO";

export interface PatientSummaryDTO {
  nextAppointment: AppointmentDTO | null;
  lastAppointment: AppointmentDTO | null;
  lastNote: ClinicalNoteDTO | null;
  last4ClinicalNotes: ClinicalNoteDTO[];
}
