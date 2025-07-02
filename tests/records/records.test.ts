import request from "supertest";
import { app } from "../../src/app";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
let token: string;
let userId: number;
let patientId: number;

beforeAll(async () => {
  // Login and get token
  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email: "test@example.com", password: "iamsecure" });

  token = loginRes.body.data.token;

  // Create a user
  const user = await prisma.user.create({
    data: {
      first_name: "Record",
      last_name: "Test",
      role: "admin",
      password: "123456",
      email: `recordtestuser@example.com`,
      is_active: true,
      phone: `5559991111`,
    },
  });
  userId = user.id;

  // Create a patient
  const patient = await prisma.patient.create({
    data: {
      first_name: "Paciente",
      last_name: "Test",
      age: "30",
      gender: "Masculino",
      is_active: true,
      occupation: "Doctor",
      phone: `5557778888`,
      user_id: userId,
    },
  });
  patientId = patient.id;
});

afterAll(async () => {
  // Cleanup
  await prisma.record.deleteMany({ where: { patient_id: patientId } });
  await prisma.patient.delete({ where: { id: patientId } });
  await prisma.user.delete({ where: { id: userId } });
  await prisma.$disconnect();
});

// Generate full record data
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
  patient_id: patientId,
  symptoms: [
    { detail: "Síntoma 1" },
    { detail: "Síntoma 2" },
  ],
  modalities: [
    { ti: true, rationale: "Razonamiento 1" },
    { tp: true, rationale: "Razonamiento 2" },
  ],
  clinical_notes: [
    { date: new Date().toISOString(), note: "Nota clínica 1" },
    { date: new Date().toISOString(), note: "Nota clínica 2" },
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
      console.log('Response:', res.body );
      

    expect(res.status).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data.symptoms.length).toBe(2);
    expect(res.body.data.modalities.length).toBe(2);
    expect(res.body.data.clinical_notes.length).toBe(2);
    expect(res.body.data.diagnoses.length).toBe(1);
  });

  it("Debe fallar si falta el patient_id", async () => {
    const baseRecord = generateRecordData();

    // Crear copia con patient_id eliminado (usando tipo Partial para permitir delete)
    const invalidRecord: Partial<typeof baseRecord> = { ...baseRecord };
    delete invalidRecord.patient_id;

    const res = await request(app)
      .post("/api/expedients")
      .set("Authorization", `Bearer ${token}`)
      .send(invalidRecord);

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body.result).toBe(false);
  });
});
