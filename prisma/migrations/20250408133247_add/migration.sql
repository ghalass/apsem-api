-- CreateTable
CREATE TABLE `lubrifiant_parc` (
    `parc_id` INTEGER NOT NULL,
    `lubrifiant_id` INTEGER NOT NULL,

    PRIMARY KEY (`parc_id`, `lubrifiant_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `lubrifiant_parc` ADD CONSTRAINT `lubrifiant_parc_parc_id_fkey` FOREIGN KEY (`parc_id`) REFERENCES `Parc`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lubrifiant_parc` ADD CONSTRAINT `lubrifiant_parc_lubrifiant_id_fkey` FOREIGN KEY (`lubrifiant_id`) REFERENCES `Lubrifiant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
