-- CreateTable
CREATE TABLE `typepanne_parc` (
    `parc_id` INTEGER NOT NULL,
    `typepanne_id` INTEGER NOT NULL,

    PRIMARY KEY (`parc_id`, `typepanne_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `typepanne_parc` ADD CONSTRAINT `typepanne_parc_parc_id_fkey` FOREIGN KEY (`parc_id`) REFERENCES `Parc`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `typepanne_parc` ADD CONSTRAINT `typepanne_parc_typepanne_id_fkey` FOREIGN KEY (`typepanne_id`) REFERENCES `Typepanne`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
