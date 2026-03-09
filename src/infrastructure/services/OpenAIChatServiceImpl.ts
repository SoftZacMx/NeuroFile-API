import OpenAI from "openai";
import type { IOpenAIChatService } from "../../domain/services/IOpenAIChatService";

const DEFAULT_MODEL = "gpt-4o-mini";

/**
 * Implementación de chat con OpenAI (Chat Completions) para contexto del terapeuta.
 * Requiere OPENAI_API_KEY en el entorno.
 */
export class OpenAIChatServiceImpl implements IOpenAIChatService {
  private readonly client: OpenAI;

  constructor(apiKey?: string) {
    const key = apiKey ?? process.env.OPENAI_API_KEY;
    if (!key?.trim()) {
      throw new Error("OpenAIChatServiceImpl: OPENAI_API_KEY es requerido.");
    }
    this.client = new OpenAI({ apiKey: key.trim() });
  }

  async chat(systemMessage: string, userMessage: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: process.env.OPENAI_CHAT_MODEL ?? DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage },
      ],
      max_tokens: 1024,
    });

    const content = response.choices[0]?.message?.content?.trim();
    return content ?? "";
  }
}
