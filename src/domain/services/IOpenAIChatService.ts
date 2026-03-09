/**
 * Servicio de chat con OpenAI para respuestas con contexto (terapeuta).
 */
export interface IOpenAIChatService {
  /**
   * Envía un mensaje de sistema y un mensaje de usuario y devuelve la respuesta del asistente.
   */
  chat(systemMessage: string, userMessage: string): Promise<string>;
}
