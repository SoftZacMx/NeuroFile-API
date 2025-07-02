export interface AppointmentDTO {
  id: number;
  date: Date;
  status: boolean;
  attended: boolean | null;
  patientId: number;
}