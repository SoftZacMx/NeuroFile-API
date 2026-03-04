# Configurar Postman con NeuroFile API

Base URL (local): **`http://localhost:3000`**

---

## Opción 1: Importar OpenAPI (recomendado)

1. En Postman: **Import** → **File** / **Link** / **Raw text**.
2. Selecciona el archivo **`docs/openapi.yaml`** (o pega la ruta absoluta al archivo).
3. Postman creará una colección con todos los endpoints y podrás ejecutar las peticiones.

Si Postman te pide formato: elegir **OpenAPI 3.0** y el archivo **YAML**.

---

## Opción 2: Lista de endpoints (creación manual)

Copia y crea las peticiones en Postman. Las rutas que marcan **(JWT)** requieren header:

- **Key:** `Authorization`  
- **Value:** `Bearer <tu_token>`

Obtén el token con **POST /api/auth/login** (email + password).

---

### Auth (sin JWT para login)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Login (body: `email`, `password`) |
| POST | `/api/auth/verify-user` | Verificar usuario **(JWT)** |

---

### Users

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/users` | Listar usuarios **(JWT)** |
| GET | `/api/users/:user_id` | Obtener usuario **(JWT)** |
| POST | `/api/users` | Crear usuario (body: first_name, last_name, role, password, email, phone, etc.) |
| PUT | `/api/users/:user_id` | Actualizar usuario **(JWT)** |
| DELETE | `/api/users/:user_id` | Eliminar usuario **(JWT)** |

---

### Patients

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/patients` | Listar pacientes **(JWT)** |
| GET | `/api/patients/:user_id` | Obtener paciente **(JWT)** |
| POST | `/api/patients` | Crear paciente **(JWT)** |
| PUT | `/api/patients/:user_id` | Actualizar paciente **(JWT)** |
| DELETE | `/api/patients/:user_id` | Eliminar paciente **(JWT)** |

---

### Expedients (expedientes)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/expedients` | Listar expedientes **(JWT)** |
| GET | `/api/expedients/:expedient_id` | Obtener expediente **(JWT)** |
| POST | `/api/expedients` | Crear expediente **(JWT)** |
| PUT | `/api/expedients/:expedient_id` | Actualizar expediente **(JWT)** |
| DELETE | `/api/expedients/:expedient_id` | Eliminar expediente **(JWT)** |

---

### Clinical notes (notas clínicas)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/clinical-notes` | Listar notas **(JWT)** |
| GET | `/api/clinical-notes/:note_id` | Obtener nota **(JWT)** |
| POST | `/api/clinical-notes` | Crear nota **(JWT)** |
| PUT | `/api/clinical-notes/:note_id` | Actualizar nota **(JWT)** |
| DELETE | `/api/clinical-notes/:note_id` | Eliminar nota **(JWT)** |

---

### Appointments (citas)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/appointments` | Listar citas **(JWT)** |
| GET | `/api/appointments/:appointment_id` | Obtener cita **(JWT)** |
| POST | `/api/appointments` | Crear cita **(JWT)** |
| PUT | `/api/appointments/:appointment_id` | Actualizar cita **(JWT)** |
| DELETE | `/api/appointments/:appointment_id` | Eliminar cita **(JWT)** |

---

## Lista simple en texto (copiar/pegar)

```
POST   http://localhost:3000/api/auth/login
POST   http://localhost:3000/api/auth/verify-user

GET    http://localhost:3000/api/users
GET    http://localhost:3000/api/users/:user_id
POST   http://localhost:3000/api/users
PUT    http://localhost:3000/api/users/:user_id
DELETE http://localhost:3000/api/users/:user_id

GET    http://localhost:3000/api/patients
GET    http://localhost:3000/api/patients/:user_id
POST   http://localhost:3000/api/patients
PUT    http://localhost:3000/api/patients/:user_id
DELETE http://localhost:3000/api/patients/:user_id

GET    http://localhost:3000/api/expedients
GET    http://localhost:3000/api/expedients/:expedient_id
POST   http://localhost:3000/api/expedients
PUT    http://localhost:3000/api/expedients/:expedient_id
DELETE http://localhost:3000/api/expedients/:expedient_id

GET    http://localhost:3000/api/clinical-notes
GET    http://localhost:3000/api/clinical-notes/:note_id
POST   http://localhost:3000/api/clinical-notes
PUT    http://localhost:3000/api/clinical-notes/:note_id
DELETE http://localhost:3000/api/clinical-notes/:note_id

GET    http://localhost:3000/api/appointments
GET    http://localhost:3000/api/appointments/:appointment_id
POST   http://localhost:3000/api/appointments
PUT    http://localhost:3000/api/appointments/:appointment_id
DELETE http://localhost:3000/api/appointments/:appointment_id
```

Sustituye `:user_id`, `:expedient_id`, `:note_id`, `:appointment_id` por IDs numéricos reales.

---

## Variable en Postman (opcional)

Crea una variable de entorno en la colección:

- **Variable:** `baseUrl`
- **Valor (local):** `http://localhost:3000`

En la URL de cada request usa: `{{baseUrl}}/api/...`
