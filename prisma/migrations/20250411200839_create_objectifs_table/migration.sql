-- CreateTable
CREATE TABLE `Objectif` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `annee` INTEGER NOT NULL,
    `parcId` INTEGER NOT NULL,
    `siteId` INTEGER NOT NULL,
    `dispo` DOUBLE NULL,
    `mtbf` DOUBLE NULL,
    `tdm` DOUBLE NULL,
    `spe_huile` DOUBLE NULL,
    `spe_go` DOUBLE NULL,
    `spe_graisse` DOUBLE NULL,

    UNIQUE INDEX `Objectif_annee_parcId_siteId_key`(`annee`, `parcId`, `siteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Objectif` ADD CONSTRAINT `Objectif_parcId_fkey` FOREIGN KEY (`parcId`) REFERENCES `Parc`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Objectif` ADD CONSTRAINT `Objectif_siteId_fkey` FOREIGN KEY (`siteId`) REFERENCES `Site`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
