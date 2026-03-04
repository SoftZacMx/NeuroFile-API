# Guía de implementación frontend — NeuroFile

Documento para el equipo frontend: qué módulos crear, qué recursos consumir y qué datos enviar/recibir. Usar este documento como referencia única para integrar con la API.

---

## 1. Configuración base

| Concepto | Valor |
|----------|--------|
| **Base URL** | `http://localhost:<PORT>/api` (reemplazar `<PORT>` por el del servidor, ej. 3000) |
| **Autenticación** | JWT. Header en todas las rutas protegidas: `Authorization: Bearer <token>` |
| **Content-Type** | `application/json` para body en POST/PUT |

**Formato de respuesta de la API (todas las rutas):**

```ts
interface ApiResponse<T> {
  error: boolean;      // false = éxito
  result: boolean;
  data: T | null;      // payload
  message?: string;    // mensaje de error si aplica
  status_code: number;
}
```

- Si `error === false`: usar `data` como resultado.
- Si `error === true`: mostrar `message` y tratar según `status_code` (401, 400, 500, etc.).

---

## 1.1 Stack tecnológico del frontend

| Tecnología | Uso |
|------------|-----|
| **React** | Librería UI y componentes. |
| **Tailwind CSS** | Estilos utility-first, diseño responsive. |
| **shadcn/ui** | Componentes (botones, inputs, tablas, modales, etc.) sobre Radix + Tailwind, copiados al proyecto. |

La inicialización del proyecto y la configuración inicial se describen en **Fase 0** (ver §2.1).

---

## 2. Módulos a implementar (resumen)

| # | Módulo | Qué implementar | Requiere JWT |
|---|--------|------------------|--------------|
| 1 | **Auth** | Login, (opcional) verificar usuario por email | No |
| 2 | **Users** | Listar, ver uno, crear, editar, eliminar usuarios | Sí (excepto crear) |
| 3 | **Patients** | Listar, ver uno, crear, editar, eliminar pacientes | Sí |
| 4 | **Appointments** | Listar, ver una, crear, editar, eliminar citas | Sí |
| 5 | **Expedients** | Listar, ver uno, crear, editar, eliminar expedientes | Sí |
| 6 | **Clinical notes** | Listar por expediente, ver una, crear, editar, eliminar notas | Sí |

**Roles:** `admin` puede gestionar usuarios y ver todos los pacientes; `therapist` solo sus pacientes. Condicionar vistas y permisos según `user.role`.

---

## 2.1 Fases de implementación (orden de dependencia)

Cada fase depende de la anterior. Dentro de cada fase, las tareas van en orden de dependencia (no implementar una tarea hasta tener lista la anterior que indique).

| Fase | Módulo(s) | Depende de | Objetivo |
|------|-----------|------------|----------|
| **Fase 0** | Inicialización | — | Proyecto React + Tailwind + shadcn/ui listo para desarrollar. |
| **Fase 1** | Base + Auth | Fase 0 | Poder iniciar sesión, guardar token y usarlo en las peticiones. |
| **Fase 2** | Users | Fase 1 | CRUD de usuarios (admin). |
| **Fase 3** | Patients | Fase 1 (y usuarios para `user_id`) | CRUD de pacientes. |
| **Fase 4** | Appointments | Fase 3 | CRUD de citas (requiere pacientes). |
| **Fase 5** | Expedients | Fase 3 | CRUD de expedientes clínicos (requiere pacientes). |
| **Fase 6** | Clinical notes | Fase 5 | CRUD de notas clínicas (requiere expedientes). |

**Nota:** Fases 4 y 5 solo dependen de Pacientes; se pueden implementar en paralelo una vez terminada la Fase 3. La Fase 6 debe ir después de la Fase 5.

---

### Fase 0 — Inicialización del proyecto y configuración inicial

**Dependencia:** ninguna. Es la primera etapa antes de cualquier funcionalidad.

**Stack:** React, Tailwind CSS, shadcn/ui.

| # | Tarea | Orden | Detalle |
|---|--------|-------|---------|
| 0.1 | Crear proyecto React | 1 | Usar Vite: `npm create vite@latest neurofile-web -- --template react-ts`. Entrar en la carpeta e instalar dependencias (`npm install`). |
| 0.2 | Instalar y configurar Tailwind CSS | 2 | `npm install -D tailwindcss postcss autoprefixer` y `npx tailwindcss init -p`. En `tailwind.config.js` configurar `content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]`. En `src/index.css` añadir las directivas `@tailwind base;`, `@tailwind components;`, `@tailwind utilities;`. |
| 0.3 | Inicializar shadcn/ui | 3 | Según la doc oficial: `npx shadcn@latest init`. Elegir estilo por defecto, base color (neutro/azul/verde según diseño NeuroFile), y que Tailwind esté en `src` (o la ruta que use el proyecto). Esto crea/actualiza `components.json` y añade la carpeta de componentes. |
| 0.4 | Instalar componentes base de shadcn | 4 | Instalar al menos: `npx shadcn@latest add button input label card table dialog form` (o los que vaya a usar en login y listas). Añadir más componentes según se necesiten en fases posteriores. |
| 0.5 | Estructura de carpetas base | 5 | Definir estructura, por ejemplo: `src/components`, `src/pages`, `src/hooks`, `src/lib` (cliente API, utils), `src/types`, `src/contexts` o store para auth. Opcional: `src/services` para llamadas a la API. |
| 0.6 | Variables de entorno para la API | 6 | Crear `.env` (y `.env.example`) con `VITE_API_BASE_URL=http://localhost:3000/api` (o el puerto del backend). En código usar `import.meta.env.VITE_API_BASE_URL`. No commitear secretos; solo la URL base. |
| 0.7 | Scripts y verificación | 7 | Asegurar que `npm run dev` levanta la app, que Tailwind aplica estilos y que un componente shadcn (ej. Button) se ve correctamente. Opcional: página mínima con un título y un botón para validar el stack. |

**Referencias rápidas:**
- [Vite + React](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs/installation)
- [shadcn/ui](https://ui.shadcn.com/docs/installation) — instalación según el bundler (Vite).

---

### Fase 1 — Base y Auth

**Dependencia:** Fase 0 terminada (proyecto creado, Tailwind y shadcn operativos).

| # | Tarea | Orden | Detalle |
|---|--------|-------|---------|
| 1.1 | Cliente HTTP y configuración base | 1 | Cliente que apunte a base URL, envíe `Content-Type: application/json` y lea respuestas con `error`, `result`, `data`, `message`, `status_code`. |
| 1.2 | Interceptor o lógica de token | 2 | Añadir header `Authorization: Bearer <token>` a todas las peticiones cuando exista token. Si respuesta 401, limpiar token y redirigir a login. |
| 1.3 | Pantalla de login | 3 | Formulario email + password. POST `/api/auth/login`. Validar email y password en front antes de enviar. |
| 1.4 | Guardar token y usuario | 4 | Tras login exitoso, guardar `data.token` y `data.user` (ej. localStorage/sessionStorage o estado global). |
| 1.5 | Redirección por rol | 5 | Tras login, redirigir según `user.role` (admin → dashboard con acceso a usuarios; therapist → dashboard sin gestión de usuarios). |
| 1.6 | (Opcional) Verificar usuario por email | 6 | POST `/api/auth/verify-user` con `{ email }`. Útil para “¿Olvidaste contraseña?” o comprobar si el usuario existe. |

---

### Fase 2 — Users

**Dependencia:** Fase 1 terminada (usuario logueado, token disponible). Visible solo para rol `admin`.

| # | Tarea | Orden | Detalle |
|---|--------|-------|---------|
| 2.1 | Listar usuarios | 1 | GET `/api/users`. Mostrar tabla o lista con `data` (User[]). |
| 2.2 | Ver un usuario | 2 | GET `/api/users/:user_id`. Pantalla o modal de detalle con `data` (User). |
| 2.3 | Crear usuario | 3 | Formulario con campos del User (ver §4). POST `/api/users`. Tras éxito, volver a lista o refrescar. |
| 2.4 | Editar usuario | 4 | Cargar datos con GET `/api/users/:user_id`. Formulario prellenado. PUT `/api/users/:user_id` con body parcial. |
| 2.5 | Eliminar usuario | 5 | Confirmación. DELETE `/api/users/:user_id`. Tras éxito, quitar de lista o refrescar. |

---

### Fase 3 — Patients

**Dependencia:** Fase 1. Para “crear paciente” se necesita al menos un usuario (selector de `user_id` para admin; para therapist usar el `user.id` logueado).

| # | Tarea | Orden | Detalle |
|---|--------|-------|---------|
| 3.1 | Listar pacientes | 1 | GET `/api/patients`. Mostrar lista/tabla con `data` (Patient[]). Filtrar por `user_id` en front si es therapist. |
| 3.2 | Ver un paciente | 2 | GET `/api/patients/:user_id` (usar `id` del paciente; la API nombra el param `user_id`). Pantalla de detalle. |
| 3.3 | Crear paciente | 3 | Formulario con campos del Patient (ver §5). Incluir `user_id` (selector si admin; fijo si therapist). POST `/api/patients`. |
| 3.4 | Editar paciente | 4 | Cargar con GET `/api/patients/:user_id`. PUT `/api/patients/:user_id` con body parcial. |
| 3.5 | Eliminar paciente | 5 | Confirmación. DELETE `/api/patients/:user_id`. Refrescar lista. |

---

### Fase 4 — Appointments (Citas)

**Dependencia:** Fase 3 (se necesita al menos un paciente para crear citas).

| # | Tarea | Orden | Detalle |
|---|--------|-------|---------|
| 4.1 | Listar citas | 1 | GET `/api/appointments`. Mostrar `data` (Appointment[]). Opcional: filtrar por paciente si se entra desde detalle de paciente. |
| 4.2 | Ver una cita | 2 | GET `/api/appointments/:appointment_id`. Detalle o modal. |
| 4.3 | Crear cita | 3 | Formulario: `date`, `patientId` (selector de paciente), `status`, `attended`. POST `/api/appointments`. |
| 4.4 | Editar cita | 4 | Cargar con GET por `appointment_id`. PUT `/api/appointments/:appointment_id` con body parcial. |
| 4.5 | Eliminar cita | 5 | Confirmación. DELETE `/api/appointments/:appointment_id`. Refrescar lista. |

---

### Fase 5 — Expedients (Expedientes clínicos)

**Dependencia:** Fase 3 (se necesita paciente para asociar el expediente).

| # | Tarea | Orden | Detalle |
|---|--------|-------|---------|
| 5.1 | Listar expedientes | 1 | GET `/api/expedients`. Mostrar lista. Opcional: filtrar por `patient_id` si se entra desde un paciente. |
| 5.2 | Ver un expediente | 2 | GET `/api/expedients/:expedient_id`. Pantalla de detalle (todos los campos + síntomas, diagnósticos, modalidades). |
| 5.3 | Crear expediente | 3 | Formulario largo (ver §7). Incluir `patient_id` (selector o contexto de paciente). POST `/api/expedients`. Recomendable dividir en pasos/secciones. |
| 5.4 | Editar expediente | 4 | Cargar con GET por `expedient_id`. PUT `/api/expedients/:expedient_id` con body parcial. |
| 5.5 | Eliminar expediente | 5 | Confirmación. DELETE `/api/expedients/:expedient_id`. Refrescar lista. |

---

### Fase 6 — Clinical notes (Notas clínicas)

**Dependencia:** Fase 5 (se necesita un expediente para listar/crear notas).

| # | Tarea | Orden | Detalle |
|---|--------|-------|---------|
| 6.1 | Listar notas de un expediente | 1 | GET `/api/clinical-notes` con **body** `{ "record_id": number }` (id del expediente). Mostrar `data` (ClinicalNote[]). |
| 6.2 | Ver una nota | 2 | GET `/api/clinical-notes/:note_id`. Detalle o modal. |
| 6.3 | Crear nota | 3 | Formulario: `date`, `note`, `recordId` (id del expediente actual). POST `/api/clinical-notes`. |
| 6.4 | Editar nota | 4 | Cargar con GET por `note_id`. PUT `/api/clinical-notes/:note_id` con body (id obligatorio, date y note opcionales). |
| 6.5 | Eliminar nota | 5 | Confirmación. DELETE `/api/clinical-notes/:note_id`. Refrescar lista de notas. |

---

## 3. Auth

**Módulo:** Autenticación (login, verificar usuario).

### 3.1 Login

| | |
|---|---|
| **Método / ruta** | `POST /api/auth/login` |
| **Auth** | No |
| **Body (enviar)** | `{ "email": string, "password": string }` |
| **Respuesta éxito (200)** | `data: { token: string, user: User }` |
| **User** | `id`, `first_name`, `last_name`, `middle_last_name`, `role`, `email`, `phone`, `is_active` (no enviar `password` a la UI) |

**Implementación:** Tras éxito, guardar `data.token` (ej. localStorage/sessionStorage) y `data.user`. En peticiones siguientes usar header `Authorization: Bearer <data.token>`.

### 3.2 Verificar usuario por email

| | |
|---|---|
| **Método / ruta** | `POST /api/auth/verify-user` |
| **Auth** | No |
| **Body (enviar)** | `{ "email": string }` |
| **Respuesta éxito** | `data: user` |
| **Error (ej. 401)** | `error: true`, `message: "User not found"` |

---

## 4. Users

**Módulo:** Usuarios (admin/terapeutas). Restringir a rol `admin`.

### Recursos

| Acción | Método | Ruta | Auth | Body |
|--------|--------|------|------|------|
| Listar | GET | `/api/users` | JWT | — |
| Ver uno | GET | `/api/users/:user_id` | JWT | — |
| Crear | POST | `/api/users` | No | Ver abajo |
| Editar | PUT | `/api/users/:user_id` | JWT | Parcial |
| Eliminar | DELETE | `/api/users/:user_id` | JWT | — |

### Datos a enviar

**Crear usuario (POST body):**

```ts
{
  first_name: string;
  last_name: string;
  middle_last_name?: string | null;
  email: string;
  password: string;
  phone: string;
  role: string;        // "admin" | "therapist"
  is_active: boolean;
}
```

**Editar usuario (PUT body):** mismos campos, todos opcionales (solo los que cambien). No enviar `password` si no se modifica.

### Datos que devuelve la API

- **Listar:** `data: User[]`
- **Ver uno / Crear / Editar / Eliminar:** `data: User`

**User:** `id`, `first_name`, `last_name`, `middle_last_name`, `role`, `email`, `phone`, `is_active` (y `password` hasheado en respuestas; no mostrarlo en UI).

---

## 5. Patients

**Módulo:** Pacientes. Cada paciente pertenece a un usuario (`user_id`).

### Recursos

| Acción | Método | Ruta | Auth | Body |
|--------|--------|------|------|------|
| Listar | GET | `/api/patients` | JWT | — |
| Ver uno | GET | `/api/patients/:user_id` | JWT | — |
| Crear | POST | `/api/patients` | JWT | Ver abajo |
| Editar | PUT | `/api/patients/:user_id` | JWT | Parcial |
| Eliminar | DELETE | `/api/patients/:user_id` | JWT | — |

**Nota:** En la API el parámetro de ruta se llama `user_id`; usar el **id del paciente** para ver uno, editar y eliminar.

### Datos a enviar

**Crear paciente (POST body):**

```ts
{
  first_name: string;
  last_name: string;
  second_last_name?: string | null;
  age: string;
  gender: string;
  address?: string | null;
  occupation: string;
  phone: string;
  user_id: number;      // id del usuario (terapeuta/admin) responsable
  is_active: boolean;
}
```

**Editar paciente (PUT body):** mismos campos, opcionales. No incluir `user_id` si no cambia.

### Datos que devuelve la API

- **Listar:** `data: Patient[]`
- **Ver uno / Crear / Editar / Eliminar:** `data: Patient`

**Patient:** `id`, `first_name`, `last_name`, `second_last_name`, `age`, `gender`, `address`, `occupation`, `phone`, `user_id`, `is_active`.

---

## 6. Appointments (Citas)

**Módulo:** Citas. Cada cita está asociada a un paciente (`patientId`).

### Recursos

| Acción | Método | Ruta | Auth | Body |
|--------|--------|------|------|------|
| Listar | GET | `/api/appointments` | JWT | — |
| Ver una | GET | `/api/appointments/:appointment_id` | JWT | — |
| Crear | POST | `/api/appointments` | JWT | Ver abajo |
| Editar | PUT | `/api/appointments/:appointment_id` | JWT | Parcial |
| Eliminar | DELETE | `/api/appointments/:appointment_id` | JWT | — |

### Datos a enviar

**Crear cita (POST body):**

```ts
{
  date: string;         // ISO (ej. "2025-03-10T10:00:00.000Z")
  patientId: number;
  status?: boolean;
  attended?: boolean;
}
```

**Editar cita (PUT body):** `date?`, `status?`, `attended?` (todos opcionales).

### Datos que devuelve la API

- **Listar:** `data: Appointment[]`
- **Ver una / Crear / Editar / Eliminar:** `data: Appointment`

**Appointment:** `id`, `date`, `status`, `attended`, `patientId`.

---

## 7. Expedients (Expedientes clínicos)

**Módulo:** Expediente clínico por paciente. Incluye muchos campos de texto y listas (síntomas, diagnósticos, modalidades).

### Recursos

| Acción | Método | Ruta | Auth | Body |
|--------|--------|------|------|------|
| Listar | GET | `/api/expedients` | JWT | — |
| Ver uno | GET | `/api/expedients/:expedient_id` | JWT | — |
| Crear | POST | `/api/expedients` | JWT | Ver abajo |
| Editar | PUT | `/api/expedients/:expedient_id` | JWT | Parcial |
| Eliminar | DELETE | `/api/expedients/:expedient_id` | JWT | — |

### Datos a enviar

**Crear expediente (POST body):**

```ts
{
  patient_id: number;
  consultation_reason: string;
  incident_details: string;
  physical_description: string;
  treatment_demand: string;
  school_area: string;
  work_area: string;
  significant_events: string;
  psychosexual_history: string;
  therapeutic_focus: string;
  therapeutic_goal: string;
  therapeutic_strategy: string;
  therapeutic_forecast: string;
  family_diagram: string;
  family_relationship: string;
  family_mapping: string;
  diagnostic_impression: string;
  family_hypothesis: string;
  mental_exam: string;
  diagnostic_notes: string;
  // Opcionales (listas):
  symptoms?: { detail: string }[];
  diagnoses?: { axis?: string; dcm?: string; cie?: string; disorder?: string }[];
  modalities?: { ti?: boolean; tf?: boolean; tp?: boolean; tg?: boolean; other?: boolean; rationale?: string }[];
}
```

**Editar expediente (PUT body):** todos los campos anteriores opcionales. Para listas existentes la API puede esperar `symptoms?: number[]`, `diagnoses?: number[]`, `modalities?: number[]` (ids) según implementación; si se envían objetos como en crear, usar lo que documente Swagger o pruebas.

### Datos que devuelve la API

- **Listar:** `data: Expedient[]` (cada item con los campos del expediente y relaciones si las incluye la API).
- **Ver uno / Crear / Editar:** `data: Expedient`

**Expedient:** mismos campos de texto + `id`, `created_at`, `patient_id`; y arrays `symptoms`, `diagnoses`, `modalities` con estructura `{ id, ..., recordId }`.

---

## 8. Clinical notes (Notas clínicas)

**Módulo:** Notas clínicas por expediente.

### Recursos

| Acción | Método | Ruta | Auth | Body |
|--------|--------|------|------|------|
| Listar por expediente | GET | `/api/clinical-notes` | JWT | **Body** `{ "record_id": number }` |
| Ver una | GET | `/api/clinical-notes/:note_id` | JWT | — |
| Crear | POST | `/api/clinical-notes` | JWT | Ver abajo |
| Editar | PUT | `/api/clinical-notes/:note_id` | JWT | Parcial |
| Eliminar | DELETE | `/api/clinical-notes/:note_id` | JWT | — |

**Importante:** La lista de notas se pide con **body** en GET (no query). Enviar `{ "record_id": <id_del_expediente> }`.

### Datos a enviar

**Crear nota (POST body):**

```ts
{
  date: string;    // ISO
  note: string;
  recordId: number;
}
```

**Editar nota (PUT body):** `id: number` (obligatorio), `date?`, `note?`.

### Datos que devuelve la API

- **Listar:** `data: ClinicalNote[]`
- **Ver una / Crear / Editar / Eliminar:** `data: ClinicalNote`

**ClinicalNote:** `id`, `date`, `note`, `recordId`.

---

## 9. Checklist por fases (orden de dependencia)

Implementar en este orden. No pasar a la siguiente tarea hasta tener la anterior lista; no pasar a la siguiente fase hasta tener la fase anterior cerrada.

**Fase 0 — Inicialización del proyecto y configuración inicial**
- [ ] 0.1 Crear proyecto React (Vite + React + TypeScript)
- [ ] 0.2 Instalar y configurar Tailwind CSS
- [ ] 0.3 Inicializar shadcn/ui (`npx shadcn@latest init`)
- [ ] 0.4 Instalar componentes base de shadcn (button, input, label, card, table, dialog, form, etc.)
- [ ] 0.5 Definir estructura de carpetas (components, pages, hooks, lib, types, contexts/services)
- [ ] 0.6 Variables de entorno (VITE_API_BASE_URL) y .env.example
- [ ] 0.7 Verificar: npm run dev, estilos Tailwind y un componente shadcn funcionando

**Fase 1 — Base y Auth**
- [ ] 1.1 Cliente HTTP y configuración base (base URL, Content-Type, lectura de `error`/`data`/`message`/`status_code`)
- [ ] 1.2 Interceptor o lógica de token (header Authorization, manejo 401 → logout y redirigir a login)
- [ ] 1.3 Pantalla de login (POST `/api/auth/login`, validar email/password en front)
- [ ] 1.4 Guardar token y usuario tras login exitoso
- [ ] 1.5 Redirección por rol (admin vs therapist)
- [ ] 1.6 (Opcional) Verificar usuario: POST `/api/auth/verify-user`

**Fase 2 — Users** (solo admin)
- [ ] 2.1 Listar usuarios (GET `/api/users`)
- [ ] 2.2 Ver un usuario (GET `/api/users/:user_id`)
- [ ] 2.3 Crear usuario (POST `/api/users`)
- [ ] 2.4 Editar usuario (PUT `/api/users/:user_id`)
- [ ] 2.5 Eliminar usuario (DELETE `/api/users/:user_id`)

**Fase 3 — Patients**
- [ ] 3.1 Listar pacientes (GET `/api/patients`)
- [ ] 3.2 Ver un paciente (GET `/api/patients/:user_id` con id del paciente)
- [ ] 3.3 Crear paciente (POST `/api/patients`, incluir `user_id`)
- [ ] 3.4 Editar paciente (PUT `/api/patients/:user_id`)
- [ ] 3.5 Eliminar paciente (DELETE `/api/patients/:user_id`)

**Fase 4 — Appointments**
- [ ] 4.1 Listar citas (GET `/api/appointments`)
- [ ] 4.2 Ver una cita (GET `/api/appointments/:appointment_id`)
- [ ] 4.3 Crear cita (POST `/api/appointments`, `patientId` obligatorio)
- [ ] 4.4 Editar cita (PUT `/api/appointments/:appointment_id`)
- [ ] 4.5 Eliminar cita (DELETE `/api/appointments/:appointment_id`)

**Fase 5 — Expedients**
- [ ] 5.1 Listar expedientes (GET `/api/expedients`)
- [ ] 5.2 Ver un expediente (GET `/api/expedients/:expedient_id`)
- [ ] 5.3 Crear expediente (POST `/api/expedients`, `patient_id` obligatorio)
- [ ] 5.4 Editar expediente (PUT `/api/expedients/:expedient_id`)
- [ ] 5.5 Eliminar expediente (DELETE `/api/expedients/:expedient_id`)

**Fase 6 — Clinical notes**
- [ ] 6.1 Listar notas por expediente (GET `/api/clinical-notes` con body `{ record_id }`)
- [ ] 6.2 Ver una nota (GET `/api/clinical-notes/:note_id`)
- [ ] 6.3 Crear nota (POST `/api/clinical-notes`, `recordId` obligatorio)
- [ ] 6.4 Editar nota (PUT `/api/clinical-notes/:note_id`)
- [ ] 6.5 Eliminar nota (DELETE `/api/clinical-notes/:note_id`)

---

## 10. Errores y validaciones

- **401:** Token inválido o ausente. Redirigir a login.
- **400:** Validación (body incorrecto). Mostrar `message` o detalles si la API los envía en `data`.
- **500:** Error del servidor. Mostrar mensaje genérico y `message` si viene.

En formularios, validar en frontend antes de enviar (email formato válido, campos requeridos, etc.) para reducir 400. Criterios de la API: ver `STITCH_UI_CONTEXT.md` o Swagger (`GET /api/api-docs`).

---

Este documento es la guía de implementación frontend. Para diseño y pantallas ver `STITCH_UI_CONTEXT.md` y `STITCH_PROMPTS.md`.
