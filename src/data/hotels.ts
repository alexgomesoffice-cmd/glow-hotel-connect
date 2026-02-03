import hotel1 from "@/assets/hotels/hotel-1.jpg";
import hotel2 from "@/assets/hotels/hotel-2.jpg";
import hotel3 from "@/assets/hotels/hotel-3.jpg";
import hotel4 from "@/assets/hotels/hotel-4.jpg";

export interface Room {
  id: number;
  name: string;
  description: string;
  price: number;
  capacity: number;
  beds: string;
  size: number;
  amenities: string[];
}

export interface Hotel {
  id: number;
  name: string;
  location: string;
  image: string;
  price: number;
  rating: number;
  reviews: number;
  tags: string[];
  description: string;
  amenities: string[];
  rooms: Room[];
}

export const hotels: Hotel[] = [
  {
    id: 1,
    name: "The Grand Palace Hotel",
    location: "London, UK",
    image: hotel1,
    price: 280,
    rating: 9.8,
    reviews: 2341,
    tags: ["Luxury", "Spa"],
    description: "Experience unparalleled luxury at The Grand Palace Hotel, a stunning five-star establishment in the heart of London. With breathtaking views of the city skyline, world-class dining, and an award-winning spa, every moment here is designed for indulgence.",
    amenities: ["Free WiFi", "Spa & Wellness", "Fine Dining", "Concierge", "Gym", "Room Service", "Airport Transfer", "Valet Parking"],
    rooms: [
      {
        id: 101,
        name: "Deluxe King Room",
        description: "Spacious room with king-size bed and city views",
        price: 280,
        capacity: 2,
        beds: "1 King Bed",
        size: 35,
        amenities: ["City View", "Mini Bar", "Smart TV", "Rain Shower"]
      },
      {
        id: 102,
        name: "Executive Suite",
        description: "Elegant suite with separate living area and panoramic views",
        price: 450,
        capacity: 3,
        beds: "1 King Bed + Sofa Bed",
        size: 55,
        amenities: ["Panoramic View", "Living Room", "Jacuzzi", "Butler Service"]
      },
      {
        id: 103,
        name: "Royal Penthouse",
        description: "Ultimate luxury with private terrace and butler service",
        price: 1200,
        capacity: 4,
        beds: "2 King Beds",
        size: 120,
        amenities: ["Private Terrace", "Private Pool", "Personal Chef", "24/7 Butler"]
      }
    ]
  },
  {
    id: 2,
    name: "Ocean View Resort",
    location: "Barcelona, Spain",
    image: hotel2,
    price: 195,
    rating: 9.5,
    reviews: 1856,
    tags: ["Beach", "Pool"],
    description: "Nestled along the stunning Mediterranean coast, Ocean View Resort offers the perfect blend of relaxation and adventure. Wake up to the sound of waves, spend your days by our infinity pool, and savor authentic Spanish cuisine as the sun sets over the sea.",
    amenities: ["Beachfront", "Infinity Pool", "Beach Bar", "Water Sports", "Spa", "Kids Club", "Tennis Court", "Free Parking"],
    rooms: [
      {
        id: 201,
        name: "Sea View Room",
        description: "Comfortable room with stunning Mediterranean views",
        price: 195,
        capacity: 2,
        beds: "1 Queen Bed",
        size: 30,
        amenities: ["Sea View", "Balcony", "Air Conditioning", "Mini Fridge"]
      },
      {
        id: 202,
        name: "Family Suite",
        description: "Perfect for families with separate kids area",
        price: 320,
        capacity: 4,
        beds: "1 King + 2 Twin Beds",
        size: 60,
        amenities: ["2 Bedrooms", "Kids Corner", "Game Console", "Kitchenette"]
      },
      {
        id: 203,
        name: "Beachfront Villa",
        description: "Private villa steps from the beach",
        price: 650,
        capacity: 6,
        beds: "3 King Beds",
        size: 150,
        amenities: ["Private Beach Access", "Private Pool", "BBQ Area", "Garden"]
      }
    ]
  },
  {
    id: 3,
    name: "Nordic Forest Lodge",
    location: "Stockholm, Sweden",
    image: hotel3,
    price: 165,
    rating: 9.6,
    reviews: 1234,
    tags: ["Nature", "Cozy"],
    description: "Escape to the tranquility of Nordic Forest Lodge, where modern Scandinavian design meets pristine nature. Surrounded by ancient forests and crystal-clear lakes, this eco-friendly retreat offers the ultimate peaceful getaway with sustainable luxury.",
    amenities: ["Forest View", "Sauna", "Hiking Trails", "Organic Restaurant", "Yoga Classes", "Fireplace", "Bike Rental", "Wildlife Tours"],
    rooms: [
      {
        id: 301,
        name: "Forest Cabin",
        description: "Cozy cabin with floor-to-ceiling forest views",
        price: 165,
        capacity: 2,
        beds: "1 Queen Bed",
        size: 28,
        amenities: ["Forest View", "Fireplace", "Heated Floors", "Rain Shower"]
      },
      {
        id: 302,
        name: "Lakeside Suite",
        description: "Serene suite overlooking the private lake",
        price: 280,
        capacity: 2,
        beds: "1 King Bed",
        size: 45,
        amenities: ["Lake View", "Private Sauna", "Deck", "Hot Tub"]
      },
      {
        id: 303,
        name: "Treehouse Retreat",
        description: "Unique elevated experience among the treetops",
        price: 420,
        capacity: 2,
        beds: "1 King Bed",
        size: 40,
        amenities: ["360° Views", "Glass Floor Panels", "Private Deck", "Telescope"]
      }
    ]
  },
  {
    id: 4,
    name: "Tropical Paradise Villa",
    location: "Bali, Indonesia",
    image: hotel4,
    price: 320,
    rating: 9.9,
    reviews: 987,
    tags: ["Villa", "Private Pool"],
    description: "Discover your own slice of paradise at Tropical Paradise Villa, where Balinese tradition meets contemporary luxury. Each villa features a private infinity pool, traditional open-air living spaces, and breathtaking views of rice terraces and the ocean beyond.",
    amenities: ["Private Pool", "Spa", "Yoga Pavilion", "Butler Service", "Temple Tours", "Cooking Class", "Sunset Bar", "Private Beach"],
    rooms: [
      {
        id: 401,
        name: "Garden Pool Villa",
        description: "Private villa with lush tropical garden and pool",
        price: 320,
        capacity: 2,
        beds: "1 King Bed",
        size: 80,
        amenities: ["Private Pool", "Outdoor Shower", "Garden", "Day Bed"]
      },
      {
        id: 402,
        name: "Ocean View Pool Villa",
        description: "Elevated villa with infinity pool and ocean views",
        price: 480,
        capacity: 2,
        beds: "1 King Bed",
        size: 100,
        amenities: ["Infinity Pool", "Ocean View", "Sunken Living", "In-Villa Spa"]
      },
      {
        id: 403,
        name: "Royal Estate",
        description: "Ultimate Balinese luxury with multiple pavilions",
        price: 1500,
        capacity: 8,
        beds: "4 King Beds",
        size: 500,
        amenities: ["4 Pools", "Private Chef", "Staff", "Cinema Room", "Gym"]
      }
    ]
  }
];

export const getHotelById = (id: number): Hotel | undefined => {
  return hotels.find(hotel => hotel.id === id);
};
