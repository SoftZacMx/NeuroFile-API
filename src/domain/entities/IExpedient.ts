import { IPatient } from "./IPatients";

export interface IRecord {
  id: number;
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
  created_at: Date;
  patient_id: number;

  // Relaciones
  patient?: IPatient;
  symptoms?: any[];
  modalities?: any[];
  clinical_notes?: any[];
  diagnoses?: any[];
}
