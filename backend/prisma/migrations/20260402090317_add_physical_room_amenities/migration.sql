/*
  Warnings:

  - You are about to alter the column `bed_type` on the `hotel_room_details` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `Enum(EnumId(4))`.
  - You are about to alter the column `room_type` on the `hotel_rooms` table. The data in that column could be lost. The data in that column will be cast from `VarChar(150)` to `Enum(EnumId(3))`.
  - You are about to alter the column `hotel_type` on the `hotels` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `hotel_room_details` MODIFY `bed_type` ENUM('Single', 'Double', 'Queen', 'King', 'Twin') NULL;

-- AlterTable
ALTER TABLE `hotel_rooms` MODIFY `room_type` ENUM('standard', 'delux', 'suite', 'penthouse') NOT NULL;

-- AlterTable
ALTER TABLE `hotels` MODIFY `hotel_type` ENUM('hotel', 'resort', 'boutique', 'hostel') NULL;
