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
