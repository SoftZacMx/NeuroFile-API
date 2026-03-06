# Workers (flujo audio → expediente)

Cómo ejecutar los workers que consumen las colas SQS.

---

## Worker de fragmentos (neurofile-audio-fragments)

Consume la cola de fragmentos de audio: por cada mensaje hace upsert en `AudioFragment` (estado `pending`). Ver Fase 4 del [plan de implementación](./AUDIO_TO_EXPEDIENT_IMPLEMENTATION_PLAN.md).

### Requisitos

- Base de datos MySQL accesible (`DATABASE_URL`).
- SQS accesible: en local `SQS_ENDPOINT=http://localhost:4566` (LocalStack) o sin endpoint en AWS real.
- Variables de entorno: `AWS_REGION`, `S3_BUCKET_AUDIO` (opcional para el worker), credenciales AWS si usas SQS real.

### 1. Ejecución local (desarrollo)

Desde la raíz del API, con las variables en `.env`:

```bash
npm run worker:fragments
```

El proceso hace long poll a la cola y no termina; detener con Ctrl+C.

### 2. PM2 (producción o staging)

Instalar PM2 y arrancar el worker como proceso persistente:

```bash
npm install -g pm2
pm2 start npm --name "worker-fragments" -- run worker:fragments
pm2 save
pm2 startup   # opcional: que arranque al reiniciar el servidor
```

Ver logs: `pm2 logs worker-fragments`. Reiniciar: `pm2 restart worker-fragments`.

### 3. Docker Compose

El `docker-compose.yml` incluye el servicio **worker-fragments**, que usa la misma imagen que la API y ejecuta el comando del worker. Necesita MySQL y LocalStack (y opcionalmente que las colas existan vía sqs-init).

```bash
docker compose up -d mysql localstack sqs-init   # si usas colas locales
docker compose up -d worker-fragments
```

O todo junto: `docker compose up -d` (incluye api, worker-fragments, mysql, localstack, etc.).

Logs del worker: `docker compose logs -f worker-fragments`.

### 4. Docker (imagen sola)

Si construyes la imagen del API y quieres ejecutar solo el worker:

```bash
docker build -t neurofile-api .
docker run --env-file .env -e DATABASE_URL=mysql://... -e SQS_ENDPOINT=http://... neurofile-api npm run worker:fragments
```

Ajusta `DATABASE_URL` y `SQS_ENDPOINT` según el entorno (red del host o de otro compose).

---

## Worker de transcripción (neurofile-transcribe-conversation)

Consume la cola de conversaciones a transcribir: por cada mensaje extrae `conversationId`. La lógica completa (descargar fragmentos de S3, Whisper, concatenar, encolar summarize-map) se implementa en Fase 5.4–5.5; este worker (5.3) es el bucle consumidor. Ver [plan Fase 5](./AUDIO_TO_EXPEDIENT_IMPLEMENTATION_PLAN.md).

### Requisitos

- SQS accesible (`SQS_ENDPOINT` + `SQS_QUEUE_TRANSCRIBE_CONVERSATION` o `SQS_QUEUE_URL_TRANSCRIBE_CONVERSATION`).
- Variables: `AWS_REGION`, credenciales AWS.

### Ejecución local

```bash
npm run worker:transcribe
```

El proceso hace long poll; detener con Ctrl+C. Por ahora el handler solo registra el `conversationId` y borra el mensaje; en 5.4 se conectará la transcripción real.

---

## Otros workers (futuros)

- **worker:summarize-map**: consumidor de `neurofile-summarize-map` (Fase 6).

Se documentarán en este mismo archivo cuando estén implementados.
