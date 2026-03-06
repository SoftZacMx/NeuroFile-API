import prisma from "../database/prisma/prisma.client";
import type { IConversationRepository } from "../../domain/repositories/IConversationRepository";

export class ConversationRepositoryImpl implements IConversationRepository {
  async create(data: {
    record_id: number;
    user_id: number;
  }) {
    return prisma.conversation.create({
      data: {
        record_id: data.record_id,
        user_id: data.user_id,
      },
    });
  }

  async getById(id: number) {
    return prisma.conversation.findUnique({
      where: { id },
    });
  }

  async setEndedAt(id: number) {
    return prisma.conversation.update({
      where: { id },
      data: { ended_at: new Date() },
    });
  }

  async setTranscriptionStatus(
    id: number,
    status: "pending" | "transcribing" | "transcribed" | "failed"
  ) {
    return prisma.conversation.update({
      where: { id },
      data: { transcription_status: status },
    });
  }

  async setFullTranscription(id: number, fullTranscription: string) {
    return prisma.conversation.update({
      where: { id },
      data: {
        full_transcription: fullTranscription,
        transcription_status: "transcribed",
      },
    });
  }
}
