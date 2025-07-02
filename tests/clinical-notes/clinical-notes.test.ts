import request from "supertest";
import { app } from "../../src/app";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

let token: string;
let userId: number;
let patientId: number;
let recordId: number;
let createdNoteId: number;

beforeAll(async () => {
  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email: "test@example.com", password: "iamsecure" });

  token = loginRes.body.data.token;

  const user = await prisma.user.create({
    data: {
      first_name: "Clinical",
      last_name: "Tester",
      email: "clinote@example.com",
      password: "123456",
      role: "admin",
      phone: "555555551",
      is_active: true,
    },
  });
  userId = user.id;

  const patient = await prisma.patient.create({
    data: {
      first_name: "Paciente",
      last_name: "Notas",
      age: "30",
      gender: "Femenino",
      address: "Calle Nota",
      is_active: true,
      occupation: "Psicóloga",
      phone: "555555552",
      user_id: user.id,
    },
  });
  patientId = patient.id;

  const record = await prisma.record.create({
    data: {
      patient_id: patient.id,
      incident_details: "Incidente",
      physical_description: "Descripción",
      treatment_demand: "Demanda",
      school_area: "Área escolar",
      work_area: "Área laboral",
      significant_events: "Eventos",
      psychosexual_history: "Historia",
      therapeutic_focus: "Enfoque",
      therapeutic_goal: "Meta",
      therapeutic_strategy: "Estrategia",
      therapeutic_forecast: "Pronóstico",
      family_diagram: "Diagrama",
      family_relationship: "Relaciones",
      family_mapping: "Mapeo",
      diagnostic_impression: "Impresión",
      family_hypothesis: "Hipótesis",
      mental_exam: "Examen mental",
      diagnostic_notes: "Notas diagnósticas",
      consultation_reason: "Consulta",
    },
  });
  recordId = record.id;
});

afterAll(async () => {
  await prisma.clinicalNote.deleteMany({ where: { recordId } });
  await prisma.record.delete({ where: { id: recordId } });
  await prisma.patient.delete({ where: { id: patientId } });
  await prisma.user.delete({ where: { id: userId } });
  await prisma.$disconnect();
});

const createNoteData = (offset = 0) => ({
  date: new Date(Date.now() + offset * 60000).toISOString(),
  note: `Nota clínica con offset ${offset}`,
  recordId,
});

const createNoteRequest = async (note: any) => {
  return await request(app)
    .post("/api/clinical-notes")
    .set("Authorization", `Bearer ${token}`)
    .send(note);
};

describe("Pruebas de Clinical Notes", () => {
  it("Debe crear varias notas clínicas correctamente", async () => {
    for (let i = 0; i < 3; i++) {
      const res = await createNoteRequest(createNoteData(i));
      expect(res.status).toBe(200);
      expect(res.body.result).toBe(true);
      expect(res.body.data).toHaveProperty("id");
      if (i === 0) createdNoteId = res.body.data.id; // para futuras pruebas
    }
  });

  it("Debe fallar al crear sin recordId", async () => {
    const note = { ...createNoteData(), recordId: undefined };
    const res = await createNoteRequest(note);
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body.result).toBe(false);
  });

  it("Debe editar una nota correctamente", async () => {
    const update = {
      date: new Date().toISOString(),
      note: "Nota editada correctamente",
    };

    const res = await request(app)
      .put(`/api/clinical-notes/${createdNoteId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(update);

    expect(res.status).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.data.note).toBe(update.note);
  });

  it("Debe eliminar una nota correctamente", async () => {
    const deleteRes = await request(app)
      .delete(`/api/clinical-notes/${createdNoteId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.result).toBe(true);

    const getRes = await request(app)
      .get(`/api/clinical-notes/${createdNoteId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(getRes.status).toBeGreaterThan(404);
    expect(getRes.body.result).toBe(false);
  });
});
