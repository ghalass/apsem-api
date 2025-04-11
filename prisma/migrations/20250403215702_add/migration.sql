-- AlterTable
ALTER TABLE `saisielubrifiant` ADD COLUMN `typeconsommationlubId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Saisielubrifiant` ADD CONSTRAINT `Saisielubrifiant_typeconsommationlubId_fkey` FOREIGN KEY (`typeconsommationlubId`) REFERENCES `Typeconsommationlub`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
