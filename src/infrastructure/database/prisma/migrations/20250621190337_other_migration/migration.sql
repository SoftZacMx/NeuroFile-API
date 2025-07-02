/*
  Warnings:

  - Made the column `occupation` on table `Patient` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `Patient` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Patient` MODIFY `age` VARCHAR(191) NOT NULL,
    MODIFY `occupation` VARCHAR(191) NOT NULL,
    MODIFY `phone` VARCHAR(191) NOT NULL;
