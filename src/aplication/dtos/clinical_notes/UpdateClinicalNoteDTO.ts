export interface UpdateClinicalNoteDTO {
  id: number;               // ID necesario para saber cuál nota actualizar
  date?: Date;              // opcionales por si solo se edita uno
  note?: string;
}
