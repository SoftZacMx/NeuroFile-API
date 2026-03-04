# Prompts para Stitch — NeuroFile UI (por pantalla)

Usa estos prompts con Stitch. Cada bloque es independiente: copia el que corresponda a la pantalla que quieres generar.  
**Referencia técnica completa:** `STITCH_UI_CONTEXT.md`.

---

## Contexto resumido (incluir en cualquier prompt)

```
NeuroFile es una app clínica. API en /api; autenticación JWT (header Authorization: Bearer <token>). 
Respuestas: { error, result, data, message, status_code }. Si error === false, usar data.
Roles: admin (ve todo, gestiona usuarios), therapist (gestiona sus pacientes y expedientes).
```

---

## Roles y permisos

| Rol         | Puede ver / hacer |
|------------|--------------------|
| **admin**  | Login, listar/crear/editar/eliminar usuarios, ver todos los pacientes, citas, expedientes y notas clínicas. |
| **therapist** | Login, listar/crear/editar sus pacientes (asignados a su user_id), citas de esos pacientes, expedientes y notas clínicas de esos expedientes. No gestiona usuarios. |

---

## Flujos de usuario

**1. Acceso**
- Usuario entra → pantalla Login → envía email + password a `POST /api/auth/login` → recibe `token` y `user` → guarda token y redirige al dashboard/home según `user.role`.

**2. Admin**
- Dashboard → puede ir a Usuarios (CRUD) o a Pacientes (lista global). Desde un paciente → Citas del paciente y Expedientes del paciente. Desde un expediente → Notas clínicas (y en el expediente: síntomas, diagnósticos, modalidades).

**3. Terapeuta**
- Dashboard → solo Pacientes (los suyos). Elige paciente → Citas del paciente y Expedientes del paciente. Desde expediente → Notas clínicas y detalle del expediente.

**4. Por pantalla**
- Login → Lista usuarios (admin) → Crear/editar usuario (admin) → Lista pacientes → Crear/editar paciente → Detalle paciente (citas + expedientes) → Lista citas / crear-editar cita → Lista expedientes / crear-editar expediente → Detalle expediente (notas, síntomas, etc.) → Lista notas clínicas / crear-editar nota.

---

## Prompts por pantalla

### 1. Login

**Objetivo:** Pantalla de inicio de sesión. Usuario introduce email y contraseña, envía a la API y pasa al resto de la app.

**Rol:** Cualquiera (público).

**Casos de uso:** Iniciar sesión; mostrar error si credenciales incorrectas o usuario no existe.

**Prompt Stitch:**
```
Pantalla: Login.
El usuario escribe email y contraseña y pulsa "Iniciar sesión". 
Llamar POST /api/auth/login con body { email, password }. 
Si la respuesta tiene data.token y data.user, guardar token (ej. en localStorage) y user, y redirigir al home/dashboard según user.role (admin o therapist). 
Si error === true, mostrar message en la UI. 
Validar en front: email obligatorio y formato email, contraseña obligatoria.
```

---

### 2. Lista de usuarios (solo admin)

**Objetivo:** Tabla o lista de todos los usuarios del sistema con opciones para ver, editar y eliminar.

**Rol:** admin.

**Casos de uso:** Ver todos los usuarios; navegar a edición o a crear nuevo usuario.

**Prompt Stitch:**
```
Pantalla: Lista de usuarios (solo visible para role === 'admin').
Mostrar tabla o lista con: nombre, apellidos, email, teléfono, rol (admin/therapist), activo (sí/no). 
Datos: GET /api/users con header Authorization: Bearer <token>. Usar response.data (array). 
Acciones: botón "Nuevo usuario" (ir a pantalla crear usuario), por fila "Editar" (ir a editar con user_id) y "Eliminar" (confirmar y llamar DELETE /api/users/:user_id). 
Si error === true, mostrar message.
```

---

### 3. Crear / Editar usuario (solo admin)

**Objetivo:** Formulario para crear o actualizar un usuario (nombre, apellidos, email, teléfono, rol, contraseña, activo).

**Rol:** admin.

**Casos de uso:** Alta de nuevo terapeuta o admin; editar datos o desactivar usuario.

**Prompt Stitch:**
```
Pantalla: Formulario Crear usuario o Editar usuario (solo admin).
Campos: first_name, last_name, middle_last_name (opcional), email, phone, role (select: admin / therapist), password (obligatorio en crear, opcional en editar), is_active (checkbox).
Crear: POST /api/users con body con esos campos. 
Editar: GET /api/users/:user_id para rellenar, luego PUT /api/users/:user_id con body (sin enviar password si está vacío). 
Validar email y campos requeridos. Tras éxito, volver a lista de usuarios. Mostrar message si error === true.
```

---

### 4. Lista de pacientes

**Objetivo:** Lista de pacientes. Admin ve todos; terapeuta solo los suyos (filtrar por user_id del usuario logueado si la API lo permite, o mostrar los que devuelve la API).

**Rol:** admin, therapist.

**Casos de uso:** Ver pacientes; ir a detalle paciente, crear paciente o editar.

**Prompt Stitch:**
```
Pantalla: Lista de pacientes.
Datos: GET /api/patients (Authorization: Bearer <token>). Mostrar response.data. 
Columnas útiles: nombre, apellidos, edad, género, teléfono, ocupación. 
Si user.role === 'therapist', la API puede devolver solo sus pacientes; si es admin, todos. 
Acciones: "Nuevo paciente", por fila "Ver" / "Editar" (ir a detalle o formulario con patient id; en la API el param es user_id pero en pacientes el id es el del paciente — revisar si el backend usa patient id en la ruta). 
Eliminar: DELETE /api/patients/:user_id (confirmar antes). Mostrar message en errores.
```

---

### 5. Crear / Editar paciente

**Objetivo:** Formulario para dar de alta o actualizar un paciente (datos personales y asignación a un usuario responsable).

**Rol:** admin, therapist.

**Casos de uso:** Alta de paciente asignado a un terapeuta (admin elige usuario); terapeuta da de alta paciente para sí mismo (user_id = usuario logueado).

**Prompt Stitch:**
```
Pantalla: Crear o Editar paciente.
Campos: first_name, last_name, second_last_name (opcional), age, gender, address (opcional), occupation, phone, is_active. En crear: user_id (number). Si es therapist, prellenar user_id con el id del usuario logueado; si es admin, selector de usuario (GET /api/users para opciones).
Crear: POST /api/patients. Editar: GET /api/patients/:user_id para datos (nota: param puede ser patient id en tu API), PUT /api/patients/:user_id. 
Éxito: volver a lista de pacientes. Errores: mostrar message.
```

---

### 6. Detalle de paciente

**Objetivo:** Ver datos del paciente y acceder a sus citas y expedientes.

**Rol:** admin, therapist.

**Casos de uso:** Ver ficha del paciente; ir a listar/crear citas o expedientes de ese paciente.

**Prompt Stitch:**
```
Pantalla: Detalle de paciente.
Obtener paciente: GET /api/patients/:user_id (usar el id del paciente; si la API usa user_id en la ruta, usar el id que corresponda). Mostrar nombre, apellidos, edad, género, dirección, ocupación, teléfono.
Dos bloques o pestañas: (1) Citas de este paciente — enlace o botón "Ver citas" que lleve a lista de citas filtrada por este patient. (2) Expedientes — "Ver expedientes" a lista de expedientes del paciente. Opcional: botones "Nueva cita", "Nuevo expediente" que lleven a formularios con patient_id/patientId prellenado.
```

---

### 7. Lista de citas (por paciente o global)

**Objetivo:** Listar citas; si se entra desde un paciente, filtrar por ese paciente. Acciones: crear, editar, eliminar cita.

**Rol:** admin, therapist.

**Casos de uso:** Ver próximas citas; marcar asistencia; crear o reprogramar cita.

**Prompt Stitch:**
```
Pantalla: Lista de citas.
Datos: GET /api/appointments. Si estamos en contexto de un paciente, filtrar en front por patientId === id del paciente, o pedir a backend filtro si existe.
Mostrar: fecha, paciente (nombre si hay datos), estado, asistió (sí/no). 
Acciones: "Nueva cita" (formulario con date, patientId — selector de paciente o prellenado si viene de detalle paciente —, status, attended). Crear: POST /api/appointments. Editar: PUT /api/appointments/:appointment_id. Eliminar: DELETE /api/appointments/:appointment_id. Mostrar message en errores.
```

---

### 8. Crear / Editar cita

**Objetivo:** Formulario para agendar o modificar una cita (fecha, paciente, estado, asistencia).

**Rol:** admin, therapist.

**Prompt Stitch:**
```
Pantalla: Crear o Editar cita.
Campos: date (date/datetime), patientId (selector de paciente; si venimos de detalle paciente, prellenar), status (boolean), attended (boolean, opcional).
Crear: POST /api/appointments. Editar: PUT /api/appointments/:appointment_id. Tras éxito, volver a lista de citas o detalle paciente. Errores: message.
```

---

### 9. Lista de expedientes (por paciente)

**Objetivo:** Listar expedientes clínicos de un paciente y permitir abrir uno o crear otro.

**Rol:** admin, therapist.

**Prompt Stitch:**
```
Pantalla: Lista de expedientes de un paciente.
Datos: GET /api/expedients (si la API permite filtrar por patient_id en query, usarlo; si no, GET y filtrar en front por patient_id). Mostrar resumen por expediente (ej. id, fecha creación, motivo de consulta).
Acciones: "Nuevo expediente" (ir a formulario con patient_id), por fila "Abrir" a detalle del expediente (notas, síntomas, diagnósticos, modalidades). Errores: message.
```

---

### 10. Crear / Editar expediente

**Objetivo:** Formulario del expediente clínico: muchos campos de texto (motivo consulta, antecedentes, impresión diagnóstica, etc.) y opcionalmente síntomas, diagnósticos y modalidades.

**Rol:** admin, therapist.

**Prompt Stitch:**
```
Pantalla: Crear o Editar expediente clínico.
Es un formulario largo. Campos de texto: consultation_reason, incident_details, physical_description, treatment_demand, school_area, work_area, significant_events, psychosexual_history, therapeutic_focus, therapeutic_goal, therapeutic_strategy, therapeutic_forecast, family_diagram, family_relationship, family_mapping, diagnostic_impression, family_hypothesis, mental_exam, diagnostic_notes. Más patient_id (number, en crear o fijo en editar).
Opcional: arrays symptoms [{ detail }], diagnoses [{ axis, dcm, cie, disorder }], modalities [{ ti, tf, tp, tg, other, rationale }]. Usar secciones o pestañas si hace falta.
Crear: POST /api/expedients. Editar: PUT /api/expedients/:expedient_id. Éxito: ir a detalle expediente o lista. Errores: message.
```

---

### 11. Detalle de expediente

**Objetivo:** Ver el expediente completo y acceder a las notas clínicas (y a síntomas/diagnósticos/modalidades si se muestran en el mismo recurso).

**Rol:** admin, therapist.

**Prompt Stitch:**
```
Pantalla: Detalle de expediente.
Datos: GET /api/expedients/:expedient_id. Mostrar todos los campos de texto y, si vienen en data, symptoms, diagnoses, modalities. 
Bloque principal: "Notas clínicas" — botón "Ver notas" o lista inline. Si lista: GET /api/clinical-notes con body { record_id: expedient_id } (la API espera record_id en body). Acción "Nueva nota" que lleve a formulario con recordId = expedient_id. Errores: message.
```

---

### 12. Lista de notas clínicas (de un expediente)

**Objetivo:** Listar notas clínicas de un expediente y abrir o crear una.

**Rol:** admin, therapist.

**Prompt Stitch:**
```
Pantalla: Notas clínicas de un expediente.
Listar: POST o GET según API; en esta API la lista es GET /api/clinical-notes con body { record_id: number } (usar el id del expediente/record). Mostrar en lista: fecha, resumen o primeras líneas de note.
Acciones: "Nueva nota" (formulario con date, note, recordId), por fila "Ver" / "Editar" (GET/PUT /api/clinical-notes/:note_id). Eliminar: DELETE /api/clinical-notes/:note_id. Mostrar message en errores.
```

---

### 13. Crear / Editar nota clínica

**Objetivo:** Formulario para redactar o editar una nota clínica (fecha y contenido).

**Rol:** admin, therapist.

**Prompt Stitch:**
```
Pantalla: Crear o Editar nota clínica.
Campos: date (fecha), note (texto largo), recordId (number; en crear viene del expediente actual, en editar es solo lectura).
Crear: POST /api/clinical-notes. Editar: PUT /api/clinical-notes/:note_id. Éxito: volver a lista de notas del expediente. Errores: message.
```

---

## Cómo usar este archivo con Stitch

1. **Contexto:** Pega primero el "Contexto resumido" si Stitch no tiene contexto del proyecto.
2. **Una pantalla:** Copia solo el "Prompt Stitch" de la pantalla que quieras (ej. Login, Lista de pacientes).
3. **Flujo:** Si quieres varias pantallas encadenadas, indica el flujo (ej. "Detalle paciente → Lista expedientes → Detalle expediente → Notas") y usa los prompts en ese orden o descríbeselo en una frase y añade el prompt de la pantalla principal.

Para detalles de request/response exactos (bodies, códigos, validaciones), consultar `STITCH_UI_CONTEXT.md`.
