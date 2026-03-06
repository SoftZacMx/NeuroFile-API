import prisma from "../database/prisma/prisma.client";
import type { IAudioFragmentRepository } from "../../domain/repositories/IAudioFragmentRepository";

export class AudioFragmentRepositoryImpl implements IAudioFragmentRepository {
  async listByConversationId(conversationId: number) {
    return prisma.audioFragment.findMany({
      where: { conversation_id: conversationId },
      orderBy: { sequence_index: "asc" },
    });
  }

  async upsert(data: {
    conversation_id: number;
    sequence_index: number;
    recorded_at: Date;
    s3_key: string;
    s3_bucket?: string | null;
  }) {
    return prisma.audioFragment.upsert({
      where: {
        conversation_id_sequence_index: {
          conversation_id: data.conversation_id,
          sequence_index: data.sequence_index,
        },
      },
      create: {
        conversation_id: data.conversation_id,
        sequence_index: data.sequence_index,
        recorded_at: data.recorded_at,
        s3_key: data.s3_key,
        s3_bucket: data.s3_bucket ?? null,
      },
      update: {
        recorded_at: data.recorded_at,
        s3_key: data.s3_key,
        s3_bucket: data.s3_bucket ?? undefined,
      },
    });
  }

  async updateTranscription(data: {
    conversation_id: number;
    sequence_index: number;
    transcription_text: string;
    status: "transcribed" | "failed";
  }) {
    return prisma.audioFragment.update({
      where: {
        conversation_id_sequence_index: {
          conversation_id: data.conversation_id,
          sequence_index: data.sequence_index,
        },
      },
      data: {
        transcription_text: data.transcription_text,
        status: data.status,
      },
    });
  }
}
