import prisma from "../database/prisma/prisma.client";
import type { IExpedientDraftRepository } from "../../domain/repositories/IExpedientDraftRepository";

export class ExpedientDraftRepositoryImpl implements IExpedientDraftRepository {
  async upsert(data: {
    conversation_id: number;
    record_id: number;
    payload: Record<string, unknown>;
  }) {
    return prisma.expedientDraft.upsert({
      where: { conversation_id: data.conversation_id },
      create: {
        conversation_id: data.conversation_id,
        record_id: data.record_id,
        payload: data.payload as object,
        status: "draft",
      },
      update: {
        payload: data.payload as object,
        status: "draft",
      },
    });
  }

  async getByConversationId(conversationId: number) {
    return prisma.expedientDraft.findUnique({
      where: { conversation_id: conversationId },
    });
  }
}
