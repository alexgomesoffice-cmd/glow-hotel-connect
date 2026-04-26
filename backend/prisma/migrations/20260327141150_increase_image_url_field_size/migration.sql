/*
  Warnings:

  - You are about to drop the column `approval_status` on the `hotel_rooms` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `hotel_room_images` MODIFY `image_url` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `hotel_rooms` DROP COLUMN `approval_status`;
