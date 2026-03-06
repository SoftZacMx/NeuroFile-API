# Plan de implementación: Audio → Expediente (Backend)

Documento de diseño e implementación para el flujo de grabación por fragmentos, transcripción con Whisper y mapeo a expediente. **Estructurado en fases y tareas con orden de dependencias.**

---

## 1. Objetivo

Permitir que el terapeuta grabe la sesión por fragmentos (ej. 1 minuto), subir el audio a S3, transcribir con Whisper y mapear el texto resultante a los campos del expediente, con revisión humana antes de guardar definitivamente.

---

## 2. Arquitectura de alto nivel

```
[Cliente] ──► API ──► SQS (fragmentos)     ──► Worker: persistir fragmentos ──► BD + S3
                │
                └──► SQS (transcribir)     ──► Worker: Whisper + concatenar ──► BD (full_transcription)
                                                      │
                                                      └──► SQS (resumir/mapear) ──► Worker: LLM ──► borrador expediente
```

- **S3:** almacenamiento de archivos de audio por fragmento.
- **SQS:** tres colas (fragmentos, transcribir, resumir/mapear) + DLQ por cola crítica.
- **Workers:** procesos en el backend (Node/TS) que hacen poll a SQS; no Lambdas.
- **API:** expone inicio/fin de conversación, subida de fragmentos (recomendado: archivo a la API) o presigned URL + confirm; consulta y aplicación de borrador.

---

## 2.1 Flujo recomendado para el cliente (frontend)

El frontend asume **mínima responsabilidad**: solo inicia la conversación, envía cada fragmento de audio a la API y termina la conversación. Todo lo demás (S3, colas, persistencia) lo hace el backend.

1. **Iniciar conversación:** `POST /api/conversations` con `{ patientId }` (o `{ recordId }` si el expediente ya existe). Respuesta: `{ conversationId, startedAt [, recordId ] }`.
2. **Por cada fragmento grabado:** `POST /api/conversations/:id/fragments/upload` con **multipart**: campos `sequenceIndex`, `recordedAt` y archivo en el campo `file`. La API sube el archivo a S3 y encola el mensaje; el worker persiste en BD. Máximo 25 MB por archivo.
3. **Terminar conversación:** `POST /api/conversations/:id/end`. Se marca `ended_at` y se encola el mensaje para transcripción (Fase 5).

**Flujo alternativo (subida directa a S3):** el cliente puede en su lugar pedir presigned URL (`POST .../fragments` con JSON), subir el archivo con PUT a esa URL y luego llamar `POST .../fragments/confirm` con el `s3Key`. Útil si se quiere evitar que el archivo pase por la API (más ancho de banda en el servidor).

---

## 3. Fases y tareas (orden de dependencias)

Cada tarea indica de qué depende. Una tarea solo se inicia cuando todas sus dependencias están completadas.

---

### Fase 1: Modelo de datos e infraestructura AWS

| Id | Tarea | Depende de | Descripción |
|----|--------|-------------|-------------|
| **1.1** | Modelo Prisma: Conversation, AudioFragment, ExpedientDraft | — | Definir en `schema.prisma` las tres tablas con campos, FKs y clave única `(conversation_id, sequence_index)` en AudioFragment. Crear y ejecutar migración. |
| **1.2** | Bucket S3 para audio | — | Crear bucket (ej. `neurofile-audio-{env}`), políticas de acceso privado. Documentar nombre y región. |
| **1.3** | Colas SQS | — | Crear: `neurofile-audio-fragments`, `neurofile-transcribe-conversation`, `neurofile-summarize-map`. Configurar visibility timeout y reintentos. |
| **1.4** | DLQ y redrive | 1.3 | Crear una DLQ por cola y configurar redrive policy (ej. 3–5 reintentos → DLQ). |
| **1.5** | Dependencias y variables de entorno | — | Añadir al backend: `@aws-sdk/client-s3`, `@aws-sdk/client-sqs`, `@aws-sdk/s3-request-presigner`. Variables: `AWS_REGION`, `S3_BUCKET_AUDIO`, URLs de las 3 colas (y DLQ si se usan en código), `OPENAI_API_KEY` (o equivalente). |

---

### Fase 2: Servicios de infraestructura (AWS y BD)

| Id | Tarea | Depende de | Descripción |
|----|--------|-------------|-------------|
| **2.1** | Cliente/servicio S3 | 1.2, 1.5 | Módulo que: genere presigned URL (PUT) para subida, suba objeto desde la API (putObject), descargue objeto por key (getObject). Usar SDK v3 y variables de entorno. |
| **2.2** | Cliente/servicio SQS | 1.3, 1.5 | Módulo que: envíe mensaje a una cola, reciba mensajes (long polling), borre mensaje. Usar URLs de colas de env. |
| **2.3** | Repositorios Conversation y AudioFragment | 1.1 | Repositorios (o casos de uso básicos) que usen Prisma: crear conversación, obtener por id, listar fragmentos por conversation_id ordenados por sequence_index, upsert fragmento por (conversation_id, sequence_index). |

---

### Fase 3: API – Conversaciones y fragmentos

| Id | Tarea | Depende de | Descripción |
|----|--------|-------------|-------------|
| **3.1** | POST crear conversación | 2.3 | Endpoint `POST /api/conversations` con body `{ recordId }` o `{ patientId }` (uno requerido). Con `patientId`: crea expediente vacío y la conversación; con `recordId`: conversación para expediente existente. Devuelve `{ conversationId, startedAt [, recordId ] }`. Validar permisos. |
| **3.2** | POST terminar conversación | 2.2, 2.3 | Endpoint `POST /api/conversations/:id/end`. Marca `ended_at`, publica mensaje `{ conversationId }` en cola `neurofile-transcribe-conversation`. |
| **3.3** | POST subir fragmento (recomendado) | 2.1, 2.2, 2.3 | Endpoint `POST /api/conversations/:id/fragments/upload`. Multipart: `sequenceIndex`, `recordedAt`, `file` (archivo de audio). Máx 25 MB. La API sube a S3 (putObject), publica mensaje en `neurofile-audio-fragments` y devuelve `{ s3Key }`. El worker persiste en BD. |
| **3.4** | POST presigned URL para fragmento (alternativo) | 2.1, 2.3 | Endpoint `POST /api/conversations/:id/fragments`. Body: `{ sequenceIndex, recordedAt }`. Genera s3Key, obtiene presigned URL (PUT), devuelve `{ uploadUrl, s3Key, expiresAt }`. Para flujo en que el cliente sube directo a S3. |
| **3.5** | POST confirmar fragmento (alternativo) | 2.2, 2.3 | Endpoint `POST /api/conversations/:id/fragments/confirm`. Body: `{ sequenceIndex, recordedAt, s3Key }`. Usado tras subida directa a S3: publica mensaje en `neurofile-audio-fragments`; el worker persiste. |

---

### Fase 4: Worker – Persistir fragmentos

| Id | Tarea | Depende de | Descripción |
|----|--------|-------------|-------------|
| **4.1** | Consumidor cola neurofile-audio-fragments | 2.2, 2.3 | Proceso que hace long poll a la cola. Por cada mensaje: extrae conversationId, sequenceIndex, recordedAt, s3Key. |
| **4.2** | Upsert fragmento (idempotente) | 4.1, 1.1 | Con los datos del mensaje, upsert en AudioFragment por (conversation_id, sequence_index). Estado inicial `pending`. Tras éxito, borrar mensaje de la cola; en error, no borrar (reintento). |
| **4.3** | Ejecutable / despliegue del worker | 4.1, 4.2 | Script o comando (ej. `npm run worker:fragments`) que ejecute el bucle de consumo. Documentar cómo ejecutarlo (PM2, Docker, etc.). |

---

### Fase 5: Worker – Transcripción

| Id | Tarea | Depende de | Descripción |
|----|--------|-------------|-------------|
| **5.1** | Integración Whisper | 1.5 | Módulo que reciba audio (buffer/stream) y llame a Whisper API; devuelva texto. Manejar límite de tamaño por fragmento (ej. &lt; 25 MB). |
| **5.2** | Descarga de audio desde S3 | 2.1 | Dado s3Key, descargar objeto y pasar buffer al llamador (worker). |
| **5.3** | Consumidor cola neurofile-transcribe-conversation | 2.2, 2.3 | Proceso que hace long poll. Por cada mensaje: extrae conversationId. |
| **5.4** | Lógica de transcripción por fragmento | 5.1, 5.2, 5.3, 1.1 | Si conversación ya tiene `transcription_status = transcribed` y full_transcription no vacío → idempotente: borrar mensaje y opcionalmente reencolar "resumir/mapear" si falta. Si no: marcar `transcribing`. Cargar fragmentos ordenados por sequence_index. Por cada uno: descargar de S3 (5.2), transcribir (5.1), guardar transcription_text y status `transcribed` en fragmento. |
| **5.5** | Concatenar y encolar resumir/mapear | 5.4, 2.2 | Concatenar todos los transcription_text en orden (separador `\n\n`). Guardar en Conversation.full_transcription y transcription_status = transcribed. Publicar mensaje `{ conversationId }` en cola `neurofile-summarize-map`. En error: transcription_status = failed y no borrar mensaje (o enviar a DLQ). |
| **5.6** | Ejecutable / despliegue del worker transcripción | 5.3, 5.4, 5.5 | Script o comando (ej. `npm run worker:transcribe`) que ejecute el consumidor. Visibility timeout de la cola suficiente para procesar muchos fragmentos (ej. 15–30 min). |

---

### Fase 6: Worker – Resumir y mapear a expediente

| Id | Tarea | Depende de | Descripción |
|----|--------|-------------|-------------|
| **6.1** | Integración LLM para mapeo | 1.5 | Módulo que reciba texto (o resumen) y devuelva JSON con valores por campo del expediente (según modelo Record). Prompt con estructura de campos y ejemplos. |
| **6.2** | Consumidor cola neurofile-summarize-map | 2.2, 2.3 | Proceso que hace long poll. Por cada mensaje: extrae conversationId. |
| **6.3** | Resumen opcional + mapeo | 6.1, 6.2, 1.1 | Cargar conversación y full_transcription. (Opcional) paso de resumen/limpieza con LLM. Paso de mapeo: llamar a 6.1 con texto (o resumen) y obtener JSON. |
| **6.4** | Guardar borrador y marcar procesado | 6.3, 1.1 | Guardar resultado en ExpedientDraft (conversation_id, record_id, payload JSON, status draft). Marcar Conversation.processed_at. Borrar mensaje de la cola. |
| **6.5** | Ejecutable / despliegue del worker resumir/mapear | 6.2, 6.3, 6.4 | Script o comando (ej. `npm run worker:summarize-map`) que ejecute el consumidor. |

---

### Fase 7: API – Borrador de expediente

| Id | Tarea | Depende de | Descripción |
|----|--------|-------------|-------------|
| **7.1** | GET borrador por conversación | 1.1, 2.3 | Endpoint `GET /api/conversations/:id/draft`. Devuelve ExpedientDraft si existe (payload, status). Control de acceso por expediente/usuario. |
| **7.2** | POST aplicar borrador al expediente | 1.1, 2.3 | Endpoint `POST /api/conversations/:id/draft/apply`. Copia payload del borrador a Record (actualizar campos). Marcar borrador como applied. Validar permisos. |
| **7.3** | POST descartar borrador | 1.1, 2.3 | Endpoint `POST /api/conversations/:id/draft/discard`. Marcar borrador como discarded. |

---

### Fase 8: Cron – Cierre por inactividad

| Id | Tarea | Depende de | Descripción |
|----|--------|-------------|-------------|
| **8.1** | Consulta conversaciones inactivas | 1.1, 2.3 | Lógica: conversaciones con ended_at null, último fragmento (MAX(sequence_index)) con recorded_at &lt; ahora − 10 min, transcription_status pending/null. |
| **8.2** | Cerrar e encolar transcribir | 8.1, 2.2 | Para cada conversación encontrada: setear ended_at = now(), publicar mensaje en neurofile-transcribe-conversation. |
| **8.3** | Programar ejecución periódica | 8.1, 8.2 | Job que se ejecute cada X minutos (ej. 10). Opciones: node-cron en el mismo proceso, cron del SO, o worker dedicado que solo ejecute este job. |

---

### Fase 9: Pruebas, monitoreo y ajustes

| Id | Tarea | Depende de | Descripción |
|----|--------|-------------|-------------|
| **9.1** | Pruebas E2E del flujo | Fases 1–8 | Probar: crear conversación → subir 2–3 fragmentos (audio real o fixture) → terminar conversación → verificar transcripción y borrador. Probar aplicar/descartar borrador. Probar cierre por cron (simulando inactividad). |
| **9.2** | Monitoreo y DLQ | 1.4, 4–6 | Revisar mensajes en DLQ, logs de workers, tiempos de procesamiento. Definir alertas o revisión manual de DLQ. |
| **9.3** | Ajustes de configuración | 9.1, 9.2 | Ajustar timeouts SQS, reintentos, tamaño de fragmento, costes Whisper/LLM según resultados. |

---

## 4. Diagrama de dependencias entre fases

```
Fase 1 (modelo + AWS) ──► Fase 2 (servicios)
         │                        │
         └────────────────────────┼──► Fase 3 (API conv + fragmentos)
                                  │
         Fase 2 ──► Fase 4 (worker fragmentos)
         Fase 2 ──► Fase 5 (worker transcribir) ──► Fase 6 (worker resumir/mapear)
         Fase 2 ──► Fase 7 (API borrador)
         Fase 2 ──► Fase 8 (cron)
         Fases 1–8 ──► Fase 9 (pruebas y ajustes)
```

---

## 5. Referencia: modelo de datos

### 5.1 Conversation

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | PK | Identificador único |
| record_id | FK → Record | Expediente al que pertenece |
| user_id | FK → User | Terapeuta que graba |
| started_at | DateTime | Inicio de la grabación |
| ended_at | DateTime? | Fin (null hasta que se cierra) |
| transcription_status | Enum | pending, transcribing, transcribed, failed |
| full_transcription | Text? | Texto completo concatenado |
| processed_at | DateTime? | Cuándo se terminó resumir/mapear |
| created_at, updated_at | DateTime | Auditoría |

Índices: record_id, transcription_status, ended_at.

### 5.2 AudioFragment

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | PK | Identificador único |
| conversation_id | FK → Conversation | Conversación |
| sequence_index | Int | Orden (0, 1, 2, …) |
| recorded_at | DateTime | Cuándo se grabó |
| s3_key | String | Clave del objeto en S3 |
| s3_bucket | String? | Bucket (opcional) |
| status | Enum | pending, transcribed, failed |
| transcription_text | Text? | Texto Whisper para este fragmento |
| created_at | DateTime | Auditoría |

Clave única: (conversation_id, sequence_index).

### 5.3 ExpedientDraft

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | PK | Identificador único |
| conversation_id | FK → Conversation | Conversación origen |
| record_id | FK → Record | Expediente al que se aplicará |
| payload | JSON/Text | Campos mapeados (estructura Record) |
| status | Enum | draft, applied, discarded |
| created_at, updated_at | DateTime | Auditoría |

---

## 6. Referencia: colas SQS

| Cola | Mensaje | Consumidor |
|------|---------|------------|
| neurofile-audio-fragments | { conversationId, sequenceIndex, recordedAt, s3Key, s3Bucket? } | Worker Fase 4 |
| neurofile-transcribe-conversation | { conversationId } | Worker Fase 5 |
| neurofile-summarize-map | { conversationId } | Worker Fase 6 |

Cada cola con DLQ y redrive policy (3–5 reintentos).

---

## 7. Dependencias técnicas (backend)

- **AWS SDK (v3):** `@aws-sdk/client-s3`, `@aws-sdk/client-sqs`, `@aws-sdk/s3-request-presigner`.
- **Multer:** para recibir multipart (archivo + campos) en `POST .../fragments/upload`.
- **OpenAI (o equivalente):** Whisper para transcripción.
- **Cliente LLM:** resumen y mapeo (OpenAI, Anthropic, Azure, etc.).
- **Variables de entorno:** AWS_REGION, S3_BUCKET_AUDIO, URLs de las 3 colas (y DLQ), OPENAI_API_KEY (o equivalente).

---

## 8. Seguridad y privacidad

- Bucket S3 privado; presigned URLs con expiración corta (ej. 15 min).
- SQS sin contenido de audio; solo referencias (s3Key).
- Transcripciones y borradores con mismo nivel de protección que expedientes (control de acceso, cifrado en reposo si aplica).
- Consentimiento de grabación (flujo de producto; posible campo en conversación o expediente).

---

*Documento vivo: revisar con el equipo antes de implementar cada fase.*
