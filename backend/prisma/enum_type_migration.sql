-- AlterTable
ALTER TABLE `hotel_room_details` MODIFY `bed_type` ENUM('Single', 'Double', 'Queen', 'King', 'Twin') NULL;

-- AlterTable
ALTER TABLE `hotel_rooms` MODIFY `room_type` ENUM('standard', 'delux', 'suite', 'penthouse') NOT NULL;

-- AlterTable
ALTER TABLE `hotels` MODIFY `hotel_type` ENUM('hotel', 'resort', 'boutique', 'hostel') NULL;
