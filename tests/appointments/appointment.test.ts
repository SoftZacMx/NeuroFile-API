import request from "supertest";
import { app } from "../../src/app";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
let token: string;
let userId: number;
let patientId: number;
let createdAppointments: number[] = [];

beforeAll(async () => {
  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email: "test@example.com", password: "iamsecure" });

  token = loginRes.body.data.token;

  const user = await prisma.user.create({
    data: {
      first_name: "Appointment",
      last_name: "Test",
      middle_last_name: null,
      role: "admin",
      password: "123456",
      email: `apptestuser@example.com`,
      is_active: true,
      phone: `5559990000`,
    },
  });

  userId = user.id;

  const patient = await prisma.patient.create({
    data: {
      first_name: "Cita",
      last_name: "Paciente",
      second_last_name: null,
      age: "30",
      gender: "Masculino",
      address: "Av. Siempre Viva 123",
      is_active: true,
      occupation: "Doctor",
      phone: `5557779999`,
      user_id: user.id,
    },
  });

  patientId = patient.id;
});

afterAll(async () => {
  await prisma.appointment.deleteMany({
    where: { id: { in: createdAppointments } },
  });

  await prisma.patient.delete({ where: { id: patientId } });
  await prisma.user.delete({ where: { id: userId } });
  await prisma.$disconnect();
});

const generateAppointmentData = (offsetMinutes = 0) => ({
  date: new Date(Date.now() + offsetMinutes * 60 * 1000).toISOString(),
  attended: false,
  patientId,
});

const createTestAppointment = async (appointment: any) => {
  const res = await request(app)
    .post("/api/appointments")
    .set("Authorization", `Bearer ${token}`)
    .send(appointment);

  if (res.body?.data?.id) createdAppointments.push(res.body.data.id);
  return res;
};

describe("Pruebas de creación, edición y eliminación de citas", () => {
  it("Debe crear múltiples citas correctamente", async () => {
    const count = 5;
    for (let i = 0; i < count; i++) {
      const appointment = generateAppointmentData(i * 10); // cada 10 minutos
      const res = await createTestAppointment(appointment);

      expect(res.status).toBe(200);
      expect(res.body.result).toBe(true);
      expect(res.body.data).toHaveProperty("id");
    }
  });

  it("Debe editar una cita correctamente", async () => {
    const appointment = generateAppointmentData();
    const resCreate = await createTestAppointment(appointment);
    const appointmentId = resCreate.body.data.id;
    console.log('resCreate',resCreate.body);
    

    const updatedData = {
      date: new Date(Date.now() + 3600 * 1000).toISOString(), // +1 hora
      attended: true,
    };

    const resUpdate = await request(app)
      .put(`/api/appointments/${appointmentId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updatedData);

    expect(resUpdate.status).toBe(200);
    expect(resUpdate.body.data.attended).toBe(true);
    expect(new Date(resUpdate.body.data.date).getTime()).toBeGreaterThan(Date.now());
  });

  it("Debe eliminar una cita correctamente", async () => {
    const appointment = generateAppointmentData();
    const resCreate = await createTestAppointment(appointment);
    const appointmentId = resCreate.body.data.id;

    const resDelete = await request(app)
      .delete(`/api/appointments/${appointmentId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(resDelete.status).toBe(200);
    expect(resDelete.body.data.id).toBe(appointmentId);

    // Validar que ya no existe
    const resGet = await request(app)
      .get(`/api/appointments/${appointmentId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(resGet.status).toBe(500);
  });
});
