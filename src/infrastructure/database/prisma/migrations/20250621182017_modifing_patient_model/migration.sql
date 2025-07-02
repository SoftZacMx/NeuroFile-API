/*
  Warnings:

  - You are about to drop the column `firstName` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `middleName` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Patient` table. All the data in the column will be lost.
  - Added the required column `first_name` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Patient` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Patient` DROP FOREIGN KEY `Patient_userId_fkey`;

-- DropIndex
DROP INDEX `Patient_userId_fkey` ON `Patient`;

-- AlterTable
ALTER TABLE `Patient` DROP COLUMN `firstName`,
    DROP COLUMN `isActive`,
    DROP COLUMN `lastName`,
    DROP COLUMN `middleName`,
    DROP COLUMN `userId`,
    ADD COLUMN `first_name` VARCHAR(191) NOT NULL,
    ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `last_name` VARCHAR(191) NOT NULL,
    ADD COLUMN `second_last_name` VARCHAR(191) NULL,
    ADD COLUMN `user_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Patient` ADD CONSTRAINT `Patient_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
