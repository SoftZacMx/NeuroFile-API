export type DashboardDayScope = "today" | "tomorrow";

export interface DashboardAppointmentDTO {
  id: number;
  date: string;
  status: boolean;
  attended: boolean | null;
  patientId: number;
  patientName: string;
}
