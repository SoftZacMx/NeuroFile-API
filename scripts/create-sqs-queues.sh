#!/usr/bin/env bash
# Fase 1 - Tareas 1.3 y 1.4: Crea las 3 colas SQS y sus DLQs con redrive policy.
# Uso: ./scripts/create-sqs-queues.sh [region]
# Ejemplo: ./scripts/create-sqs-queues.sh us-east-1
# Requiere: AWS CLI configurado (aws configure)

set -e

AWS_REGION="${1:-us-east-1}"
ENDPOINT="${SQS_ENDPOINT:-}"
MAX_RECEIVE_COUNT="${SQS_MAX_RECEIVE_COUNT:-5}"

if [ -n "$ENDPOINT" ]; then
  EXTRA_ARGS="--endpoint-url $ENDPOINT"
else
  EXTRA_ARGS=""
fi

echo "Creando colas SQS y DLQs en región: ${AWS_REGION} (maxReceiveCount=${MAX_RECEIVE_COUNT})"

# Crea una cola DLQ (sin redrive) y devuelve su ARN
create_dlq_and_get_arn() {
  local name=$1
  aws sqs create-queue --queue-name "$name" --region "$AWS_REGION" $EXTRA_ARGS \
    --output text --query 'QueueUrl' > /dev/null
  echo "DLQ $name creada." >&2
  local url
  url=$(aws sqs get-queue-url --queue-name "$name" --region "$AWS_REGION" $EXTRA_ARGS --query 'QueueUrl' --output text)
  aws sqs get-queue-attributes --queue-url "$url" --attribute-names QueueArn --region "$AWS_REGION" $EXTRA_ARGS \
    --query 'Attributes.QueueArn' --output text
}

# Crea cola principal con redrive a la DLQ
create_main_queue() {
  local name=$1
  local dlq_arn=$2
  local visibility=$3
  local redrive_policy="{\"deadLetterTargetArn\":\"$dlq_arn\",\"maxReceiveCount\":\"$MAX_RECEIVE_COUNT\"}"
  aws sqs create-queue --queue-name "$name" --region "$AWS_REGION" $EXTRA_ARGS \
    --attributes "VisibilityTimeout=$visibility,ReceiveMessageWaitTimeSeconds=20,RedrivePolicy=$redrive_policy"
  echo "Cola $name creada (redrive a DLQ tras ${MAX_RECEIVE_COUNT} reintentos)."
}

# 1. Crear las 3 DLQs y guardar ARNs
DLQ_ARN_FRAGMENTS=$(create_dlq_and_get_arn "neurofile-audio-fragments-dlq")
DLQ_ARN_TRANSCRIBE=$(create_dlq_and_get_arn "neurofile-transcribe-conversation-dlq")
DLQ_ARN_SUMMARIZE=$(create_dlq_and_get_arn "neurofile-summarize-map-dlq")

# 2. Crear colas principales con redrive policy
create_main_queue "neurofile-audio-fragments" "$DLQ_ARN_FRAGMENTS" 300
create_main_queue "neurofile-transcribe-conversation" "$DLQ_ARN_TRANSCRIBE" 1800
create_main_queue "neurofile-summarize-map" "$DLQ_ARN_SUMMARIZE" 600

echo ""
echo "Colas y DLQs listas. URLs: aws sqs get-queue-url --queue-name <nombre> --region $AWS_REGION $EXTRA_ARGS"
echo "Variables .env: SQS_QUEUE_* para las 3 colas principales; opcionalmente *_DLQ para monitoreo."
