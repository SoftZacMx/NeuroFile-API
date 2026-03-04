# Contexto API NeuroFile para Stitch (generación de UIs)

Este documento describe la API de NeuroFile para que la IA de Stitch pueda generar las interfaces de usuario del proyecto con el contexto correcto de módulos, endpoints y modelos de datos.

---

## 1. Base URL y autenticación

- **Base URL:** `http://localhost:<PORT>/api` (reemplazar `<PORT>` por el puerto del servidor).
- **Respuesta estándar:** Todas las rutas devuelven un envelope común:

```ts
interface Res<T> {
  error: boolean;      // false = éxito, true = error
  result: boolean;
  data: T | null;      // payload o null
  message?: string;
  status_code: number;
}
```

- **Rutas protegidas:** Enviar header `Authorization: Bearer <token>`.
- **Rutas públicas:** Login, verificar usuario y crear usuario (ver tabla de endpoints).

---

## 2. Endpoints por módulo

### Auth (`/api/auth`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/login` | No | Login con email y contraseña |
| POST | `/api/auth/verify-user` | No | Verificar si existe un usuario por email |

**POST `/api/auth/login`**
- **Body:** `{ email: string, password: string }`
- **Respuesta éxito (200):** `data: { token: string, user: IUser }`

**POST `/api/auth/verify-user`**
- **Body:** `{ email: string }`
- **Respuesta:** `data: user` si existe; si no, `error: true`, `message: 'User not found'`

---

### Usuarios (`/api/users`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/users` | No | Crear usuario |
| GET | `/api/users` | JWT | Listar usuarios |
| GET | `/api/users/:user_id` | JWT | Obtener un usuario |
| PUT | `/api/users/:user_id` | JWT | Actualizar usuario |
| DELETE | `/api/users/:user_id` | JWT | Eliminar usuario |

**Modelo Usuario (IUser / CreateUserDTO):**
- `id` (number, solo en respuesta)
- `first_name` (string)
- `last_name` (string)
- `middle_last_name` (string | null, opcional)
- `role` (string): ej. `"admin"`, `"therapist"`
- `password` (string)
- `email` (string)
- `phone` (string)
- `is_active` (boolean)

---

### Pacientes (`/api/patients`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/patients` | JWT | Crear paciente |
| GET | `/api/patients` | JWT | Listar pacientes |
| GET | `/api/patients/:user_id` | JWT | Obtener un paciente (param: user_id) |
| PUT | `/api/patients/:user_id` | JWT | Actualizar paciente |
| DELETE | `/api/patients/:user_id` | JWT | Eliminar paciente |

**Modelo Paciente (Create/Update):**
- `first_name` (string)
- `last_name` (string)
- `second_last_name` (string | null, opcional)
- `age` (string)
- `gender` (string)
- `address` (string | null, opcional)
- `occupation` (string)
- `phone` (string)
- `user_id` (number) — usuario (terapeuta/admin) al que pertenece el paciente
- `is_active` (boolean)

---

### Citas / Appointments (`/api/appointments`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/appointments` | JWT | Crear cita |
| GET | `/api/appointments` | JWT | Listar citas |
| GET | `/api/appointments/:appointment_id` | JWT | Obtener una cita |
| PUT | `/api/appointments/:appointment_id` | JWT | Actualizar cita |
| DELETE | `/api/appointments/:appointment_id` | JWT | Eliminar cita |

**Crear cita (body):**
- `date` (Date/string ISO)
- `patientId` (number)
- `status` (boolean, opcional)
- `attended` (boolean, opcional)

**Respuesta (AppointmentDTO):**
- `id`, `date`, `status`, `attended`, `patientId`

---

### Expedientes / Records (`/api/expedients`)

Un expediente es el expediente clínico (Record) de un paciente, con síntomas, impresiones diagnósticas y modalidades terapéuticas.

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/expedients` | JWT | Crear expediente |
| GET | `/api/expedients` | JWT | Listar expedientes |
| GET | `/api/expedients/:expedient_id` | JWT | Obtener un expediente |
| PUT | `/api/expedients/:expedient_id` | JWT | Actualizar expediente |
| DELETE | `/api/expedients/:expedient_id` | JWT | Eliminar expediente |

**Crear expediente (body):** Campos de texto largos + paciente + arrays opcionales.

- **Campos de texto (todos string):**  
  `incident_details`, `physical_description`, `treatment_demand`, `school_area`, `work_area`, `significant_events`, `psychosexual_history`, `therapeutic_focus`, `therapeutic_goal`, `therapeutic_strategy`, `therapeutic_forecast`, `family_diagram`, `family_relationship`, `family_mapping`, `diagnostic_impression`, `family_hypothesis`, `mental_exam`, `diagnostic_notes`, `consultation_reason`
- `patient_id` (number)
- **Opcionales (arrays):**
  - `symptoms`: `{ detail: string }[]`
  - `diagnoses`: `{ axis?, dcm?, cie?, disorder? }[]`
  - `modalities`: `{ ti?, tf?, tp?, tg?, other? (boolean), rationale? }[]`

**Respuesta:** Mismo esquema con `id`, `created_at` y relaciones (symptoms, diagnoses, modalities con sus ids).

---

### Notas clínicas (`/api/clinical-notes`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/clinical-notes` | JWT | Crear nota clínica |
| GET | `/api/clinical-notes` | JWT | Listar notas **por expediente** (body: record_id) |
| GET | `/api/clinical-notes/:note_id` | JWT | Obtener una nota |
| PUT | `/api/clinical-notes/:note_id` | JWT | Actualizar nota |
| DELETE | `/api/clinical-notes/:note_id` | JWT | Eliminar nota |

**Crear nota (body):**
- `date` (Date/string ISO)
- `note` (string)
- `recordId` (number)

**Respuesta (ClinicalNoteDTO):**
- `id`, `date`, `note`, `recordId`

**Importante:** La lista de notas se pide con **body** `{ record_id: number }`, no con query params.

---

## 3. Resumen de entidades y relaciones

- **User** (admin/therapist) → tiene muchos **Patient**
- **Patient** → tiene muchas **Appointment** y muchos **Record** (expedientes)
- **Record** → tiene **Symptom[]**, **DiagnosticImpression[]**, **TherapeuticModality[]**, **ClinicalNote[]**

Flujo típico en UI:
1. Login → guardar `token` y `user`.
2. Listar/gestionar usuarios (si admin) o pacientes del usuario logueado.
3. Por paciente: citas (appointments) y expedientes (records).
4. Por expediente: notas clínicas, síntomas, diagnósticos, modalidades.

---

## 4. Validaciones conocidas (API)

- **Login:** `email` (requerido, formato email), `password` (requerido).
- **Usuarios:** validadores para creación con email, password, name, last_name, second_last_name, role (según `users.validators.ts`).

Usar estos mismos criterios en formularios de la UI para reducir errores 400.

---

## 5. Swagger

Documentación interactiva disponible en:
- `GET http://localhost:<PORT>/api/api-docs`

Útil para probar endpoints y ver esquemas actualizados.

---

## 6. Convenciones para las UIs

- Usar siempre el header `Authorization: Bearer <token>` en rutas protegidas después del login.
- Leer `data` cuando `error === false` y `result === true`; en caso contrario mostrar `message` y tratar según `status_code`.
- Los IDs en URL son numéricos (`user_id`, `appointment_id`, `expedient_id`, `note_id`).
- Roles de usuario: `admin`, `therapist` — condicionar vistas/permisos según `user.role` y, si aplica, filtrar pacientes por `user_id`.

Este documento refleja el estado de la API en `NeuroFile-API` y puede usarse como única fuente de verdad para generar las pantallas y flujos del frontend.
