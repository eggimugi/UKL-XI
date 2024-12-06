/*
  Warnings:

  - A unique constraint covering the columns `[borrow_id]` on the table `returnBorrow` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `returnborrow` ADD COLUMN `item_id` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `user_id` INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX `returnBorrow_borrow_id_key` ON `returnBorrow`(`borrow_id`);

-- AddForeignKey
ALTER TABLE `returnBorrow` ADD CONSTRAINT `returnBorrow_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `returnBorrow` ADD CONSTRAINT `returnBorrow_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `inventory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
