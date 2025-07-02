export interface CreateRecordDTO {
  id?:number;
  incident_details: string;
  physical_description: string;
  treatment_demand: string;
  school_area: string;
  work_area: string;
  significant_events: string;
  psychosexual_history: string;
  therapeutic_focus: string;
  therapeutic_goal: string;
  therapeutic_strategy: string;
  therapeutic_forecast: string;
  family_diagram: string;
  family_relationship: string;
  family_mapping: string;
  diagnostic_impression: string;
  family_hypothesis: string;
  mental_exam: string;
  diagnostic_notes: string;
  consultation_reason: string;
  patient_id: number;
  symptoms?: { detail: string }[];
  diagnoses?: { axis?: string; dcm?: string; cie?: string; disorder?: string }[];
  modalities?: { ti?: boolean; tf?: boolean; tp?: boolean; tg?: boolean; other?: boolean; rationale?: string }[];
}
