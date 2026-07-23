-- AlterTable
ALTER TABLE `borrowing` ADD COLUMN `lokasiPenggunaanId` INTEGER NULL,
    MODIFY `statusPeminjaman` VARCHAR(191) NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `user` ADD COLUMN `isVerified` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `verificationToken` VARCHAR(255) NULL,
    ADD COLUMN `verificationTokenExpiry` DATETIME(3) NULL;

-- AddForeignKey
ALTER TABLE `borrowing` ADD CONSTRAINT `borrowing_lokasiPenggunaanId_fkey` FOREIGN KEY (`lokasiPenggunaanId`) REFERENCES `location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
