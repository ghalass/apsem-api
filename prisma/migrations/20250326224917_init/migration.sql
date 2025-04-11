-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('SUPER_ADMIN', 'ADMIN', 'AGENT_SAISIE', 'USER') NOT NULL DEFAULT 'USER',
    `active` BOOLEAN NOT NULL DEFAULT true,
    `lastVisite` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Site` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Site_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Typeparc` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Typeparc_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Parc` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `typeparcId` INTEGER NOT NULL,

    UNIQUE INDEX `Parc_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Engin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `parcId` INTEGER NOT NULL,
    `siteId` INTEGER NOT NULL,
    `initialHeureChassis` DOUBLE NULL DEFAULT 0,

    UNIQUE INDEX `Engin_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Typepanne` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Typepanne_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Panne` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `typepanneId` INTEGER NOT NULL,

    UNIQUE INDEX `Panne_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Saisiehrm` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `du` DATETIME(3) NOT NULL,
    `enginId` INTEGER NOT NULL,
    `siteId` INTEGER NOT NULL,
    `hrm` DOUBLE NOT NULL,

    UNIQUE INDEX `Saisiehrm_du_enginId_key`(`du`, `enginId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Saisiehim` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `panneId` INTEGER NOT NULL,
    `him` DOUBLE NOT NULL,
    `ni` INTEGER NOT NULL,
    `saisiehrmId` INTEGER NOT NULL,
    `obs` VARCHAR(191) NULL,
    `enginId` INTEGER NULL,

    UNIQUE INDEX `Saisiehim_panneId_saisiehrmId_key`(`panneId`, `saisiehrmId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Typelubrifiant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Typelubrifiant_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Lubrifiant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `typelubrifiantId` INTEGER NOT NULL,

    UNIQUE INDEX `Lubrifiant_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Saisielubrifiant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `lubrifiantId` INTEGER NOT NULL,
    `qte` DOUBLE NOT NULL,
    `obs` VARCHAR(191) NULL,
    `saisiehimId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Parc` ADD CONSTRAINT `Parc_typeparcId_fkey` FOREIGN KEY (`typeparcId`) REFERENCES `Typeparc`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Engin` ADD CONSTRAINT `Engin_parcId_fkey` FOREIGN KEY (`parcId`) REFERENCES `Parc`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Engin` ADD CONSTRAINT `Engin_siteId_fkey` FOREIGN KEY (`siteId`) REFERENCES `Site`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Panne` ADD CONSTRAINT `Panne_typepanneId_fkey` FOREIGN KEY (`typepanneId`) REFERENCES `Typepanne`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Saisiehrm` ADD CONSTRAINT `Saisiehrm_enginId_fkey` FOREIGN KEY (`enginId`) REFERENCES `Engin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Saisiehrm` ADD CONSTRAINT `Saisiehrm_siteId_fkey` FOREIGN KEY (`siteId`) REFERENCES `Site`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Saisiehim` ADD CONSTRAINT `Saisiehim_panneId_fkey` FOREIGN KEY (`panneId`) REFERENCES `Panne`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Saisiehim` ADD CONSTRAINT `Saisiehim_saisiehrmId_fkey` FOREIGN KEY (`saisiehrmId`) REFERENCES `Saisiehrm`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Saisiehim` ADD CONSTRAINT `Saisiehim_enginId_fkey` FOREIGN KEY (`enginId`) REFERENCES `Engin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lubrifiant` ADD CONSTRAINT `Lubrifiant_typelubrifiantId_fkey` FOREIGN KEY (`typelubrifiantId`) REFERENCES `Typelubrifiant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Saisielubrifiant` ADD CONSTRAINT `Saisielubrifiant_lubrifiantId_fkey` FOREIGN KEY (`lubrifiantId`) REFERENCES `Lubrifiant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Saisielubrifiant` ADD CONSTRAINT `Saisielubrifiant_saisiehimId_fkey` FOREIGN KEY (`saisiehimId`) REFERENCES `Saisiehim`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
