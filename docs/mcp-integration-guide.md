# Guía de implementación: integración MCP para valor al terapeuta

Objetivo: que el terapeuta pueda preguntar (desde la app) cosas como **"¿De qué se habló la última sesión con este paciente?"**, **"¿Cómo ha evolucionado este paciente?"** y **"Sugiere nota clínica"**, usando contexto real (notas, transcripciones, resúmenes) vía MCP y respuestas generadas con OpenAI.

Las fases son pequeñas y las tareas van en orden de dependencia. Cada fase puede usarse como prompt: *"Implementa la Fase N del docs/mcp-integration-guide.md"*.

---

## Resumen del dominio (referencia)

- **Patient** → tiene **Record** (expediente). Un Record tiene **ClinicalNote[]** y **Conversation[]**.
- **Conversation**: `full_transcription`, `transcription_status`; una conversación = una sesión.
- **ExpedientDraft**: uno por conversación; `payload` (JSON) = resumen/mapeo LLM de esa sesión.
- **ClinicalNote**: `recordId`, `date`, `note` (texto).
- Para "última sesión" se necesita la última **Conversation** por `record_id` (ordenada por `started_at` desc) y su transcripción/resumen (ExpedientDraft o full_transcription).

---

## Fase 1: Contrato y dependencias

**Objetivo:** Definir qué expondrá el servidor MCP y añadir la dependencia del SDK.

### Tareas (en orden)

1. **Documentar el contrato MCP**  
   - Crear en `docs/` un anexo o sección (p. ej. `docs/mcp-contract.md`) que liste:
     - **Recursos (solo lectura):**
       - `patient/:patientId/record-id` — devuelve el `record_id` del paciente (para usar en siguientes recursos si la API trabaja por record).
       - `record/:recordId/last-conversation` — última conversación del expediente: id, started_at, full_transcription (o null), expedient_draft.payload si existe.
       - `record/:recordId/last-conversation-summary` — texto resumido para IA: transcripción o payload del draft.
       - `record/:recordId/clinical-notes` — lista de notas clínicas (id, date, note) del expediente, opcionalmente filtro por fechas.
       - `record/:recordId/conversations` — lista de conversaciones del expediente (id, started_at, transcription_status) ordenadas por fecha, para evolución.
     - **Herramientas (tools):**
       - `get_last_session_context(recordId)` — devuelve contenido listo para prompt: "última sesión" (transcripción/resumen).
       - `get_evolution_context(recordId, months)` — devuelve notas + resúmenes de conversaciones en el periodo (texto concatenado o estructurado).
       - `get_current_session_context(conversationId)` — transcripción/resumen de la conversación actual (para sugerir nota).
   - Dejar indicado que todos los recursos/tools requieren validación de permisos (usuario solo puede acceder a sus pacientes/records).

2. **Añadir dependencia MCP en el backend**  
   - En `NeuroFile-API/package.json` añadir: `@modelcontextprotocol/sdk` (revisar versión estable en npm).
   - Ejecutar `npm install` en NeuroFile-API.

3. **Decidir ubicación del servidor MCP**  
   - Opción A: módulo dentro de NeuroFile-API, p. ej. `src/mcp/` (mismo proceso o script aparte que levanta solo el servidor MCP).
   - Opción B: paquete separado en el monorepo (si aplica).
   - Documentar la decisión en esta guía o en `docs/mcp-contract.md` (ruta del servidor y cómo se ejecuta).

**Criterios de aceptación Fase 1:** Contrato escrito, dependencia instalada, ruta del servidor MCP decidida y documentada.

**Implementado:** `docs/mcp-contract.md` creado; dependencias `@modelcontextprotocol/sdk` y `zod` añadidas; script `npm run mcp:server`; servidor en `src/mcp/`.

---

## Fase 2: Acceso a datos necesarios para MCP

**Objetivo:** Que la capa de datos exponga lo que el servidor MCP necesitará. Sin MCP aún.

### Tareas (en orden)

1. **Conversaciones por expediente**  
   - En `IConversationRepository` añadir:  
     `listByRecordId(record_id: number, limit?: number): Promise<Conversation[]>`  
     — ordenado por `started_at` desc, con `limit` opcional (por defecto ej. 20).
   - Implementar en `ConversationRepositoryImpl` (Prisma: `findMany` donde `record_id`, `orderBy: { started_at: 'desc' }`, `take: limit`).

2. **Última conversación con transcripción y draft**  
   - En `IConversationRepository` añadir (o reutilizar list y tomar la primera):  
     `getLastByRecordId(record_id: number): Promise<(Conversation & { expedientDraft: ExpedientDraft | null }) | null>`.  
   - Implementar en `ConversationRepositoryImpl`: `findFirst` con `where: { record_id }`, `orderBy: { started_at: 'desc' }`, `include: { expedientDraft: true }`.

3. **Patient → record_id**  
   - Ya existe relación Patient → Record. Asegurar que hay (o añadir) un use case o repo que dado `patientId` devuelva el `record_id` (o el Record). Si hoy se obtiene por otra vía (ej. expedient), documentar en el contrato cómo se resuelve `patientId` → `recordId` para MCP (p. ej. primer record del paciente, o record activo).

4. **Permisos**  
   - Tener claro cómo se valida que el usuario (terapeuta) puede acceder a un `record_id` / `patient_id` (p. ej. Record pertenece a Patient que pertenece a User). El servidor MCP recibirá `recordId` o `patientId`; más adelante (Fase 3/4) se validará con el usuario autenticado.

**Criterios de aceptación Fase 2:** Repositorio de conversaciones permite listar por record y obtener última con draft; forma de obtener record desde paciente documentada o implementada.

---

## Fase 3: Servidor MCP de solo lectura

**Objetivo:** Levantar un servidor MCP que exponga solo recursos de lectura usando los repositorios existentes.

### Tareas (en orden)

1. **Estructura del servidor**  
   - Crear bajo `src/mcp/` (o ruta elegida):  
     - `server.ts` — punto de entrada que inicia el servidor MCP (stdio o SSE según convenga para Cursor/API).  
     - `resources/` o lógica inline: handlers que resuelven cada recurso.

2. **Inyección de dependencias**  
   - El servidor debe recibir o instanciar: Prisma client o los repositorios necesarios (`IConversationRepository`, `IClinicalNotesRepository`, `IExpedientDraftRepository`, y lo que resuelva patient → record).  
   - Usar la misma capa que la API (repositorios) para no duplicar lógica.

3. **Implementar recursos (solo lectura)**  
   - Según `docs/mcp-contract.md`:  
     - `record/:recordId/last-conversation` — usar `getLastByRecordId(recordId)`, devolver id, started_at, full_transcription, expedientDraft?.payload.  
     - `record/:recordId/last-conversation-summary` — mismo origen; devolver texto: full_transcription o stringificado del payload del draft.  
     - `record/:recordId/clinical-notes` — usar `getNotes(record_id, dateFrom?, dateTo?)`, devolver array { id, date, note }.  
     - `record/:recordId/conversations` — usar `listByRecordId(record_id)`, devolver lista con id, started_at, transcription_status.  
   - Recurso opcional: `patient/:patientId/record-id` si lo definiste (resolver patient → record y devolver record_id).  
   - Por ahora no validar usuario; se puede pasar `recordId`/`patientId` en la URI. La validación de permisos se añade en Fase 4.

4. **Registrar recursos en el servidor**  
   - Con `@modelcontextprotocol/sdk`, registrar cada recurso con un nombre estable (ej. `record/{recordId}/last-conversation`) y el handler que lee de los repositorios y devuelve contenido en el formato que espere el cliente (texto o JSON).

5. **Probar el servidor**  
   - Script en `package.json` para arrancar el servidor MCP (ej. `"mcp:server": "ts-node src/mcp/server.ts"`).  
   - Probar con un cliente MCP de prueba (incluido en el SDK o Cursor) que liste recursos y lea uno (ej. last-conversation para un record_id conocido).

**Criterios de aceptación Fase 3:** Servidor MCP arranca, expone los recursos definidos en el contrato y devuelve datos reales de la BD usando los repositorios.

---

## Fase 4: Herramientas MCP y permisos

**Objetivo:** Añadir tools que agrupen contexto para la IA y preparar validación por usuario.

### Tareas (en orden)

1. **Tool: get_last_session_context(recordId)**  
   - Implementar en el servidor MCP.  
   - Internamente usa el mismo dato que el recurso `last-conversation-summary` (última conversación + transcripción o payload del draft).  
   - Devuelve un string listo para incluir en el prompt de OpenAI (ej. "Última sesión: [fecha]. Contenido: ...").

2. **Tool: get_evolution_context(recordId, months)**  
   - Implementar: obtener conversaciones del record en los últimos `months` (usar `listByRecordId` y filtrar por `started_at`), y notas clínicas en ese rango (`getNotes` con dateFrom/dateTo).  
   - Para cada conversación, incluir resumen (full_transcription o ExpedientDraft.payload).  
   - Devolver un único texto estructurado (ej. por fecha: nota y/o resumen de sesión) para que la IA sintetice "evolución".

3. **Tool: get_current_session_context(conversationId)**  
   - Obtener conversación por id (`getById` + ExpedientDraft si existe), devolver transcripción o payload como texto para sugerir nota clínica.

4. **Registrar tools en el servidor**  
   - Registrar las tres tools en el servidor MCP con nombres y parámetros según el contrato.

5. **Especificar permisos (diseño)**  
   - Documentar: para cada recurso/tool el servidor deberá recibir en el futuro un `userId` (o token) y comprobar que el record pertenece a un paciente del usuario (o que el usuario es el dueño del expediente).  
   - No es obligatorio implementar la comprobación en esta fase; puede ser un middleware o capa que en Fase 5 consuma el servidor desde la API con el user ya autenticado y solo pida datos de records permitidos.

**Criterios de aceptación Fase 4:** Las tres tools están implementadas y devuelven contexto listo para prompts. Diseño de permisos documentado.

---

## Fase 5: API como cliente MCP y primer flujo con OpenAI

**Objetivo:** La API recibe una petición del terapeuta, obtiene contexto vía MCP (como cliente) y llama a OpenAI para responder.

### Tareas (en orden)

1. **Cliente MCP en la API**  
   - Añadir en NeuroFile-API un cliente MCP (mismo SDK) que se conecte al servidor MCP (mismo proceso, subproceso o red local según tu decisión de despliegue).  
   - Crear un servicio o módulo, p. ej. `src/infrastructure/services/McpClientService.ts` (o usar el cliente del SDK directamente desde un use case).  
   - El cliente debe poder: listar recursos y leer uno, y/o invocar tools (get_last_session_context, get_evolution_context, get_current_session_context).

2. **OpenAI en la API**  
   - Asegurar que la API tiene configurado el cliente de OpenAI (variable de entorno con API key) y un servicio o use case que llame a Chat Completions (o Assistants) con un prompt y opcionalmente system message.

3. **Endpoint: “¿De qué se habló la última sesión?”**  
   - Nuevo endpoint (ej. POST) que reciba `recordId` (o `patientId` y resuelva a recordId) y opcionalmente la pregunta en texto (por defecto: "¿De qué se habló en la última sesión con este paciente?").  
   - Flujo: autenticar usuario → validar que el usuario puede acceder a ese record/patient → llamar al cliente MCP (tool get_last_session_context(recordId)) → construir prompt con ese contexto + la pregunta → llamar OpenAI → devolver la respuesta al frontend.  
   - Respuesta: `{ "answer": "..." }` o similar.

4. **Permisos en el endpoint**  
   - Validar que el record pertenece a un paciente del usuario (terapeuta). Usar la misma lógica que en otros endpoints de expediente/paciente (p. ej. comprobar patient.user_id === req.user.id o equivalente).

**Criterios de aceptación Fase 5:** El terapeuta (vía frontend o Postman) puede llamar al endpoint con un record/patient suyo y recibir una respuesta generada por OpenAI basada en el contexto de la última sesión obtenido vía MCP.

---

## Fase 6: Segundo y tercer flujos (evolución y sugerir nota)

**Objetivo:** Añadir los otros dos casos de uso: evolución del paciente y sugerencia de nota clínica.

### Tareas (en orden)

1. **Endpoint: “¿Cómo ha evolucionado este paciente?”**  
   - Nuevo endpoint que reciba `recordId` (o patientId) y opcionalmente `months` (ej. 6).  
   - Flujo: autenticación → permisos → cliente MCP tool `get_evolution_context(recordId, months)` → prompt con ese contexto + "Resume la evolución de este paciente en los últimos X meses" → OpenAI → devolver respuesta.

2. **Endpoint: “Sugiere nota clínica”**  
   - Recibe `conversationId` (y opcionalmente sección: evolución, cierre, etc.).  
   - Flujo: autenticación → validar que la conversación pertenece a un record del usuario → cliente MCP tool `get_current_session_context(conversationId)` → prompt pidiendo un borrador de nota clínica (evolución/intervención/plan) basado en ese contenido → OpenAI → devolver texto sugerido (el terapeuta lo revisa y guarda como nota manualmente o con otro endpoint).

3. **Documentar endpoints**  
   - Añadir en Swagger/OpenAPI o en `docs/` la descripción de los tres endpoints (última sesión, evolución, sugerir nota) para el frontend.

**Criterios de aceptación Fase 6:** Los tres flujos (última sesión, evolución, sugerir nota) funcionan vía API usando MCP + OpenAI.

---

## Fase 7: Integración en el frontend

**Objetivo:** Que el terapeuta use las funciones desde la interfaz de NeuroFile.

### Tareas (en orden)

1. **Pantalla o sección por paciente/expediente**  
   - Donde el terapeuta ya ve un paciente o expediente, añadir:
     - Botón o enlace tipo "¿De qué se habló la última sesión?" que llame al endpoint de Fase 5 y muestre la respuesta en un modal o panel.
     - Botón "¿Cómo ha evolucionado?" que llame al endpoint de evolución (Fase 6) y muestre la respuesta.
   - Opcional: campo de texto para pregunta libre usando el mismo contexto de última sesión (mismo endpoint con body.question).

2. **Sugerir nota clínica**  
   - En la pantalla donde se escribe la nota clínica (o donde se asocia a una conversación), añadir botón "Sugerir nota" que llame al endpoint de sugerencia con el `conversationId` actual.  
   - Mostrar el texto sugerido en un área editable para que el terapeuta revise y acepte/edite antes de guardar.

3. **UX y avisos**  
   - Indicar que la respuesta es generada por IA y debe revisarse.  
   - Mostrar estado de carga mientras se llama a la API.  
   - Manejar errores (sin contexto, OpenAI no disponible, etc.) con mensajes claros.

**Criterios de aceptación Fase 7:** El terapeuta puede, desde la app, obtener respuestas a "última sesión" y "evolución" y obtener una sugerencia de nota clínica para revisar y guardar.

---

## Orden de dependencia entre fases

```
Fase 1 (contrato + deps) 
  → Fase 2 (datos/repos) 
    → Fase 3 (servidor MCP solo lectura) 
      → Fase 4 (tools + permisos diseño) 
        → Fase 5 (API cliente + OpenAI + 1º endpoint) 
          → Fase 6 (2º y 3º endpoints) 
            → Fase 7 (frontend)
```

No saltar fases: cada una depende de la anterior.

---

## Uso como prompt

Puedes pedir a la IA: *"Implementa la Fase N del docs/mcp-integration-guide.md"* (con N = 1, 2, …). Para una tarea concreta: *"Implementa la tarea 2 de la Fase 3 del docs/mcp-integration-guide.md"*.
