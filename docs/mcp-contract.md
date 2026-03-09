# Contrato MCP – NeuroFile (contexto para el terapeuta)

Todos los recursos y tools requieren **validación de permisos**: el usuario autenticado solo puede acceder a datos de sus pacientes/expedientes (record pertenece a patient que pertenece a user). La validación se aplica en la API al invocar los endpoints; el servidor MCP puede recibir `recordId`/`patientId` sin usuario cuando se usa desde la API (que ya validó).

---

## Recursos (solo lectura)

| URI | Descripción |
|-----|-------------|
| `record/:recordId/last-conversation` | Última conversación del expediente: id, started_at, full_transcription, expedientDraft.payload. |
| `record/:recordId/last-conversation-summary` | Texto para IA: full_transcription o payload del draft de la última sesión. |
| `record/:recordId/clinical-notes` | Lista de notas clínicas (id, date, note), opcional dateFrom/dateTo. |
| `record/:recordId/conversations` | Lista de conversaciones (id, started_at, transcription_status) ordenadas por fecha. |
| `patient/:patientId/record-id` | Devuelve el primer record_id del paciente (para resolver patientId → recordId). |

---

## Herramientas (tools)

| Nombre | Parámetros | Descripción |
|--------|------------|-------------|
| `get_last_session_context` | `recordId: number` | Contenido listo para prompt: transcripción o resumen de la última sesión. |
| `get_evolution_context` | `recordId: number`, `months?: number` | Notas + resúmenes de conversaciones en el periodo (texto para sintetizar evolución). |
| `get_current_session_context` | `conversationId: number` | Transcripción/resumen de la conversación actual (para sugerir nota clínica). |

---

## Ubicación del servidor MCP

- **Ruta:** `NeuroFile-API/src/mcp/`
- **Ejecución:** `npm run mcp:server` (arranca el servidor por stdio para Cursor u otros clientes MCP).
