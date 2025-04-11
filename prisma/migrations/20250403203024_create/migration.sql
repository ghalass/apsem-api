-- CreateTable
CREATE TABLE `Typeconsommationlub` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Typeconsommationlub_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `typeconsommationlub_parc` (
    `parc_id` INTEGER NOT NULL,
    `typeconsommationlub_id` INTEGER NOT NULL,

    PRIMARY KEY (`parc_id`, `typeconsommationlub_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `typeconsommationlub_parc` ADD CONSTRAINT `typeconsommationlub_parc_parc_id_fkey` FOREIGN KEY (`parc_id`) REFERENCES `Parc`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `typeconsommationlub_parc` ADD CONSTRAINT `typeconsommationlub_parc_typeconsommationlub_id_fkey` FOREIGN KEY (`typeconsommationlub_id`) REFERENCES `Typeconsommationlub`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
