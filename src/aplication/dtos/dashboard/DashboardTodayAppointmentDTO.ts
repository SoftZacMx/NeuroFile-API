export interface DashboardTodayAppointmentDTO {
  id: number;
  date: string;
  status: boolean;
  attended: boolean | null;
  patientId: number;
  patientName: string;
}
