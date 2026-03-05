#!/usr/bin/env bash
# Fase 1 - Tarea 1.2: Crea el bucket S3 para fragmentos de audio (acceso privado).
# Uso: ./scripts/create-audio-bucket.sh [env]
# Ejemplo: ./scripts/create-audio-bucket.sh dev
# Requiere: AWS CLI configurado (aws configure)

set -e

ENV="${1:-dev}"
BUCKET_NAME="neurofile-audio-${ENV}"
AWS_REGION="${AWS_REGION:-us-east-1}"

echo "Creando bucket: ${BUCKET_NAME} en región: ${AWS_REGION}"

if [ "$AWS_REGION" = "us-east-1" ]; then
  aws s3api create-bucket --bucket "$BUCKET_NAME" --region "$AWS_REGION"
else
  aws s3api create-bucket --bucket "$BUCKET_NAME" --region "$AWS_REGION" \
    --create-bucket-configuration LocationConstraint="$AWS_REGION"
fi

aws s3api put-public-access-block \
  --bucket "$BUCKET_NAME" \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

echo "Bucket ${BUCKET_NAME} creado y acceso público bloqueado."
echo "Añade a .env: S3_BUCKET_AUDIO=${BUCKET_NAME} y AWS_REGION=${AWS_REGION}"
