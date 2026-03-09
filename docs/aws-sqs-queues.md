# Colas SQS (Fase 1 – Tareas 1.3 y 1.4)

Documentación de las tres colas y sus Dead Letter Queues (DLQ) en el flujo audio → expediente.

---

## MVP: esencial (DLQ + visibility timeout)

Para el MVP son obligatorios:

1. **No reintentos infinitos:** mensajes inválidos o que fallen el procesamiento no deben reintentarse para siempre. Se configuran **DLQ + redrive policy** (`maxReceiveCount=5`): tras 5 intentos sin borrar el mensaje, SQS lo mueve a la DLQ.
2. **Evitar doble procesamiento por timeout:** **visibility timeout** mayor que el tiempo real de procesamiento para que el mensaje no vuelva a estar disponible mientras el worker aún lo procesa.

**Estado:** ya aplicado.

- **LocalStack / desarrollo:** `docker-compose` define el servicio `sqs-init`, que crea las 3 DLQs, las 3 colas principales con `VisibilityTimeout` (300, 1800, 600 segundos) y `RedrivePolicy` (maxReceiveCount=5). Al hacer `docker compose up`, queda listo.
- **AWS real:** ejecutar `./scripts/create-sqs-queues.sh us-east-1` (o la región que uses). El script crea las DLQs y las colas principales con los mismos atributos. Opcional: `SQS_MAX_RECEIVE_COUNT=3` para menos reintentos.

Los workers no borran el mensaje cuando el payload es inválido o el procesamiento falla; así SQS reintenta hasta `maxReceiveCount` y luego lo envía a la DLQ.

---

## Nombres de colas

| Cola | Uso |
|------|-----|
| `neurofile-audio-fragments` | Mensajes por cada fragmento de audio subido (conversationId, sequenceIndex, recordedAt, s3Key). Consumidor: worker que persiste en BD. |
| `neurofile-transcribe-conversation` | Un mensaje por conversación a transcribir (`conversationId`). Consumidor: worker que llama a Whisper y concatena. |
| `neurofile-summarize-map` | Un mensaje por conversación a resumir/mapear (`conversationId`). Consumidor: worker que usa LLM y guarda borrador. |

Cada cola tiene una **DLQ** asociada: `*-dlq` (ej. `neurofile-audio-fragments-dlq`). Los mensajes que superan **5** recepciones sin ser borrados se redirigen a la DLQ correspondiente para revisión o reproceso.

---

## Atributos recomendados

| Atributo | neurofile-audio-fragments | neurofile-transcribe-conversation | neurofile-summarize-map |
|----------|---------------------------|-----------------------------------|--------------------------|
| **VisibilityTimeout** | 300 (5 min) | 1800 (30 min) | 600 (10 min) |
| **ReceiveMessageWaitTimeSeconds** | 20 (long polling) | 20 | 20 |
| **RedrivePolicy** | → neurofile-audio-fragments-dlq (maxReceiveCount=5) | → neurofile-transcribe-conversation-dlq (5) | → neurofile-summarize-map-dlq (5) |
| **MessageRetentionPeriod** | 345600 (4 días) | 345600 | 345600 |

- **VisibilityTimeout:** tiempo que el mensaje queda oculto tras ser recibido; si el worker no lo borra, vuelve a la cola. El de transcribir es alto porque ese worker puede tardar mucho (muchos fragmentos).
- **DLQ y redrive (Tarea 1.4):** tras 5 intentos de procesamiento fallidos, el mensaje se mueve a la DLQ. Revisar DLQs periódicamente para reintentos manuales o diagnóstico.

---

## Desarrollo local (por ahora)

En local se usa **LocalStack** para emular SQS. El `docker-compose.yml` del API incluye:

- Servicio **localstack**: expone SQS en el puerto **4566**.
- Servicio **sqs-init**: al arrancar, crea las 3 DLQs, luego las 3 colas principales con redrive policy (maxReceiveCount=5).

Al hacer `docker compose up -d`, las colas y DLQs quedan disponibles. En el backend se configurará el endpoint de SQS apuntando a `http://localhost:4566` (o `http://localstack:4566` desde otro servicio del mismo compose).

**URLs en LocalStack** (región `us-east-1`, cuenta `000000000000`):

Colas principales:
- `http://localhost:4566/000000000000/neurofile-audio-fragments`
- `http://localhost:4566/000000000000/neurofile-transcribe-conversation`
- `http://localhost:4566/000000000000/neurofile-summarize-map`

DLQs (para monitoreo o reproceso):
- `http://localhost:4566/000000000000/neurofile-audio-fragments-dlq`
- `http://localhost:4566/000000000000/neurofile-transcribe-conversation-dlq`
- `http://localhost:4566/000000000000/neurofile-summarize-map-dlq`

---

## AWS real (más adelante)

Crear las colas y DLQs con el script del proyecto (crea las 3 DLQs y las 3 colas principales con redrive policy):

```bash
./scripts/create-sqs-queues.sh us-east-1
```

Opcional: `SQS_MAX_RECEIVE_COUNT=3` para usar 3 reintentos en lugar de 5. Para LocalStack/desarrollo con endpoint: `SQS_ENDPOINT=http://localhost:4566 ./scripts/create-sqs-queues.sh us-east-1`.

Luego obtén las URLs de cada cola (`aws sqs get-queue-url --queue-name <nombre> --region us-east-1`) y configúralas en `.env`. Las DLQs solo son necesarias en .env si el código las usa para monitoreo o reproceso.

---

## Worker DLQ (`worker:dlq`)

Existe un worker que consume las tres DLQs y evita que los mensajes se queden ahí indefinidamente:

- **Ejecución:** `npm run worker:dlq`
- **Comportamiento:** Por cada DLQ (audio-fragments, transcribe-conversation, summarize-map):
  - Recibe mensajes con atributos (`MessageAttributeNames: ['All']`).
  - Si el body **no se puede parsear** (formato inválido): se elimina de la DLQ y se registra en log.
  - Si se parsea: se lee el atributo `dlq_resend_count` (reintentos desde DLQ). Si es **≥ 2** (máximo configurado): se elimina de la DLQ y se registra "máximo de reintentos".
  - En caso contrario: se **reenvía el mismo body** a la cola principal con `messageAttributes.dlq_resend_count = (actual + 1)`, y luego se elimina el mensaje de la DLQ.

Así los mensajes válidos tienen hasta 2 reintentos extra desde la DLQ hacia la cola principal; los no parseables o que superen el límite se descartan para no reintentar indefinidamente.
