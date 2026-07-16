/*
  Warnings:

  - The values [RUSAK_RINGAN,RUSAK_BERAT] on the enum `borrowing_kondisiKembali` will be removed. If these variants are still used in the database, this will fail.
  - The values [RUSAK_RINGAN,RUSAK_BERAT] on the enum `borrowing_kondisiKembali` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `asset` ADD COLUMN `lokasiAlokasiId` INTEGER NULL,
    MODIFY `kondisi` ENUM('BAIK', 'RUSAK') NOT NULL DEFAULT 'BAIK',
    MODIFY `statusKetersediaan` ENUM('TERSEDIA', 'DIPINJAM', 'PEMELIHARAAN', 'DIALOKASIKAN') NOT NULL DEFAULT 'TERSEDIA';

-- AlterTable
ALTER TABLE `borrowing` MODIFY `kondisiKembali` ENUM('BAIK', 'RUSAK') NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `resetToken` VARCHAR(255) NULL,
    ADD COLUMN `resetTokenExpiry` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `allocation_history` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assetId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `jenisKejadian` ENUM('ALOKASI', 'RELOKASI', 'MASUK_SERVIS', 'SELESAI_SERVIS') NOT NULL,
    `lokasiAsalId` INTEGER NULL,
    `lokasiTujuanId` INTEGER NULL,
    `catatan` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `asset` ADD CONSTRAINT `asset_lokasiAlokasiId_fkey` FOREIGN KEY (`lokasiAlokasiId`) REFERENCES `location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `allocation_history` ADD CONSTRAINT `allocation_history_assetId_fkey` FOREIGN KEY (`assetId`) REFERENCES `asset`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `allocation_history` ADD CONSTRAINT `allocation_history_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `allocation_history` ADD CONSTRAINT `allocation_history_lokasiAsalId_fkey` FOREIGN KEY (`lokasiAsalId`) REFERENCES `location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `allocation_history` ADD CONSTRAINT `allocation_history_lokasiTujuanId_fkey` FOREIGN KEY (`lokasiTujuanId`) REFERENCES `location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
