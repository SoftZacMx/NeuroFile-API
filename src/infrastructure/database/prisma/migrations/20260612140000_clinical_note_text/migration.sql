-- Align ClinicalNote.note with schema.prisma (@db.Text). Was VARCHAR(191) from initial migration.
ALTER TABLE `ClinicalNote` MODIFY `note` TEXT NOT NULL;
