/*
  Warnings:

  - The primary key for the `borrow` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `actual_return_date` on the `borrow` table. All the data in the column will be lost.
  - You are about to drop the column `borrow_id` on the `borrow` table. All the data in the column will be lost.
  - Added the required column `id` to the `borrow` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `borrow` DROP PRIMARY KEY,
    DROP COLUMN `actual_return_date`,
    DROP COLUMN `borrow_id`,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- CreateTable
CREATE TABLE `returnBorrow` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `borrow_id` INTEGER NOT NULL DEFAULT 0,
    `actual_return_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `returnBorrow` ADD CONSTRAINT `returnBorrow_borrow_id_fkey` FOREIGN KEY (`borrow_id`) REFERENCES `borrow`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
