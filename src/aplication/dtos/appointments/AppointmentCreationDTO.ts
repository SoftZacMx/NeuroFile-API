export interface CreateAppointmentDTO {
  date: Date;
  status?: boolean;
  attended?: boolean;
  patientId: number;
}