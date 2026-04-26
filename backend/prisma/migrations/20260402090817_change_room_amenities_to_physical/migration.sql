/*
  Warnings:

  - You are about to drop the column `hotel_room_id` on the `room_amenities` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[hotel_room_details_id,amenity_id]` on the table `room_amenities` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hotel_room_details_id` to the `room_amenities` table without a default value. This is not possible if the table is not empty.

*/
-- Add the new column as nullable first
ALTER TABLE `room_amenities` ADD COLUMN `hotel_room_details_id` INTEGER NULL;

-- Populate the new column: for each room_amenities record, find the first physical room of that room type
UPDATE `room_amenities` ra
SET `hotel_room_details_id` = (
  SELECT hrd.hotel_room_details_id
  FROM hotel_room_details hrd
  WHERE hrd.hotel_rooms_id = ra.hotel_room_id
  LIMIT 1
);

-- DropForeignKey
ALTER TABLE `room_amenities` DROP FOREIGN KEY `room_amenities_hotel_room_id_fkey`;

-- DropIndex
DROP INDEX `room_amenities_hotel_room_id_amenity_id_key` ON `room_amenities`;

-- DropIndex
DROP INDEX `room_amenities_hotel_room_id_idx` ON `room_amenities`;

-- AlterTable
ALTER TABLE `room_amenities` DROP COLUMN `hotel_room_id`,
    MODIFY COLUMN `hotel_room_details_id` INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX `room_amenities_hotel_room_details_id_idx` ON `room_amenities`(`hotel_room_details_id`);

-- CreateIndex
CREATE UNIQUE INDEX `room_amenities_hotel_room_details_id_amenity_id_key` ON `room_amenities`(`hotel_room_details_id`, `amenity_id`);

-- AddForeignKey
ALTER TABLE `room_amenities` ADD CONSTRAINT `room_amenities_hotel_room_details_id_fkey` FOREIGN KEY (`hotel_room_details_id`) REFERENCES `hotel_room_details`(`hotel_room_details_id`) ON DELETE CASCADE ON UPDATE CASCADE;
