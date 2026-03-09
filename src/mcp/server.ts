/**
 * Servidor MCP para NeuroFile: expone tools de contexto para el terapeuta.
 * Ejecutar con: npm run mcp:server
 * Conecta por stdio (Cursor u otro cliente MCP).
 */
import "dotenv/config";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio";
import { ConversationRepositoryImpl } from "../infrastructure/repositories/ConversationRepositoryImpl";
import { ClinicalNoteRepositoryImpl } from "../infrastructure/repositories/ClincalNotesRepository";
import { ExpedientDraftRepositoryImpl } from "../infrastructure/repositories/ExpedientDraftRepositoryImpl";
import { ExpedientRepositoryImpl } from "../infrastructure/repositories/ExpedientsRepositoryImplementation";
import { TherapistContextService } from "../aplication/services/TherapistContextService";

const conversationRepo = new ConversationRepositoryImpl();
const clinicalNotesRepo = new ClinicalNoteRepositoryImpl();
const expedientDraftRepo = new ExpedientDraftRepositoryImpl();
const expedientRepo = new ExpedientRepositoryImpl();

const contextService = new TherapistContextService({
  conversationRepository: conversationRepo,
  clinicalNotesRepository: clinicalNotesRepo,
  expedientDraftRepository: expedientDraftRepo,
  expedientRepository: expedientRepo,
});

const server = new McpServer(
  {
    name: "neurofile-therapist-context",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: { listChanged: true },
      resources: { listChanged: true },
    },
  }
);

// --- Tools ---
server.registerTool(
  "get_last_session_context",
  {
    description: "Devuelve el contenido de la última sesión del expediente (transcripción o resumen) listo para prompt.",
    inputSchema: z.object({ recordId: z.number().describe("ID del expediente (record)") }),
  },
  async (args) => {
    const recordId = args.recordId;
    const text = await contextService.getLastSessionContext(recordId);
    return { content: [{ type: "text", text }] };
  }
);

server.registerTool(
  "get_evolution_context",
  {
    description: "Devuelve notas clínicas y resúmenes de sesiones en el periodo indicado para sintetizar evolución.",
    inputSchema: z.object({
      recordId: z.number().describe("ID del expediente"),
      months: z.number().optional().describe("Número de meses hacia atrás (por defecto 6)"),
    }),
  },
  async (args) => {
    const recordId = args.recordId;
    const months = args.months ?? 6;
    const text = await contextService.getEvolutionContext(recordId, months);
    return { content: [{ type: "text", text }] };
  }
);

server.registerTool(
  "get_current_session_context",
  {
    description: "Devuelve la transcripción o resumen de la conversación indicada (para sugerir nota clínica).",
    inputSchema: z.object({ conversationId: z.number().describe("ID de la conversación") }),
  },
  async (args) => {
    const text = await contextService.getCurrentSessionContext(args.conversationId);
    return { content: [{ type: "text", text }] };
  }
);

const transport = new StdioServerTransport();
server.connect(transport).then(() => {
  console.error("[mcp] NeuroFile therapist context server running on stdio");
});
