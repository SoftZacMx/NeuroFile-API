-- DropForeignKey
ALTER TABLE `Appointment` DROP FOREIGN KEY `Appointment_patientId_fkey`;

-- DropForeignKey
ALTER TABLE `ClinicalNote` DROP FOREIGN KEY `ClinicalNote_recordId_fkey`;

-- DropForeignKey
ALTER TABLE `DiagnosticImpression` DROP FOREIGN KEY `DiagnosticImpression_recordId_fkey`;

-- DropForeignKey
ALTER TABLE `Patient` DROP FOREIGN KEY `Patient_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `Record` DROP FOREIGN KEY `Record_patient_id_fkey`;

-- DropForeignKey
ALTER TABLE `Symptom` DROP FOREIGN KEY `Symptom_recordId_fkey`;

-- DropForeignKey
ALTER TABLE `TherapeuticModality` DROP FOREIGN KEY `TherapeuticModality_recordId_fkey`;

-- DropIndex
DROP INDEX `Appointment_patientId_fkey` ON `Appointment`;

-- DropIndex
DROP INDEX `ClinicalNote_recordId_fkey` ON `ClinicalNote`;

-- DropIndex
DROP INDEX `DiagnosticImpression_recordId_fkey` ON `DiagnosticImpression`;

-- DropIndex
DROP INDEX `Patient_user_id_fkey` ON `Patient`;

-- DropIndex
DROP INDEX `Record_patient_id_fkey` ON `Record`;

-- DropIndex
DROP INDEX `Symptom_recordId_fkey` ON `Symptom`;

-- DropIndex
DROP INDEX `TherapeuticModality_recordId_fkey` ON `TherapeuticModality`;

-- AddForeignKey
ALTER TABLE `Patient` ADD CONSTRAINT `Patient_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Record` ADD CONSTRAINT `Record_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `Patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Symptom` ADD CONSTRAINT `Symptom_recordId_fkey` FOREIGN KEY (`recordId`) REFERENCES `Record`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TherapeuticModality` ADD CONSTRAINT `TherapeuticModality_recordId_fkey` FOREIGN KEY (`recordId`) REFERENCES `Record`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClinicalNote` ADD CONSTRAINT `ClinicalNote_recordId_fkey` FOREIGN KEY (`recordId`) REFERENCES `Record`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiagnosticImpression` ADD CONSTRAINT `DiagnosticImpression_recordId_fkey` FOREIGN KEY (`recordId`) REFERENCES `Record`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
