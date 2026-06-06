# Guía de instalación y configuración – NeuroFile-API (flujo audio → expediente)

**Uso:** Esta guía sirve para que desarrolladores (y asistentes IA) instalen y configuren todo lo necesario para el proyecto sin batallar. Sigue los pasos en orden y revisa la sección de problemas frecuentes si algo falla.

---

## 1. Requisitos previos

- **Node.js** 18+ y **npm** (para API y workers en local).
- **Docker** y **Docker Compose** (para infraestructura y opcionalmente API/workers). En Mac/Windows: **Docker Desktop** debe estar **abierto y en ejecución** antes de cualquier `docker compose`; si no, verás "Cannot connect to the Docker daemon".
- **Cuenta OpenAI** (opcional): solo si usas transcripción por API (`WHISPER_PROVIDER=openai`). Para evitar cuota/costes se recomienda **Whisper en local** (`WHISPER_PROVIDER=local`).

---

## 2. Clonar / abrir el proyecto y dependencias Node

```bash
cd NeuroFile-API
npm install
```

Generar cliente Prisma y aplicar migraciones:

```bash
npm run db:generate
npm run db:migrate
```

Opcional: datos de prueba (usuarios, pacientes):

```bash
npm run db:seed
```

---

## 3. Variables de entorno (`.env`)

Copia `.env.example` a `.env` si existe; si no, crea `.env` en la raíz del API con al menos:

```env
# Base de datos (desde el host: 127.0.0.1; desde contenedor: mysql)
DATABASE_URL=mysql://neurofile:neurofile@127.0.0.1:3306/neurofile
JWT_SECRET=tu-secreto-jwt

# AWS (valores de prueba para local)
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_REGION=us-east-1

# S3 local (MinIO)
S3_BUCKET_AUDIO=neurofile-audio-local
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin

# SQS local (LocalStack)
SQS_ENDPOINT=http://localhost:4566
SQS_QUEUE_AUDIO_FRAGMENTS=neurofile-audio-fragments
SQS_QUEUE_TRANSCRIBE_CONVERSATION=neurofile-transcribe-conversation
SQS_QUEUE_SUMMARIZE_MAP=neurofile-summarize-map

# Transcripción: elegir uno de los dos
# Opción A – Whisper en local (recomendado, sin cuota)
WHISPER_PROVIDER=local
WHISPER_SERVICE_URL=http://localhost:8000
WHISPER_MODEL_SIZE=base

# Opción B – API de OpenAI (requiere OPENAI_API_KEY y cuota)
# WHISPER_PROVIDER=openai
# OPENAI_API_KEY=sk-...
```

Si la API y los workers corren **dentro de Docker**, las URLs de servicios deben ser por nombre de servicio: por ejemplo el worker-transcribe usa `WHISPER_SERVICE_URL=http://whisper-service:8000` (ya viene definido en `docker-compose.yml`).

---

## 4. Orden recomendado: qué levantar y en qué orden

### 4.1 Solo infraestructura con Docker (API y workers en local)

1. **Asegúrate de que Docker Desktop esté en ejecución.**

2. **Levantar MySQL, LocalStack, colas SQS, MinIO y bucket:**

   ```bash
   docker compose up -d mysql localstack sqs-init minio minio-init
   ```

3. **Si usas Whisper en local:** levantar el microservicio de transcripción:

   ```bash
   docker compose build whisper-service
   docker compose up -d whisper-service
   ```

   Verificar que esté en marcha:

   ```bash
   docker compose ps whisper-service
   curl http://localhost:8000/health
   ```

   Si el contenedor aparece como "Exited", revisar: `docker compose logs whisper-service`. Errores típicos: falta la dependencia `requests` en `services/whisper-service/requirements.txt` (debe estar listada); puerto 8000 ya en uso (liberar con `kill $(lsof -t -i :8000)` o usar otro puerto).

4. **API en local:**

   ```bash
   npm run dev
   ```

5. **Workers en local** (en terminales separadas):

   ```bash
   npm run worker:fragments
   npm run worker:transcribe
   ```

   El worker de transcripción debe mostrar en log `(Whisper: local)` o `(Whisper: openai)` según `WHISPER_PROVIDER`.

### 4.2 Todo con Docker (API + workers + infra)

1. **Liberar puertos** si ya tienes la API u otro servicio en 3000 o 8000:
   - 3000: suele ser la API (`npm run dev`). Cierra ese proceso o mata: `kill $(lsof -t -i :3000)`.
   - 8000: suele ser whisper-service. `kill $(lsof -t -i :8000)` si hace falta.

2. **Definir en `.env`** (para transcripción local en Docker):
   ```env
   WHISPER_PROVIDER=local
   ```
   El compose ya inyecta `WHISPER_SERVICE_URL=http://whisper-service:8000` para el worker-transcribe.

3. **Construir y levantar todo** (incluye api, workers, mysql, localstack, sqs-init, minio, minio-init, whisper-service):

   ```bash
   docker compose build
   docker compose up -d
   ```

   Si falla "port 3000 already in use", no levantes el servicio `api` o cambia el mapeo en `docker-compose.yml` (ej. `3001:3000`). Para levantar todo menos la API:

   ```bash
   docker compose up -d mysql localstack sqs-init minio minio-init whisper-service worker-fragments worker-transcribe
   ```

4. **Verificar whisper-service** (si usas local):
   ```bash
   docker compose ps -a
   docker compose logs whisper-service
   curl http://localhost:8000/health
   ```

---

## 5. Comprobar que el flujo hasta Fase 5 funciona

1. **Login:** `POST /api/auth/login` con `{ "email": "maria.garcia@neurofile.com", "password": "NeuroFile2025" }` (tras `npm run db:seed`). Guardar el `token`.
1b. **Recuperación de contraseña (opcional):** ver [PASSWORD_RESET.md](./PASSWORD_RESET.md).
2. **Crear conversación:** `POST /api/conversations` con `Authorization: Bearer <token>` y body `{ "patientId": 1 }`. Guardar `conversationId`.
3. **Subir fragmento:** `POST /api/conversations/:id/fragments/upload` (multipart: `sequenceIndex`, `recordedAt`, `file` con un audio).
4. **Terminar conversación:** `POST /api/conversations/:id/end`.
5. Revisar en BD que la conversación tenga `transcription_status = 'transcribed'` y `full_transcription` no nulo; o revisar logs del worker de transcripción.

---

## 6. Problemas frecuentes

| Síntoma | Causa | Solución |
|--------|--------|----------|
| `Cannot connect to the Docker daemon` | Docker no está corriendo | Abrir Docker Desktop y esperar a que inicie. |
| `port 3000 already in use` | API u otro proceso en 3000 | Cerrar el proceso o `kill $(lsof -t -i :3000)`. O mapear otro puerto para el servicio `api` en docker-compose. |
| `port 8000 already in use` | Otro proceso (p. ej. whisper en local) en 8000 | `kill $(lsof -t -i :8000)` o no publicar 8000 del contenedor si solo lo usa el worker en Docker. |
| `docker compose ps whisper-service` sin filas / contenedor Exited | whisper-service falla al arrancar | `docker compose logs whisper-service`. Si ves `ModuleNotFoundError: No module named 'requests'`, añadir `requests>=2.28.0` a `services/whisper-service/requirements.txt`, luego `docker compose build whisper-service` y `docker compose up -d whisper-service`. |
| Worker de transcripción no muestra logs al terminar conversación | Buffer de stdout o worker no corriendo | Asegurar que el worker está en ejecución (`npm run worker:transcribe` o contenedor worker-transcribe Up). Si usas Docker, logs: `docker compose logs -f worker-transcribe`. |
| Transcripción falla con 429 | Cuota OpenAI agotada | Usar Whisper en local: `WHISPER_PROVIDER=local`, levantar `whisper-service` y `WHISPER_SERVICE_URL` correcto. |
| SQS: "Unable to locate credentials" (CLI) | AWS CLI sin credenciales para LocalStack | `export AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test` antes de usar `aws --endpoint-url=http://localhost:4566 ...`. |

---

## 7. Referencias en el repositorio

- [Plan de implementación (Fases 1–9)](./AUDIO_TO_EXPEDIENT_IMPLEMENTATION_PLAN.md)
- [Workers (ejecución local, PM2, Docker)](./workers.md)
- [Colas SQS](./aws-sqs-queues.md)
- [Whisper local (microservicio)](../services/whisper-service/README.md)

---

*Documento pensado para desarrolladores y para que asistentes IA usen como guía al ayudar con instalación y configuración de este proyecto.*
