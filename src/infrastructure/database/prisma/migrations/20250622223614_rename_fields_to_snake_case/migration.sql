/*
  Warnings:

  - You are about to drop the column `consultationReason` on the `Record` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Record` table. All the data in the column will be lost.
  - You are about to drop the column `diagnosticImpression` on the `Record` table. All the data in the column will be lost.
  - You are about to drop the column `diagnosticNotes` on the `Record` table. All the data in the column will be lost.
  - You are about to drop the column `familyDiagram` on the `Record` table. All the data in the column will be lost.
  - You are about to drop the column `familyHypothesis` on the `Record` table. All the data in the column will be lost.
  - You are about to drop the column `familyMapping` on the `Record` table. All the data in the column will be lost.
  - You are about to drop the column `familyRelationship` on the `Record` table. All the data in the column will be lost.
  - You are about to drop the column `incidentDetails` on the `Record` table. All the data in the column will be lost.
  - You are about to drop the column `mentalExam` on the `Record` table. All the data in the column will be lost.
  - You are about to drop the column `patientId` on the `Record` table. All the data in the column will be lost.
  - You are about to drop the column `physicalDescription` on the `Record` table. All the data in the column will be lost.
  - You are about to drop the column `psychosexualHistory` on the `Record` table. All the data in the column will be lost.
  - You are about to drop the column `schoolArea` on the `Record` table. All the data in the column will be lost.
  - You are about to drop the column `significantEvents` on the `Record` table. All the data in the column will be lost.
  - You are about to drop the column `therapeuticFocus` on the `Record` table. All the data in the column will be lost.
  - You are about to drop the column `therapeuticForecast` on the `Record` table. All the data in the column will be lost.
  - You are about to drop the column `therapeuticGoal` on the `Record` table. All the data in the column will be lost.
  - You are about to drop the column `therapeuticStrategy` on the `Record` table. All the data in the column will be lost.
  - You are about to drop the column `treatmentDemand` on the `Record` table. All the data in the column will be lost.
  - You are about to drop the column `workArea` on the `Record` table. All the data in the column will be lost.
  - Added the required column `consultation_reason` to the `Record` table without a default value. This is not possible if the table is not empty.
  - Added the required column `diagnostic_impression` to the `Record` table without a default value. This is not possible if the table is not empty.
  - Added the required column `diagnostic_notes` to the `Record` table without a default value. This is not possible if the table is not empty.
  - Added the required column `family_diagram` to the `Record` table without a default value. This is not possible if the table is not empty.
  - Added the required column `family_hypothesis` to the `Record` table without a default value. This is not possible if the table is not empty.
  - Added the required column `family_mapping` to the `Record` table without a default value. This is not possible if the table is not empty.
  - Added the required column `family_relationship` to the `Record` table without a default value. This is not possible if the table is not empty.
  - Added the required column `incident_details` to the `Record` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mental_exam` to the `Record` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patient_id` to the `Record` table without a default value. This is not possible if the table is not empty.
  - Added the required column `physical_description` to the `Record` table without a default value. This is not possible if the table is not empty.
  - Added the required column `psychosexual_history` to the `Record` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_area` to the `Record` table without a default value. This is not possible if the table is not empty.
  - Added the required column `significant_events` to the `Record` table without a default value. This is not possible if the table is not empty.
  - Added the required column `therapeutic_focus` to the `Record` table without a default value. This is not possible if the table is not empty.
  - Added the required column `therapeutic_forecast` to the `Record` table without a default value. This is not possible if the table is not empty.
  - Added the required column `therapeutic_goal` to the `Record` table without a default value. This is not possible if the table is not empty.
  - Added the required column `therapeutic_strategy` to the `Record` table without a default value. This is not possible if the table is not empty.
  - Added the required column `treatment_demand` to the `Record` table without a default value. This is not possible if the table is not empty.
  - Added the required column `work_area` to the `Record` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Record` DROP FOREIGN KEY `Record_patientId_fkey`;

-- DropIndex
DROP INDEX `Record_patientId_fkey` ON `Record`;

-- AlterTable
ALTER TABLE `Record` DROP COLUMN `consultationReason`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `diagnosticImpression`,
    DROP COLUMN `diagnosticNotes`,
    DROP COLUMN `familyDiagram`,
    DROP COLUMN `familyHypothesis`,
    DROP COLUMN `familyMapping`,
    DROP COLUMN `familyRelationship`,
    DROP COLUMN `incidentDetails`,
    DROP COLUMN `mentalExam`,
    DROP COLUMN `patientId`,
    DROP COLUMN `physicalDescription`,
    DROP COLUMN `psychosexualHistory`,
    DROP COLUMN `schoolArea`,
    DROP COLUMN `significantEvents`,
    DROP COLUMN `therapeuticFocus`,
    DROP COLUMN `therapeuticForecast`,
    DROP COLUMN `therapeuticGoal`,
    DROP COLUMN `therapeuticStrategy`,
    DROP COLUMN `treatmentDemand`,
    DROP COLUMN `workArea`,
    ADD COLUMN `consultation_reason` VARCHAR(191) NOT NULL,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `diagnostic_impression` VARCHAR(191) NOT NULL,
    ADD COLUMN `diagnostic_notes` VARCHAR(191) NOT NULL,
    ADD COLUMN `family_diagram` VARCHAR(191) NOT NULL,
    ADD COLUMN `family_hypothesis` VARCHAR(191) NOT NULL,
    ADD COLUMN `family_mapping` VARCHAR(191) NOT NULL,
    ADD COLUMN `family_relationship` VARCHAR(191) NOT NULL,
    ADD COLUMN `incident_details` VARCHAR(191) NOT NULL,
    ADD COLUMN `mental_exam` VARCHAR(191) NOT NULL,
    ADD COLUMN `patient_id` INTEGER NOT NULL,
    ADD COLUMN `physical_description` VARCHAR(191) NOT NULL,
    ADD COLUMN `psychosexual_history` VARCHAR(191) NOT NULL,
    ADD COLUMN `school_area` VARCHAR(191) NOT NULL,
    ADD COLUMN `significant_events` VARCHAR(191) NOT NULL,
    ADD COLUMN `therapeutic_focus` VARCHAR(191) NOT NULL,
    ADD COLUMN `therapeutic_forecast` VARCHAR(191) NOT NULL,
    ADD COLUMN `therapeutic_goal` VARCHAR(191) NOT NULL,
    ADD COLUMN `therapeutic_strategy` VARCHAR(191) NOT NULL,
    ADD COLUMN `treatment_demand` VARCHAR(191) NOT NULL,
    ADD COLUMN `work_area` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Record` ADD CONSTRAINT `Record_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `Patient`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
