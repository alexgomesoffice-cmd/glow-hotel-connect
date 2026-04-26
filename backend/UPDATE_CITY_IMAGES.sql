-- SQL script to update city images with local file paths
-- Run this in your MySQL database client

UPDATE cities SET image_url = 'Cities/dhaka.png' WHERE name = 'Dhaka';
UPDATE cities SET image_url = 'Cities/chittagong.png' WHERE name = 'Chittagong';
UPDATE cities SET image_url = 'Cities/khulna.png' WHERE name = 'Khulna';
UPDATE cities SET image_url = 'Cities/rajshahi.png' WHERE name = 'Rajshahi';
UPDATE cities SET image_url = 'Cities/sylhet.png' WHERE name = 'Sylhet';
UPDATE cities SET image_url = 'Cities/rangpur.png' WHERE name = 'Rangpur';
UPDATE cities SET image_url = 'Cities/barishal.png' WHERE name = 'Barisal';
UPDATE cities SET image_url = 'Cities/mym.png' WHERE name = 'Mymensingh';

-- Verify the updates:
SELECT name, image_url FROM cities;
