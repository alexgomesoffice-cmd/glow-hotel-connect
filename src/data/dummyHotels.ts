/**
 * ─────────────────────────────────────────────────────────────
 *  DUMMY HOTEL DATA  (fake data — not from backend)
 * ─────────────────────────────────────────────────────────────
 * Used as a fallback when the live backend (VITE_API_URL) is
 * unreachable, so the Featured Hotels section, hotel listing
 * cards and detail pages stay populated during development/demo.
 *
 * Shape mirrors the Prisma schema:
 *   hotels -> hotel_types, cities, hotel_details, hotel_images,
 *   hotel_amenities -> amenities, room_types (base_price) ->
 *   room_details (bed_type) + room_amenities.
 * ─────────────────────────────────────────────────────────────
 */

import type { PublicHotel } from "@/services/publicHotelApi";

// Dummy data — replace with live backend response in production.
export const DUMMY_PUBLIC_HOTELS: PublicHotel[] = [
  {
    hotel_id: 1,
    name: "Sea Pearl Beach Resort & Spa",
    city: "Cox's Bazar",
    address: "Inani Beach, Jaliapalong, Cox's Bazar",
    hotel_type: "Resort",
    hotel_images: [
      { image_url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200", is_cover: true },
      { image_url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200" },
      { image_url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200" },
    ],
    hotel_details: {
      star_rating: 5,
      description:
        "An award-winning beachfront resort on the world's longest sea beach, featuring an infinity pool, full-service spa, and panoramic Bay of Bengal views.",
    },
    hotel_amenities: [
      { amenity: { name: "Free WiFi" } },
      { amenity: { name: "Infinity Pool" } },
      { amenity: { name: "Spa & Wellness" } },
      { amenity: { name: "Beachfront" } },
      { amenity: { name: "Restaurant" } },
      { amenity: { name: "Free Parking" } },
    ],
    hotel_rooms: [
      {
        base_price: 12000,
        room_type: "Deluxe Sea View",
        hotel_room_details: [
          { bed_type: "King", room_amenities: [{ amenity: { name: "Balcony" } }, { amenity: { name: "Air Conditioning" } }] },
        ],
      },
      {
        base_price: 18000,
        room_type: "Premier Suite",
        hotel_room_details: [{ bed_type: "King", room_amenities: [{ amenity: { name: "Living Area" } }] }],
      },
      {
        base_price: 9000,
        room_type: "Superior Room",
        hotel_room_details: [{ bed_type: "Twin", room_amenities: [{ amenity: { name: "Air Conditioning" } }] }],
      },
    ],
  },
  {
    hotel_id: 2,
    name: "Pan Pacific Sonargaon Dhaka",
    city: "Dhaka",
    address: "107 Kazi Nazrul Islam Avenue, Dhaka",
    hotel_type: "Hotel",
    hotel_images: [
      { image_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200", is_cover: true },
      { image_url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200" },
      { image_url: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200" },
    ],
    hotel_details: {
      star_rating: 5,
      description:
        "A landmark five-star hotel in the heart of Dhaka offering refined rooms, multiple dining venues, an outdoor pool, and a world-class fitness center.",
    },
    hotel_amenities: [
      { amenity: { name: "Free WiFi" } },
      { amenity: { name: "Outdoor Pool" } },
      { amenity: { name: "Fitness Center" } },
      { amenity: { name: "Business Center" } },
      { amenity: { name: "Airport Shuttle" } },
      { amenity: { name: "Restaurant" } },
    ],
    hotel_rooms: [
      {
        base_price: 15000,
        room_type: "Superior Room",
        hotel_room_details: [{ bed_type: "Queen", room_amenities: [{ amenity: { name: "City View" } }] }],
      },
      {
        base_price: 22000,
        room_type: "Executive Suite",
        hotel_room_details: [{ bed_type: "King", room_amenities: [{ amenity: { name: "Lounge Access" } }] }],
      },
    ],
  },
  {
    hotel_id: 3,
    name: "Grand Sylhet Hotel & Resort",
    city: "Sylhet",
    address: "Airport Road, Khadimnagar, Sylhet",
    hotel_type: "Resort",
    hotel_images: [
      { image_url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200", is_cover: true },
      { image_url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200" },
      { image_url: "https://images.unsplash.com/photo-1455587734955-081b22074882?w=1200" },
    ],
    hotel_details: {
      star_rating: 4.5,
      description:
        "Set amid rolling tea gardens, this serene resort blends colonial charm with modern comfort, ideal for a relaxing escape in nature.",
    },
    hotel_amenities: [
      { amenity: { name: "Free WiFi" } },
      { amenity: { name: "Garden" } },
      { amenity: { name: "Restaurant" } },
      { amenity: { name: "Spa & Wellness" } },
      { amenity: { name: "Free Parking" } },
    ],
    hotel_rooms: [
      {
        base_price: 8500,
        room_type: "Garden View Room",
        hotel_room_details: [{ bed_type: "Queen", room_amenities: [{ amenity: { name: "Garden View" } }] }],
      },
      {
        base_price: 14000,
        room_type: "Tea Garden Villa",
        hotel_room_details: [{ bed_type: "King", room_amenities: [{ amenity: { name: "Private Terrace" } }] }],
      },
    ],
  },
  {
    hotel_id: 4,
    name: "Hotel Agrabad Chattogram",
    city: "Chattogram",
    address: "Agrabad Commercial Area, Chattogram",
    hotel_type: "Hotel",
    hotel_images: [
      { image_url: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200", is_cover: true },
      { image_url: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200" },
      { image_url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200" },
    ],
    hotel_details: {
      star_rating: 4,
      description:
        "A trusted business hotel in Chattogram's commercial hub with spacious rooms, conference facilities, and easy access to the port and airport.",
    },
    hotel_amenities: [
      { amenity: { name: "Free WiFi" } },
      { amenity: { name: "Business Center" } },
      { amenity: { name: "Restaurant" } },
      { amenity: { name: "Room Service" } },
      { amenity: { name: "Free Parking" } },
    ],
    hotel_rooms: [
      {
        base_price: 6500,
        room_type: "Standard Room",
        hotel_room_details: [{ bed_type: "Twin", room_amenities: [{ amenity: { name: "Air Conditioning" } }] }],
      },
      {
        base_price: 10500,
        room_type: "Deluxe Room",
        hotel_room_details: [{ bed_type: "Queen", room_amenities: [{ amenity: { name: "City View" } }] }],
      },
    ],
  },
  {
    hotel_id: 5,
    name: "Sajek Cloud Resort",
    city: "Rangamati",
    address: "Sajek Valley, Baghaichhari, Rangamati",
    hotel_type: "Boutique",
    hotel_images: [
      { image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200", is_cover: true },
      { image_url: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1200" },
      { image_url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200" },
    ],
    hotel_details: {
      star_rating: 4.3,
      description:
        "A boutique hilltop retreat above the clouds in Sajek Valley, offering cozy cottages, breathtaking sunrise views, and authentic local cuisine.",
    },
    hotel_amenities: [
      { amenity: { name: "Mountain View" } },
      { amenity: { name: "Restaurant" } },
      { amenity: { name: "Bonfire" } },
      { amenity: { name: "Free Parking" } },
    ],
    hotel_rooms: [
      {
        base_price: 5500,
        room_type: "Valley View Cottage",
        hotel_room_details: [{ bed_type: "Double", room_amenities: [{ amenity: { name: "Balcony" } }] }],
      },
      {
        base_price: 7500,
        room_type: "Couple Cottage",
        hotel_room_details: [{ bed_type: "Queen", room_amenities: [{ amenity: { name: "Private Deck" } }] }],
      },
    ],
  },
  {
    hotel_id: 6,
    name: "Bagerhat Heritage Guest House",
    city: "Bagerhat",
    address: "Near Sixty Dome Mosque, Bagerhat",
    hotel_type: "Guest House",
    hotel_images: [
      { image_url: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200", is_cover: true },
      { image_url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200" },
      { image_url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200" },
    ],
    hotel_details: {
      star_rating: 3.8,
      description:
        "A charming, budget-friendly guest house steps from the UNESCO World Heritage Sixty Dome Mosque, with warm hospitality and home-style meals.",
    },
    hotel_amenities: [
      { amenity: { name: "Free WiFi" } },
      { amenity: { name: "Restaurant" } },
      { amenity: { name: "Free Parking" } },
      { amenity: { name: "Room Service" } },
    ],
    hotel_rooms: [
      {
        base_price: 3000,
        room_type: "Standard Room",
        hotel_room_details: [{ bed_type: "Double", room_amenities: [{ amenity: { name: "Air Conditioning" } }] }],
      },
      {
        base_price: 4500,
        room_type: "Family Room",
        hotel_room_details: [{ bed_type: "Twin", room_amenities: [{ amenity: { name: "Extra Bed" } }] }],
      },
    ],
  },
  {
    hotel_id: 7,
    name: "Saint Martin Blue Lagoon Resort",
    city: "Cox's Bazar",
    address: "West Beach, Saint Martin's Island, Cox's Bazar",
    hotel_type: "Resort",
    hotel_images: [
      { image_url: "https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=1200", is_cover: true },
      { image_url: "https://images.unsplash.com/photo-1439130490301-25e322d88054?w=1200" },
      { image_url: "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=1200" },
    ],
    hotel_details: {
      star_rating: 4.6,
      description:
        "An idyllic island resort surrounded by turquoise waters and coral reefs, perfect for snorkeling, seafood feasts, and unforgettable sunsets.",
    },
    hotel_amenities: [
      { amenity: { name: "Beachfront" } },
      { amenity: { name: "Free WiFi" } },
      { amenity: { name: "Restaurant" } },
      { amenity: { name: "Water Sports" } },
      { amenity: { name: "Bar" } },
    ],
    hotel_rooms: [
      {
        base_price: 7000,
        room_type: "Beach Hut",
        hotel_room_details: [{ bed_type: "Double", room_amenities: [{ amenity: { name: "Sea View" } }] }],
      },
      {
        base_price: 11000,
        room_type: "Premium Sea View",
        hotel_room_details: [{ bed_type: "King", room_amenities: [{ amenity: { name: "Private Balcony" } }] }],
      },
    ],
  },
  {
    hotel_id: 8,
    name: "Dhaka City Serviced Apartments",
    city: "Dhaka",
    address: "Gulshan-2, Dhaka",
    hotel_type: "Serviced Apartment",
    hotel_images: [
      { image_url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200", is_cover: true },
      { image_url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200" },
      { image_url: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1200" },
    ],
    hotel_details: {
      star_rating: 4.2,
      description:
        "Modern fully-furnished serviced apartments in upscale Gulshan, ideal for long stays with kitchenettes, housekeeping, and a rooftop lounge.",
    },
    hotel_amenities: [
      { amenity: { name: "Free WiFi" } },
      { amenity: { name: "Kitchenette" } },
      { amenity: { name: "Fitness Center" } },
      { amenity: { name: "Housekeeping" } },
      { amenity: { name: "Free Parking" } },
    ],
    hotel_rooms: [
      {
        base_price: 9500,
        room_type: "One-Bedroom Apartment",
        hotel_room_details: [{ bed_type: "Queen", room_amenities: [{ amenity: { name: "Kitchenette" } }] }],
      },
      {
        base_price: 14500,
        room_type: "Two-Bedroom Apartment",
        hotel_room_details: [{ bed_type: "King", room_amenities: [{ amenity: { name: "Living Room" } }] }],
      },
    ],
  },
];
