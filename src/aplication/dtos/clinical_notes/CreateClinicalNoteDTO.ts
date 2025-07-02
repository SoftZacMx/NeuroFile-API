export interface CreateClinicalNoteDTO {
  date: Date;               // o string, si lo recibes en formato ISO
  note: string;
  recordId: number;
}
