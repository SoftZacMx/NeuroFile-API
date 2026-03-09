import request from "supertest";
import { TokenService } from "../../src/infrastructure/services/TokenServiceImpl";

const PATIENT_ID = 1;
let token: string;
let app: import("express").Express;
let nextId = 1;

jest.mock("../../src/infrastructure/database/prisma/prisma.client", () => ({
  __esModule: true,
  default: {
    record: {
      create: jest.fn().mockImplementation((args: { data: Record<string, unknown>; include?: unknown }) => {
        const dto = args.data as {
          patient?: { connect: { id: number } };
          symptoms?: { create?: { detail: string }[] };
          diagnoses?: { create?: unknown[] };
          modalities?: { create?: unknown[] };
          [k: string]: unknown;
        };
        const patientId = dto.patient?.connect?.id ?? PATIENT_ID;
        const symptomsArr = Array.isArray(dto.symptoms?.create) ? dto.symptoms.create : [];
        const diagnosesArr = Array.isArray(dto.diagnoses?.create) ? dto.diagnoses.create : [];
        const modalitiesArr = Array.isArray(dto.modalities?.create) ? dto.modalities.create : [];
        return Promise.resolve({
          id: nextId++,
          patient_id: patientId,
          incident_details: dto.incident_details ?? "",
          physical_description: dto.physical_description ?? "",
          treatment_demand: dto.treatment_demand ?? "",
          school_area: dto.school_area ?? "",
          work_area: dto.work_area ?? "",
          significant_events: dto.significant_events ?? "",
          psychosexual_history: dto.psychosexual_history ?? "",
          therapeutic_focus: dto.therapeutic_focus ?? "",
          therapeutic_goal: dto.therapeutic_goal ?? "",
          therapeutic_strategy: dto.therapeutic_strategy ?? "",
          therapeutic_forecast: dto.therapeutic_forecast ?? "",
          family_diagram: dto.family_diagram ?? "",
          family_relationship: dto.family_relationship ?? "",
          family_mapping: dto.family_mapping ?? "",
          diagnostic_impression: dto.diagnostic_impression ?? "",
          family_hypothesis: dto.family_hypothesis ?? "",
          mental_exam: dto.mental_exam ?? "",
          diagnostic_notes: dto.diagnostic_notes ?? "",
          consultation_reason: dto.consultation_reason ?? "",
          created_at: new Date(),
          symptoms: symptomsArr.map((s: { detail: string }, i: number) => ({ id: i + 1, detail: s.detail, recordId: 1 })),
          diagnoses: diagnosesArr.map((_d: unknown, i: number) => ({ id: i + 1, recordId: 1 })),
          modalities: modalitiesArr.map((_m: unknown, i: number) => ({ id: i + 1, recordId: 1 })),
        });
      }),
    },
    $connect: jest.fn().mockResolvedValue(undefined),
  },
}));

beforeAll(async () => {
  process.env.JWT_SECRET = "test-secret";
  const tokenService = new TokenService();
  token = tokenService.generate({ sub: "1", type: "access", role: "admin" });
  const { app: appModule, appReady } = await import("../../src/app");
  app = appModule;
  await appReady;
  await new Promise<void>((r) => setImmediate(r));
  await new Promise((r) => setTimeout(r, 80));
});

const generateRecordData = () => ({
  incident_details: "Detalles del incidente",
  physical_description: "Descripción física",
  treatment_demand: "Demanda de tratamiento",
  school_area: "Área escolar",
  work_area: "Área de trabajo",
  significant_events: "Eventos significativos",
  psychosexual_history: "Historia psicosexual",
  therapeutic_focus: "Enfoque terapéutico",
  therapeutic_goal: "Meta terapéutica",
  therapeutic_strategy: "Estrategia terapéutica",
  therapeutic_forecast: "Pronóstico terapéutico",
  family_diagram: "Diagrama familiar",
  family_relationship: "Relación familiar",
  family_mapping: "Mapeo familiar",
  diagnostic_impression: "Impresión diagnóstica",
  family_hypothesis: "Hipótesis familiar",
  mental_exam: "Examen mental",
  diagnostic_notes: "Notas diagnósticas",
  consultation_reason: "Razón de consulta",
  patient_id: PATIENT_ID,
  symptoms: [
    { detail: "Síntoma 1" },
    { detail: "Síntoma 2" },
  ],
  modalities: [
    { ti: true, rationale: "Razonamiento 1" },
    { tp: true, rationale: "Razonamiento 2" },
  ],
  diagnoses: [
    { axis: "Eje I", dcm: "D001", cie: "CIE10-01", disorder: "Trastorno A" },
  ],
});

describe("Pruebas de Records clínicos (con campos completos)", () => {
  it("Debe crear un record completo correctamente", async () => {
    const record = generateRecordData();

    const res = await request(app)
      .post("/api/expedients")
      .set("Authorization", `Bearer ${token}`)
      .send(record);

    expect(res.status).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data.symptoms.length).toBe(2);
    expect(res.body.data.modalities.length).toBe(2);
    expect(res.body.data.diagnoses.length).toBe(1);
  });

  it("Debe fallar si falta el patient_id", async () => {
    const baseRecord = generateRecordData();
    const { patient_id: _, ...invalidRecord } = baseRecord;

    const res = await request(app)
      .post("/api/expedients")
      .set("Authorization", `Bearer ${token}`)
      .send(invalidRecord);

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body.result).toBe(false);
  });
});
