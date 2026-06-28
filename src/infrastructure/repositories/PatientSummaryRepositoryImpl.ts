import prisma from "../database/prisma/prisma.client";
import { IPatientSummaryRepository } from "../../domain/repositories/IPatientSummaryRepository";
import { PatientSummaryDTO } from "../../aplication/dtos/patients/PatientSummaryDTO";
import { AppointmentDTO } from "../../aplication/dtos/appointments/AppointmentDTO";
import { IPrismaError } from "../../domain/errors/IPrismaErrors";
import { mapPrismaError } from "../../domain/errors/IPrismaErrorsMapers";

function toAppointmentDTO(appointment: {
  id: number;
  date: Date;
  status: boolean;
  attended: boolean | null;
  patientId: number;
}): AppointmentDTO {
  return {
    id: appointment.id,
    date: appointment.date,
    status: appointment.status,
    attended: appointment.attended,
    patientId: appointment.patientId,
  };
}

const activeAppointmentFilter = { status: true };

export class PatientSummaryRepositoryImpl implements IPatientSummaryRepository {
  async getSummary(patientId: number): Promise<PatientSummaryDTO | IPrismaError> {
    try {
      const now = new Date();

      const [nextAppointment, lastAppointment, last4ClinicalNotes] = await Promise.all([
        prisma.appointment.findFirst({
          where: {
            patientId,
            ...activeAppointmentFilter,
            date: { gte: now },
          },
          orderBy: { date: "asc" },
        }),
        prisma.appointment.findFirst({
          where: {
            patientId,
            ...activeAppointmentFilter,
            date: { lt: now },
          },
          orderBy: { date: "desc" },
        }),
        prisma.clinicalNote.findMany({
          where: { record: { patient_id: patientId } },
          orderBy: { date: "desc" },
          take: 4,
        }),
      ]);

      const last4 = last4ClinicalNotes.map((n) => ({
        id: n.id,
        date: n.date,
        note: n.note,
        recordId: n.recordId,
      }));
      const lastNote = last4[0] ?? null;

      const summary: PatientSummaryDTO = {
        nextAppointment: nextAppointment ? toAppointmentDTO(nextAppointment) : null,
        lastAppointment: lastAppointment ? toAppointmentDTO(lastAppointment) : null,
        lastNote,
        last4ClinicalNotes: last4,
      };

      return summary;
    } catch (error) {
      return mapPrismaError(error);
    }
  }
}
