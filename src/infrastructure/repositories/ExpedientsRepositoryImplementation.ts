import prisma from "../database/prisma/prisma.client";
import { IUser } from "../../domain/entities/IUser";
import { CreateUserDTO } from "../../aplication/dtos/user/CreateUserDTO";
import { Prisma } from "@prisma/client";
import { IPrismaError } from "../../domain/errors/IPrismaErrors";
import { IRecord } from "../../domain/entities/IExpedient";
import { UpdateRecordDTO } from "../../aplication/dtos/expedients/UpdateExpedientDTO";
import { CreateRecordDTO } from "../../aplication/dtos/expedients/CreateExpedientDTO";
import { ExpedientDTO } from "../../aplication/dtos/expedients/ExpedientDTO";
import { mapPrismaError } from "../../domain/errors/IPrismaErrorsMapers";
export class ExpedientRepositoryImpl {
  async findByEmail(id: string): Promise<IRecord | null> {
    return prisma.record.findFirst({ where: { id: parseInt(id) } });
  }

  async createRecord(dto: CreateRecordDTO): Promise<ExpedientDTO | IPrismaError> {
    const record = await prisma.record.create({
      data: {
        incident_details: dto.incident_details,
        physical_description: dto.physical_description,
        treatment_demand: dto.treatment_demand,
        school_area: dto.school_area,
        work_area: dto.work_area,
        significant_events: dto.significant_events,
        psychosexual_history: dto.psychosexual_history,
        therapeutic_focus: dto.therapeutic_focus,
        therapeutic_goal: dto.therapeutic_goal,
        therapeutic_strategy: dto.therapeutic_strategy,
        therapeutic_forecast: dto.therapeutic_forecast,
        family_diagram: dto.family_diagram,
        family_relationship: dto.family_relationship,
        family_mapping: dto.family_mapping,
        diagnostic_impression: dto.diagnostic_impression,
        family_hypothesis: dto.family_hypothesis,
        mental_exam: dto.mental_exam,
        diagnostic_notes: dto.diagnostic_notes,
        consultation_reason: dto.consultation_reason,

        patient: {
          connect: { id: dto.patient_id },
        },

        symptoms: dto.symptoms
          ? {
              create: dto.symptoms.map((s) => ({
                detail: s.detail,
              })),
            }
          : undefined,

        diagnoses: dto.diagnoses
          ? {
              create: dto.diagnoses.map((d) => ({
                axis: d.axis,
                dcm: d.dcm,
                cie: d.cie,
                disorder: d.disorder,
              })),
            }
          : undefined,

        modalities: dto.modalities
          ? {
              create: dto.modalities.map((m) => ({
                ti: m.ti,
                tf: m.tf,
                tp: m.tp,
                tg: m.tg,
                other: m.other,
                rationale: m.rationale,
              })),
            }
          : undefined,
      },
      include: {
        symptoms: true,
        diagnoses: true,
        modalities: true,
      },
    });

    return record;
  }

  async updateRecord(dto: UpdateRecordDTO, id: number): Promise<UpdateRecordDTO | IPrismaError> {
    // 1. Actualizar campos simples del Record
    const updatedRecord = await prisma.record.update({
      where: { id },
      data: {
        incident_details: dto.incident_details,
        physical_description: dto.physical_description,
        treatment_demand: dto.treatment_demand,
        school_area: dto.school_area,
        work_area: dto.work_area,
        significant_events: dto.significant_events,
        psychosexual_history: dto.psychosexual_history,
        therapeutic_focus: dto.therapeutic_focus,
        therapeutic_goal: dto.therapeutic_goal,
        therapeutic_strategy: dto.therapeutic_strategy,
        therapeutic_forecast: dto.therapeutic_forecast,
        family_diagram: dto.family_diagram,
        family_relationship: dto.family_relationship,
        family_mapping: dto.family_mapping,
        diagnostic_impression: dto.diagnostic_impression,
        family_hypothesis: dto.family_hypothesis,
        mental_exam: dto.mental_exam,
        diagnostic_notes: dto.diagnostic_notes,
        consultation_reason: dto.consultation_reason,
      },
    });

    // 2. Reemplazar síntomas
    if (dto.symptoms) {
      await prisma.symptom.deleteMany({ where: { recordId: id } });
      await prisma.symptom.createMany({
        data: dto.symptoms.map((s: any) => ({
          detail: s.detail,
          recordId: id,
        })),
        skipDuplicates: true,
      });
    }

    // 3. Reemplazar diagnósticos
    if (dto.diagnoses) {
      await prisma.diagnosticImpression.deleteMany({ where: { recordId: id } });
      await prisma.diagnosticImpression.createMany({
        data: dto.diagnoses.map((d: any) => ({
          axis: d.axis || null,
          dcm: d.dcm || null,
          cie: d.cie || null,
          disorder: d.disorder || null,
          recordId: id,
        })),
        skipDuplicates: true,
      });
    }

    // 4. Reemplazar modalidades terapéuticas
    if (dto.modalities) {
      await prisma.therapeuticModality.deleteMany({ where: { recordId: id } });
      await prisma.therapeuticModality.createMany({
        data: dto.modalities.map((m: any) => ({
          ti: m.ti ?? false,
          tf: m.tf ?? false,
          tp: m.tp ?? false,
          tg: m.tg ?? false,
          other: m.other ?? false,
          rationale: m.rationale || null,
          recordId: id,
        })),
        skipDuplicates: true,
      });
    }

    return updatedRecord;
  }

  async deleteRecord(expedient_id: string): Promise<CreateRecordDTO | IPrismaError> {
    try {
      const deletedExpedient = await prisma.record.delete({
        where: { id: parseInt(expedient_id) },
      });
      return deletedExpedient;
    } catch (error) {
      console.error("Error deleting the user:", error);
      return mapPrismaError(error);
    }
  }

  async getExpedients(patientId?: number): Promise<ExpedientDTO[] | IPrismaError> {
    try {
      return await prisma.record.findMany({
        where: patientId != null ? { patient_id: patientId } : undefined,
        include: {
          symptoms: true,
          diagnoses: true,
          modalities: true,
          clinical_notes: true, // si también quieres notas clínicas
          patient: true,
        },
      });
    } catch (error) {
      console.error("Error geting the expedients:", error);
      return mapPrismaError(error);
    }
  }

  async getExpedient(id: number): Promise<ExpedientDTO | IPrismaError | null> {
    try {
      const expedient = await prisma.record.findUnique({
        where: { id: id},
        include:{
          symptoms: true,
          diagnoses: true,
          modalities: true,
          patient: true,
        }
      });
      return expedient;
    } catch (error) {
      console.error("Error geting the expedient:", error);
      return mapPrismaError(error)  ;
    }
  }

  async findByPatientId(patientId: number): Promise<ExpedientDTO | null> {
    return prisma.record.findFirst({
      where: { patient_id: patientId },
      orderBy: { id: "desc" },
      include: {
        symptoms: true,
        diagnoses: true,
        modalities: true,
        patient: true,
      },
    });
  }
}
