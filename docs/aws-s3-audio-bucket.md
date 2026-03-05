# Bucket S3 para audio (Fase 1 – Tarea 1.2)

Documentación del bucket donde se almacenan los fragmentos de audio de las conversaciones.

---

## Desarrollo local (por ahora)

**Por ahora todo el flujo es en local.** No hace falta crear un bucket real en AWS. Puedes emular S3 en tu máquina con:

- **LocalStack:** emula S3 (y luego SQS) con la misma API que AWS. Útil para que el mismo código funcione en local y en nube.
- **MinIO:** servidor S3-compatible que puedes levantar con Docker; la API es compatible con el SDK de AWS.

En ambos casos configuras en `.env` el endpoint local (ej. `http://localhost:4566` para LocalStack o `http://localhost:9000` para MinIO) y el nombre del bucket (ej. `neurofile-audio-local`). **En este proyecto**, en la raíz del API hay un `docker-compose.yml` con MinIO y un servicio `minio-init` que crea el bucket `neurofile-audio-local` al arrancar; basta con `docker compose up -d` para tener MinIO y el bucket listos.

El resto de este documento (nombre, región, políticas, script con AWS CLI) aplica cuando uses **AWS real** (staging/producción).

---

## Nombre y región (AWS real)

| Concepto | Valor |
|----------|--------|
| **Nombre del bucket** | `neurofile-audio-{env}` (ej. `neurofile-audio-dev`, `neurofile-audio-prod`) |
| **Región** | La misma que uses en el backend (variable `AWS_REGION`). Ejemplo: `us-east-1`, `eu-west-1`. |

El nombre debe ser **globalmente único** en AWS. Si `neurofile-audio-dev` existe en otra cuenta, usa un sufijo (ej. `neurofile-audio-dev-tuorg`).

---

## Política de acceso

- **Privado:** el bucket no debe tener acceso público.
- **Block Public Access:** activar las 4 opciones en el bucket:
  - Block public access to buckets and objects granted through new access control lists (ACLs)
  - Block public access to buckets and objects granted through any access control lists (ACLs)
  - Block public access to buckets and objects granted through new public bucket or access point policies
  - Block public and cross-account access to buckets and objects through any public bucket or access point policies
- **Acceso:** solo la aplicación (backend/workers) con credenciales IAM que tengan permisos sobre este bucket (y presigned URLs para subida desde el cliente).

---

## Creación del bucket

### Opción A: AWS Console

1. En S3, **Create bucket**.
2. **Bucket name:** `neurofile-audio-dev` (o el que corresponda a tu entorno).
3. **Region:** la misma que `AWS_REGION` del backend.
4. **Block Public Access:** dejar todas las opciones activadas (recomendado).
5. El resto por defecto. Crear.

### Opción B: AWS CLI

Con AWS CLI configurado (`aws configure`):

```bash
# Ajustar ENV y REGION según tu entorno
export ENV=dev
export AWS_REGION=us-east-1
export BUCKET_NAME=neurofile-audio-${ENV}

# Crear bucket (en us-east-1 no se especifica LocationConstraint; en otras regiones sí)
if [ "$AWS_REGION" = "us-east-1" ]; then
  aws s3api create-bucket --bucket "$BUCKET_NAME" --region "$AWS_REGION"
else
  aws s3api create-bucket --bucket "$BUCKET_NAME" --region "$AWS_REGION" \
    --create-bucket-configuration LocationConstraint="$AWS_REGION"
fi

# Bloquear acceso público
aws s3api put-public-access-block \
  --bucket "$BUCKET_NAME" \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

### Opción C: Script del proyecto

Desde la raíz del backend:

```bash
./scripts/create-audio-bucket.sh dev
```

(Ajusta región en el script o con `AWS_REGION=eu-west-1 ./scripts/create-audio-bucket.sh dev`.)

---

## Variable de entorno

En el backend (`.env`) define:

```env
AWS_REGION=us-east-1
S3_BUCKET_AUDIO=neurofile-audio-dev
```

Usa el mismo nombre y región que el bucket creado aquí.

---

## Resumen: local vs AWS

| Entorno | Qué usar | Bucket / endpoint |
|--------|----------|-------------------|
| **Local (ahora)** | LocalStack o MinIO | Bucket `neurofile-audio-local` en endpoint local (ej. `localhost:4566` o `localhost:9000`) |
| **AWS (más adelante)** | S3 real | Bucket `neurofile-audio-{env}` en la región configurada; script o Console/CLI de este doc |
