-- One clinical record (expedient) per patient.
CREATE UNIQUE INDEX `Record_patient_id_key` ON `Record`(`patient_id`);
