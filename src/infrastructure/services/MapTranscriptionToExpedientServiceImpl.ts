import OpenAI from "openai";
import type { IMapTranscriptionToExpedientService } from "../../domain/services/IMapTranscriptionToExpedientService";

const DEFAULT_MODEL = "gpt-4o-mini";

const EXPEDIENT_JSON_SCHEMA = `
Devuelve ÚNICAMENTE un JSON válido, sin markdown ni texto extra, con estas claves (todas string, usa "" si no aplica):
consultation_reason, treatment_demand, incident_details, physical_description, school_area, work_area,
significant_events, psychosexual_history, family_diagram, family_relationship, family_mapping, family_hypothesis,
therapeutic_focus, therapeutic_goal, therapeutic_strategy, therapeutic_forecast, mental_exam,
diagnostic_impression, diagnostic_notes.
Opcionalmente incluye arrays (vacíos [] si no aplica):
symptoms: [{ detail: string }],
diagnoses: [{ axis?: string, dcm?: string, cie?: string, disorder?: string }],
modalities: [{ ti?: boolean, tf?: boolean, tp?: boolean, tg?: boolean, other?: boolean, rationale?: string }].
Extrae la información de la transcripción de la sesión clínica y rellena los campos que puedas identificar.
Idioma de los valores: español.
`.trim();

export class MapTranscriptionToExpedientServiceImpl
  implements IMapTranscriptionToExpedientService
{
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(apiKey?: string, model?: string) {
    const key = apiKey ?? process.env.OPENAI_API_KEY;
    if (!key?.trim()) {
      throw new Error(
        "MapTranscriptionToExpedientServiceImpl: OPENAI_API_KEY es requerido."
      );
    }
    this.client = new OpenAI({ apiKey: key.trim() });
    this.model = model ?? process.env.OPENAI_SUMMARIZE_MODEL ?? DEFAULT_MODEL;
  }

  async mapTranscription(
    transcription: string,
    patientId: number
  ): Promise<Record<string, unknown>> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: "system",
          content: `Eres un asistente que estructura transcripciones de sesiones de terapia en un expediente clínico. ${EXPEDIENT_JSON_SCHEMA}`,
        },
        {
          role: "user",
          content: `Transcripción de la sesión:\n\n${transcription.slice(0, 120000)}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error("LLM no devolvió contenido");
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(content) as Record<string, unknown>;
    } catch {
      throw new Error("LLM devolvió JSON inválido");
    }

    const payload: Record<string, unknown> = {
      consultation_reason: "",
      treatment_demand: "",
      incident_details: "",
      physical_description: "",
      school_area: "",
      work_area: "",
      significant_events: "",
      psychosexual_history: "",
      family_diagram: "",
      family_relationship: "",
      family_mapping: "",
      family_hypothesis: "",
      therapeutic_focus: "",
      therapeutic_goal: "",
      therapeutic_strategy: "",
      therapeutic_forecast: "",
      mental_exam: "",
      diagnostic_impression: "",
      diagnostic_notes: "",
      patient_id: patientId,
      symptoms: [],
      diagnoses: [],
      modalities: [],
    };

    for (const [key, value] of Object.entries(parsed)) {
      if (key === "patient_id") continue;
      if (Object.prototype.hasOwnProperty.call(payload, key)) {
        payload[key] = value ?? payload[key];
      }
    }

    return payload;
  }
}
