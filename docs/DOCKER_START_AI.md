# Iniciar NeuroFile API con Docker

Guía para una IA. Comandos exactos, sin pasos opcionales.

## Requisitos

- Docker y Docker Compose instalados.
- Archivo `.env` en la raíz (copiar de `.env.example` si no existe). Para correr 100% local, NO se necesitan claves AWS reales: el compose usa MinIO y LocalStack con credenciales `test`/`minioadmin`.
- Para transcripción con OpenAI: definir `OPENAI_API_KEY` en `.env`. Para transcripción local: `WHISPER_PROVIDER=local`.

## Arranque

```bash
docker compose up -d --build
```

Esto levanta, en orden de dependencias:

1. `mysql` (3306) — base de datos.
2. `minio` (9000 API, 9001 consola) + `minio-init` — crea el bucket `neurofile-audio-local`.
3. `localstack` (4566) + `sqs-init` — crea las 3 colas SQS y sus DLQs.
4. `api` (3000) — espera a mysql/minio/localstack/sqs-init; al arrancar corre `prisma migrate deploy` automáticamente (ver `docker-entrypoint.sh`).
5. Workers: `worker-fragments`, `worker-transcribe`, `worker-summarize-map`.
6. `whisper-service` (8000) — solo se usa si `WHISPER_PROVIDER=local`.
7. `sqs-admin` (3999) — UI de colas.

No se requiere correr migraciones manualmente: el entrypoint de `api` las ejecuta.

## Verificar que está arriba

```bash
docker compose ps
docker compose logs -f api
```

API disponible en `http://localhost:3000`. Swagger en `http://localhost:3000/api-docs`.

## Puertos

| Servicio | URL |
|---|---|
| API | http://localhost:3000 |
| Swagger | http://localhost:3000/api-docs |
| MinIO consola | http://localhost:9001 (minioadmin / minioadmin) |
| SQS Admin | http://localhost:3999 |
| LocalStack | http://localhost:4566 |
| Whisper | http://localhost:8000 |

## Conflicto de puerto MySQL

Si el 3306 está ocupado, en `docker-compose.yml` cambia el mapeo a `"3307:3306"`. Esto NO afecta la comunicación entre contenedores (siguen usando `mysql:3306`).

## Comandos útiles

```bash
docker compose logs -f api              # logs de la API
docker compose logs -f worker-transcribe # logs de un worker
docker compose restart api              # reiniciar solo la API tras cambios de .env
docker compose down                     # detener (conserva volúmenes/datos)
docker compose down -v                  # detener y BORRAR datos (mysql_data, minio_data)
docker compose up -d --build api        # reconstruir solo la API tras cambios de código
```

Scripts equivalentes en `package.json`: `npm run docker:up`, `docker:down`, `docker:build`, `docker:logs`.

## Reset total

```bash
docker compose down -v
docker compose up -d --build
```
