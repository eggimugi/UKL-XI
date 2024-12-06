-- DropIndex
DROP INDEX `returnBorrow_borrow_id_key` ON `returnborrow`;

-- AlterTable
ALTER TABLE `returnborrow` MODIFY `borrow_id` INTEGER NOT NULL DEFAULT 0;
