import prisma from "../database/prisma/prisma.client";
import { IPatientSummaryRepository } from "../../domain/repositories/IPatientSummaryRepository";
import { PatientSummaryDTO } from "../../aplication/dtos/patients/PatientSummaryDTO";
import { IPrismaError } from "../../domain/errors/IPrismaErrors";
import { mapPrismaError } from "../../domain/errors/IPrismaErrorsMapers";

export class PatientSummaryRepositoryImpl implements IPatientSummaryRepository {
  async getSummary(patientId: number): Promise<PatientSummaryDTO | IPrismaError> {
    try {
      const [lastAppointment, last4ClinicalNotes] = await Promise.all([
        prisma.appointment.findFirst({
          where: { patientId },
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
        lastAppointment: lastAppointment
          ? {
              id: lastAppointment.id,
              date: lastAppointment.date,
              status: lastAppointment.status,
              attended: lastAppointment.attended,
              patientId: lastAppointment.patientId,
            }
          : null,
        lastNote,
        last4ClinicalNotes: last4,
      };

      return summary;
    } catch (error) {
      return mapPrismaError(error);
    }
  }
}
