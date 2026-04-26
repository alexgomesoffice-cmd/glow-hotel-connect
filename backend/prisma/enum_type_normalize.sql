-- Normalize existing data into the new enum values before altering column types.
-- Hotel type canonical values: hotel, resort, boutique, hostel
UPDATE `hotels`
SET `hotel_type` = 'hotel'
WHERE `hotel_type` IN ('5-Star Luxury');

UPDATE `hotels`
SET `hotel_type` = NULL
WHERE `hotel_type` IS NOT NULL
  AND `hotel_type` NOT IN ('hotel', 'resort', 'boutique', 'hostel');

-- Room type canonical values: standard, delux, suite, penthouse
UPDATE `hotel_rooms`
SET `room_type` = 'standard'
WHERE `room_type` IN ('Standard Single', 'Standard', 'Economy Twin');

UPDATE `hotel_rooms`
SET `room_type` = 'delux'
WHERE `room_type` IN ('Deluxe Double', 'Deluxe');

UPDATE `hotel_rooms`
SET `room_type` = 'suite'
WHERE `room_type` IN ('Suite Luxury');

UPDATE `hotel_rooms`
SET `room_type` = 'standard'
WHERE `room_type` NOT IN ('standard', 'delux', 'suite', 'penthouse');

-- Bed type canonical values: Single, Double, Queen, King, Twin
UPDATE `hotel_room_details`
SET `bed_type` = NULL
WHERE `bed_type` IS NOT NULL
  AND `bed_type` NOT IN ('Single', 'Double', 'Queen', 'King', 'Twin');

