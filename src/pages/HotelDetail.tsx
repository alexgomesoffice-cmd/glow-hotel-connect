import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { format, addDays, differenceInDays } from "date-fns";
import { 
  Star, 
  MapPin, 
  Heart, 
  ArrowLeft, 
  Users, 
  Bed, 
  Maximize, 
  Check, 
  Calendar,
  Wifi,
  Car,
  Dumbbell,
  UtensilsCrossed,
  Sparkles,
  Shield,
  Clock,
  ChevronRight,
  ChevronDown,
  Share2,
  Image as ImageIcon,
  Loader,
  Cigarette,
  PawPrint
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingConfirmation from "@/components/BookingConfirmation";
import { cn } from "@/lib/utils";
import { apiGet } from "@/utils/api";
import { getLoggedInUser } from "@/utils/auth";
import RoomDetailModal from "@/components/RoomDetailModal";

interface HotelImage {
  image_url: string;
  is_cover: boolean;
}

interface HotelDetails {
  star_rating?: string | number;
  description?: string;
}

interface Amenity {
  id?: number;
  name: string;
}

interface BackendHotelAmenity {
  amenity: Amenity;
}

interface BackendHotel {
  hotel_id: number;
  name: string;
  city: string;
  hotel_type: string;
  email: string;
  approval_status: string;
  created_at: string;
  hotel_details?: HotelDetails;
  hotel_images?: HotelImage[];
  hotel_amenities?: BackendHotelAmenity[];
}

interface BackendRoomType {
  hotel_room_id: number;
  room_type: string;
  base_price: number | string;
  description?: string;
  room_size?: string;
  hotel_room_images?: Array<{
    image_url: string;
    is_cover: boolean;
  }>;
  room_amenities?: Array<{
    amenity: {
      id?: number;
      name: string;
    };
  }>;
  hotel_room_details?: Array<{
    hotel_room_details_id: number;
    room_number: string;
    room_size?: string;
    bed_type: string;
    max_occupancy: number;
    smoking_allowed: boolean;
    pet_allowed: boolean;
    status: string;
    created_at: string;
    updated_at: string;
    room_amenities?: Array<{
      amenity: {
        name: string;
      };
    }>;
  }>;
}

interface RoomVariation {
  bed_type: string;
  max_occupancy: number;
  smoking_allowed: boolean;
  pet_allowed: boolean;
  status: string;
  available_count: number;
  room_details_ids: number[];
  images?: string[];
  amenities?: string[];
  price_modifier?: number; // additional price on top of base
  meal_plan?: string;
  refund_policy?: string;
}

interface Room {
  id: number;
  name: string;
  description: string;
  price: number;
  capacity: number;
  beds: string;
  size: number;
  amenities: string[];
  image?: string | null;
  variations?: RoomVariation[];
}

interface Hotel {
  id: number;
  name: string;
  location: string;
  image: string;
  price: number;
  rating: number;
  reviews: number;
  tags: string[];
  description: string;
  hotelImages?: string[];
  amenities: string[];
  rooms: Room[];
}

const amenityIcons: Record<string, typeof Wifi> = {
  "Free WiFi": Wifi,
  "Free Wi-Fi": Wifi,
  "Gym": Dumbbell,
  "Gym / Fitness Center": Dumbbell,
  "Valet Parking": Car,
  "Parking": Car,
  "Fine Dining": UtensilsCrossed,
  "Restaurant": UtensilsCrossed,
  "Free Parking": Car,
};

// ============================================================
// DUMMY / FALLBACK DATA — shown when the backend API is unavailable
// Based on the project's Prisma seed script structure
// ============================================================
const DUMMY_HOTEL: Hotel = {
  id: 1,
  name: "Grand Stay Hotel",
  location: "Dhaka",
  image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
  price: 95,
  rating: 4.8,
  reviews: 234,
  tags: ["Hotel", "Luxury"],
  description: "A luxury 5-star hotel in the heart of Dhaka with world-class amenities. Experience unmatched comfort with our premium facilities, attentive service, and prime location near key attractions.",
  hotelImages: [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
    "https://images.unsplash.com/photo-1590490360182-c33d955f4e24?w=800",
    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800",
  ],
  amenities: [
    "Swimming Pool", "Gym / Fitness Center", "Free Wi-Fi", "Parking",
    "Restaurant", "Bar / Lounge", "Spa & Wellness", "Room Service",
    "24/7 Front Desk", "Laundry Service", "Airport Shuttle", "Elevator",
  ],
  rooms: [
    {
      id: 1,
      name: "Deluxe Room",
      description: "Spacious room with queen bed and city view",
      price: 150.50,
      capacity: 2,
      beds: "Queen",
      size: 35,
      amenities: ["Free Wi-Fi", "Room Service", "Mini Bar", "City View", "Private Bathroom"],
      image: null,
      variations: [
        { room_details_ids: [1], available_count: 1, bed_type: "Queen", max_occupancy: 2, smoking_allowed: true, pet_allowed: false, status: "AVAILABLE", images: ["https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600"], amenities: ["Free Wi-Fi", "Room Service", "Mini Bar", "Bathrobe", "Safe"], price_modifier: 0, meal_plan: "Room only", refund_policy: "Non-refundable" },
        { room_details_ids: [2], available_count: 1, bed_type: "Queen", max_occupancy: 2, smoking_allowed: false, pet_allowed: true, status: "AVAILABLE", images: ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600", "https://images.unsplash.com/photo-1590490360182-c33d955f4e24?w=600"], amenities: ["Free Wi-Fi", "Room Service", "Mini Bar", "Bathrobe"], price_modifier: 10, meal_plan: "Continental breakfast included", refund_policy: "Partially refundable" },
        { room_details_ids: [3], available_count: 1, bed_type: "Queen", max_occupancy: 2, smoking_allowed: false, pet_allowed: false, status: "UNAVAILABLE", images: ["https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600"], amenities: ["Free Wi-Fi", "Room Service"], price_modifier: 20, meal_plan: "Breakfast & dinner included", refund_policy: "Partially refundable" },
        { room_details_ids: [4], available_count: 1, bed_type: "King", max_occupancy: 2, smoking_allowed: true, pet_allowed: true, status: "AVAILABLE", images: ["https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600", "https://images.unsplash.com/photo-1590490360182-c33d955f4e24?w=600"], amenities: ["Free Wi-Fi", "Room Service", "Mini Bar", "Jacuzzi", "Bathrobe", "Safe"], price_modifier: 45, meal_plan: "All inclusive", refund_policy: "Free cancellation" },
      ],
    },
    {
      id: 2,
      name: "Standard Room",
      description: "Compact room, perfect for business travelers",
      price: 95,
      capacity: 2,
      beds: "Queen",
      size: 25,
      amenities: ["Free Wi-Fi", "Work Desk"],
      image: null,
      variations: [
        { room_details_ids: [6], available_count: 1, bed_type: "Queen", max_occupancy: 2, smoking_allowed: false, pet_allowed: false, status: "AVAILABLE", images: ["https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=600"], amenities: ["Free Wi-Fi", "Work Desk", "TV"], price_modifier: 0, meal_plan: "Room only", refund_policy: "Non-refundable" },
        { room_details_ids: [7], available_count: 1, bed_type: "Twin", max_occupancy: 2, smoking_allowed: true, pet_allowed: false, status: "AVAILABLE", images: ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600", "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=600"], amenities: ["Free Wi-Fi", "Work Desk", "TV", "Mini Bar"], price_modifier: 15, meal_plan: "Continental breakfast included", refund_policy: "Partially refundable" },
        { room_details_ids: [8], available_count: 1, bed_type: "Queen", max_occupancy: 2, smoking_allowed: false, pet_allowed: true, status: "AVAILABLE", images: ["https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600"], amenities: ["Free Wi-Fi", "Work Desk"], price_modifier: 25, meal_plan: "Breakfast & dinner included", refund_policy: "Free cancellation" },
      ],
    },
    {
      id: 3,
      name: "Suite",
      description: "Premium suite with separate living area and marble bathroom",
      price: 299.99,
      capacity: 4,
      beds: "King",
      size: 65,
      amenities: ["Free Wi-Fi", "Living Area", "Mini Bar", "Jacuzzi", "Room Service", "Bathrobe"],
      image: null,
      variations: [
        { room_details_ids: [11], available_count: 1, bed_type: "King", max_occupancy: 4, smoking_allowed: false, pet_allowed: true, status: "AVAILABLE", images: ["https://images.unsplash.com/photo-1591088398332-8a7791972843?w=600", "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600"], amenities: ["Free Wi-Fi", "Living Area", "Mini Bar", "Jacuzzi", "Bathrobe", "Safe", "Room Service"], price_modifier: 0, meal_plan: "Continental breakfast included", refund_policy: "Partially refundable" },
        { room_details_ids: [12], available_count: 1, bed_type: "King", max_occupancy: 4, smoking_allowed: false, pet_allowed: false, status: "AVAILABLE", images: ["https://images.unsplash.com/photo-1591088398332-8a7791972843?w=600", "https://images.unsplash.com/photo-1590490360182-c33d955f4e24?w=600"], amenities: ["Free Wi-Fi", "Living Area", "Mini Bar", "Jacuzzi", "Bathrobe", "Safe", "Room Service", "Private Pool"], price_modifier: 50, meal_plan: "All inclusive", refund_policy: "Free cancellation" },
      ],
    },
    {
      id: 4,
      name: "Budget Room",
      description: "Budget-friendly room with essential amenities",
      price: 75,
      capacity: 2,
      beds: "Twin",
      size: 20,
      amenities: ["Free Wi-Fi"],
      image: null,
      variations: [
        { room_details_ids: [16], available_count: 1, bed_type: "Twin", max_occupancy: 2, smoking_allowed: false, pet_allowed: false, status: "AVAILABLE", images: ["https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=600"], amenities: ["Free Wi-Fi", "TV"], price_modifier: 0, meal_plan: "Room only", refund_policy: "Non-refundable" },
        { room_details_ids: [17], available_count: 1, bed_type: "Twin", max_occupancy: 2, smoking_allowed: false, pet_allowed: false, status: "AVAILABLE", images: ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600"], amenities: ["Free Wi-Fi", "TV", "Work Desk"], price_modifier: 10, meal_plan: "Continental breakfast included", refund_policy: "Partially refundable" },
        { room_details_ids: [18], available_count: 1, bed_type: "Single", max_occupancy: 1, smoking_allowed: true, pet_allowed: false, status: "AVAILABLE", images: ["https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=600"], amenities: ["Free Wi-Fi"], price_modifier: -10, meal_plan: "Room only", refund_policy: "Non-refundable" },
      ],
    },
  ],
};
// ============================================================

const HotelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [checkIn, setCheckIn] = useState<Date | undefined>(addDays(new Date(), 1));
  const [checkOut, setCheckOut] = useState<Date | undefined>(addDays(new Date(), 3));
  const [guests, setGuests] = useState(2);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRoomType, setExpandedRoomType] = useState<number | null>(null);
  const [variationImageIndices, setVariationImageIndices] = useState<Record<string, number>>({});
  const [selectedRoomCounts, setSelectedRoomCounts] = useState<Record<string, number>>({});
  const [filterAC, setFilterAC] = useState<'all' | 'ac' | 'non-ac'>('all');
  const [initialQueryApplied, setInitialQueryApplied] = useState(false);
  const [roomDetailModal, setRoomDetailModal] = useState<{ room: Room; variation: RoomVariation } | null>(null);
  const [availabilityByRoomId, setAvailabilityByRoomId] = useState<Record<number, { available: number; reserved: number; booked: number; total_inventory: number; base_price: number }>>({});
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const location = useLocation();

  const filteredRooms = useMemo(() => {
    if (filterAC === 'all') return hotel?.rooms || [];
    return (hotel?.rooms || []).filter(room => {
      if (!room.variations) return false;
      if (filterAC === 'ac') {
        // At least one variation has 'Air Conditioner' (not 'Non-Air Conditioner')
        return room.variations.some(variation =>
          variation.amenities?.some(amenity =>
            amenity.trim().toLowerCase() === 'air conditioner'
          )
        );
      } else if (filterAC === 'non-ac') {
        // At least one variation has 'Non-Air Conditioner'
        return room.variations.some(variation =>
          variation.amenities?.some(amenity =>
            amenity.trim().toLowerCase() === 'non-air conditioner'
          )
        );
      }
      return false;
    });
  }, [filterAC, hotel]);

  // Fetch hotel data from backend
  useEffect(() => {
    const fetchHotelData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!id) {
          setError("Hotel ID not found");
          setLoading(false);
          return;
        }

        // Fetch hotel details and room types in parallel
        const [hotelResponse, roomsResponse] = await Promise.all([
          apiGet(`/hotels/${id}`),
          apiGet(`/rooms?hotel_id=${id}&skip=0&take=100`)
        ]);
        
        if (hotelResponse.success && hotelResponse.data) {
          const backendHotel: BackendHotel = hotelResponse.data;
          
          // Get cover image or first image
          const getCoverImage = (): string => {
            const images = backendHotel.hotel_images || [];
            const coverImg = images.find(img => img.is_cover);
            if (coverImg) return coverImg.image_url;
            if (images.length > 0) return images[0].image_url;
            return "https://via.placeholder.com/400x300?text=Hotel+Image";
          };

          // Transform room types from backend
          const transformedRooms: Room[] = [];
          if (roomsResponse.success && roomsResponse.data?.rooms) {
            roomsResponse.data.rooms.forEach((backendRoom: BackendRoomType, index: number) => {
              // Get room cover image
              const roomImages = backendRoom.hotel_room_images || [];
              const coverRoomImg = roomImages.find(img => img.is_cover);
              const roomImageUrl = coverRoomImg?.image_url || (roomImages.length > 0 ? roomImages[0].image_url : null);

              // Group physical rooms by their variation properties
              const variationGroups: { [key: string]: RoomVariation } = {};
              
              if (backendRoom.hotel_room_details && backendRoom.hotel_room_details.length > 0) {
                backendRoom.hotel_room_details.forEach((detail) => {
                  // Create a unique key for this variation based on bed_type, max_occupancy, smoking_allowed, pet_allowed
                  const variationKey = `${detail.bed_type}-${detail.max_occupancy}-${detail.smoking_allowed}-${detail.pet_allowed}`;
                  
                  if (!variationGroups[variationKey]) {
                    variationGroups[variationKey] = {
                      bed_type: detail.bed_type,
                      max_occupancy: detail.max_occupancy,
                      smoking_allowed: detail.smoking_allowed,
                      pet_allowed: detail.pet_allowed,
                      status: detail.status,
                      available_count: 0,
                      room_details_ids: [],
                      images: roomImages.map(img => img.image_url), // Use room type images for variations
                      amenities: detail.room_amenities?.map(ra => ra.amenity.name) || [], // Get amenities from this physical room
                      price_modifier: 0, // Default, can be customized later
                      meal_plan: "Room only", // Default
                      refund_policy: "Non-refundable", // Default
                    };
                  }
                  
                  // Add this room to the variation group
                  variationGroups[variationKey].room_details_ids.push(detail.hotel_room_details_id);
                  
                  // Count available rooms
                  if (detail.status === "AVAILABLE") {
                    variationGroups[variationKey].available_count++;
                  }

                  // Merge amenities from this room (in case different rooms have different amenities)
                  const roomAmenities = detail.room_amenities?.map(ra => ra.amenity.name) || [];
                  variationGroups[variationKey].amenities = [...new Set([...variationGroups[variationKey].amenities, ...roomAmenities])];
                });
              }

              // Convert variation groups to array
              const variations: RoomVariation[] = Object.values(variationGroups);

              // Get common properties from the first variation or defaults
              const firstVariation = variations[0];
              const capacity = firstVariation?.max_occupancy || 2;
              const beds = firstVariation?.bed_type || "1 Queen Bed";
              const roomSize = backendRoom.room_size ? parseInt(backendRoom.room_size) : 30;

              const room: Room = {
                id: backendRoom.hotel_room_id,
                name: backendRoom.room_type,
                description: backendRoom.description || "",
                price: Number(backendRoom.base_price) || 150,
                capacity,
                beds,
                size: roomSize,
                amenities: firstVariation?.amenities || [], // Use amenities from the first variation
                image: roomImageUrl,
                variations: variations.length > 0 ? variations : undefined,
              };

              transformedRooms.push(room);
            });
          }

          // Never render dummy room types when the API returns none.
          const finalRooms = transformedRooms;

          // Get all hotel images - cover first, then rest
          const hotelImages = backendHotel.hotel_images || [];
          const coverImg = hotelImages.find(img => img.is_cover);
          const sortedImages = coverImg 
            ? [coverImg, ...hotelImages.filter(img => !img.is_cover)]
            : hotelImages;
          
          // Map image URLs
          const allImageUrls = sortedImages.map(img => img.image_url).slice(0, 4); // Limit to 4 images for gallery

          // Transform backend data to frontend Hotel interface
          const transformedHotel: Hotel = {
            id: backendHotel.hotel_id,
            name: backendHotel.name,
            location: backendHotel.city || "Location not specified",
            image: getCoverImage(),
            price: finalRooms.length > 0 ? Math.min(...finalRooms.map(r => r.price)) : 0,
            rating: backendHotel.hotel_details?.star_rating 
              ? Number(backendHotel.hotel_details.star_rating)
              : 4.5,
            reviews: 0,
            tags: [backendHotel.hotel_type || "Hotel"],
            description: backendHotel.hotel_details?.description || "A beautiful hotel property",
            amenities: backendHotel.hotel_amenities?.map(ha => ha.amenity.name) || ["Free WiFi", "Gym", "Free Parking"],
            rooms: finalRooms,
            hotelImages: allImageUrls // Store all images
          };

          setHotel(transformedHotel);
        } else {
          // Fallback to dummy data when API returns unsuccessful response
          console.warn("API returned unsuccessful response, using dummy data");
          setHotel(DUMMY_HOTEL);
        }
      } catch (err) {
        // Fallback to dummy data when backend is unreachable
        console.warn("Backend unreachable, using dummy data:", err);
        setHotel(DUMMY_HOTEL);
      } finally {
        setLoading(false);
      }
    };

    fetchHotelData();
  }, [id]);

  useEffect(() => {
    if (initialQueryApplied) return;
    const params = new URLSearchParams(location.search);
    let checkInParam = params.get("check_in") || params.get("checkIn");
    let checkOutParam = params.get("check_out") || params.get("checkOut");
    const guestsParam = Number(params.get("guests"));
    const roomsParam = Number(params.get("rooms"));

    if (!checkInParam || !checkOutParam) {
      const savedSearch = localStorage.getItem("hotelSearchState");
      if (savedSearch) {
        try {
          const saved = JSON.parse(savedSearch);
          checkInParam = checkInParam || saved.check_in;
          checkOutParam = checkOutParam || saved.check_out;
          if (!Number.isFinite(guestsParam) && Number.isFinite(saved.guests)) {
            if (saved.guests > 0) setGuests(saved.guests);
          }
        } catch {
          // ignore invalid saved state
        }
      }
    }

    if (checkInParam) {
      const parsed = new Date(checkInParam);
      if (!Number.isNaN(parsed.valueOf())) setCheckIn(parsed);
    }
    if (checkOutParam) {
      const parsed = new Date(checkOutParam);
      if (!Number.isNaN(parsed.valueOf())) setCheckOut(parsed);
    }
    if (Number.isFinite(guestsParam) && guestsParam > 0) setGuests(guestsParam);

    setInitialQueryApplied(true);
  }, [location.search, initialQueryApplied]);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!hotel || !hotel.id || !checkIn || !checkOut) return;
      if (checkOut <= checkIn) {
        setAvailabilityByRoomId({});
        setAvailabilityError('Please select a valid check-in and check-out range.');
        return;
      }
      setAvailabilityLoading(true);
      setAvailabilityError(null);

      try {
        const response = await apiGet(
          `/bookings/availability/${hotel.id}?check_in=${format(checkIn, 'yyyy-MM-dd')}&check_out=${format(checkOut, 'yyyy-MM-dd')}`
        );

        if (response.success && response.data?.rooms) {
          const mapped: Record<number, { available: number; reserved: number; booked: number; total_inventory: number; base_price: number }> = {};
          response.data.rooms.forEach((room: any) => {
            mapped[room.hotel_room_id] = {
              available: room.available,
              reserved: room.reserved,
              booked: room.booked,
              total_inventory: room.total_inventory,
              base_price: room.base_price,
            };
          });
          setAvailabilityByRoomId(mapped);
        } else {
          setAvailabilityByRoomId({});
          setAvailabilityError('Unable to load availability');
        }
      } catch (error: any) {
        console.error("Failed to fetch room availability:", error);
        setAvailabilityByRoomId({});
        setAvailabilityError(error?.message || "Availability lookup failed");
      } finally {
        setAvailabilityLoading(false);
      }
    };

    fetchAvailability();
  }, [hotel, checkIn, checkOut]);

  const buildVariationKey = (variation: RoomVariation) =>
    `${variation.bed_type}-${variation.max_occupancy}-${variation.smoking_allowed}-${variation.pet_allowed}`;

  const selectedRoomCountByRoomId = useMemo(() => {
    if (!hotel) return {} as Record<number, number>;

    const result: Record<number, number> = {};
    Object.entries(selectedRoomCounts).forEach(([variationKey, count]) => {
      if (count <= 0) return;
      hotel.rooms.forEach((room) => {
        room.variations?.forEach((variation) => {
          if (buildVariationKey(variation) === variationKey) {
            result[room.id] = (result[room.id] || 0) + count;
          }
        });
      });
    });
    return result;
  }, [selectedRoomCounts, hotel]);

  const selectedVariationEntries = useMemo(() => {
    if (!hotel) return [] as Array<{ variation: RoomVariation; count: number }>;

    return Object.entries(selectedRoomCounts).flatMap(([variationKey, count]) => {
      if (count <= 0) return [];

      return hotel.rooms.flatMap((room) =>
        room.variations?.filter((variation) => buildVariationKey(variation) === variationKey).map((variation) => ({ variation, count })) || []
      );
    });
  }, [selectedRoomCounts, hotel]);

  const selectedUnavailableRooms = useMemo(
    () => {
      if (!hotel) return false;

      const hasStaticUnavailable = selectedVariationEntries.some(
        ({ variation }) => variation.status !== "AVAILABLE" || variation.available_count <= 0
      );
      if (hasStaticUnavailable) return true;

      return Object.entries(selectedRoomCountByRoomId).some(([roomIdStr, count]) => {
        const roomId = Number(roomIdStr);
        const availability = availabilityByRoomId[roomId];
        if (availability) {
          return count > availability.available;
        }
        return false;
      });
    },
    [selectedVariationEntries, selectedRoomCountByRoomId, availabilityByRoomId, hotel]
  );

  // Calculate pricing
  const nights = useMemo(() => {
    if (checkIn && checkOut) {
      return differenceInDays(checkOut, checkIn);
    }
    return 1;
  }, [checkIn, checkOut]);

  const invalidDateRange = useMemo(
    () => checkIn && checkOut ? checkOut <= checkIn : false,
    [checkIn, checkOut]
  );

  const hasSelectedRooms = Object.entries(selectedRoomCounts).some(([, count]) => count > 0);
  const canReserve = hasSelectedRooms && !selectedUnavailableRooms && !invalidDateRange && !!checkIn && !!checkOut;

  const calculateTotalPrice = useMemo(() => {
    let total = 0;

    // Calculate total price for all selected room variations
    Object.entries(selectedRoomCounts).forEach(([variationKey, count]) => {
      if (count > 0) {
        hotel?.rooms.forEach((room) => {
          room.variations?.forEach((variation) => {
            const key = `${variation.bed_type}-${variation.max_occupancy}-${variation.smoking_allowed}-${variation.pet_allowed}`;
            if (key === variationKey) {
              const variationPrice = room.price + (variation.price_modifier || 0);
              total += variationPrice * count * nights;
            }
          });
        });
      }
    });

    return total;
  }, [selectedRoomCounts, hotel, nights]);

  const serviceFee = useMemo(() => Math.round(calculateTotalPrice * 0.12), [calculateTotalPrice]);
  const grandTotal = useMemo(() => calculateTotalPrice + serviceFee, [calculateTotalPrice, serviceFee]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6 animate-spin">
            <Loader className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Loading hotel details...</h1>
          <p className="text-muted-foreground">Please wait while we fetch the information</p>
        </div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
            <ImageIcon className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Hotel not found</h1>
          <p className="text-muted-foreground mb-6">{error || "The hotel you're looking for doesn't exist"}</p>
          <Button variant="hero" onClick={() => navigate("/")}>
            Go back home
          </Button>
        </div>
      </div>
    );
  }

  const handleBookNow = () => {
    const selectedVariations = Object.entries(selectedRoomCounts).filter(([_, count]) => count > 0);
    if (selectedVariations.length === 0) {
      console.log("[HOTEL DETAIL] No rooms selected");
      return;
    }

    if (invalidDateRange) {
      console.log("[HOTEL DETAIL] Invalid date range");
      return;
    }

    if (selectedUnavailableRooms) {
      console.log("[HOTEL DETAIL] Selected room unavailable for selected dates");
      return;
    }

    // Check if user is logged in
    const user = getLoggedInUser();
    console.log("[HOTEL DETAIL] User check:", user ? `Logged in as ${user.email}` : "Not logged in");

    if (!user) {
      console.log("[HOTEL DETAIL] Redirecting to login with return URL");
      const hotelId = hotel?.id;
      localStorage.setItem("returnUrl", `/hotel/${hotelId}`);
      navigate("/login");
      return;
    }

    // User is logged in, open the booking modal
    console.log("[HOTEL DETAIL] Opening booking modal");
    setShowBookingModal(true);
  };

  const handleFilterChange = (filter: 'all' | 'ac' | 'non-ac') => {
    setFilterAC(filter);
  };

  // Gallery images from backend, with fallback to main hotel image
  const galleryImages = hotel.hotelImages && hotel.hotelImages.length > 0 
    ? hotel.hotelImages 
    : [hotel.image];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button & Actions */}
          <div className="flex items-center justify-between mb-6 animate-fade-in-down">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="gap-2 hover:gap-3 transition-all group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="glass" size="icon" className="group">
                <Share2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
              </Button>
              <Button
                variant="glass"
                size="icon"
                onClick={() => setIsLiked(!isLiked)}
                className="group"
              >
                <Heart
                  className={cn(
                    "h-4 w-4 transition-all group-hover:scale-110",
                    isLiked && "fill-destructive text-destructive"
                  )}
                />
              </Button>
            </div>
          </div>

          {/* Image Gallery */}
          {/* Mobile: single image, Desktop: gallery grid */}
          <div className="block sm:hidden mb-8 rounded-2xl overflow-hidden animate-fade-in relative aspect-[16/10]">
            <img
              src={galleryImages[0]}
              alt={hotel.name}
              className="w-full h-full object-cover"
            />
            <Button
              variant="glass"
              size="sm"
              className="absolute bottom-4 right-4 gap-2"
            >
              <ImageIcon className="h-4 w-4" />
              Show all Photos and Reviews
            </Button>
          </div>
          <div className="hidden sm:grid grid-cols-4 grid-rows-2 gap-2 mb-8 rounded-3xl overflow-hidden animate-fade-in h-[400px] lg:h-[500px] relative">
            <div className="col-span-2 row-span-2 relative group cursor-pointer" onClick={() => setActiveImageIndex(0)}>
              <img
                src={galleryImages[0]}
                alt={hotel.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            {galleryImages.slice(1).map((img, idx) => (
              <div
                key={idx}
                className="relative group cursor-pointer overflow-hidden"
                onClick={() => setActiveImageIndex(idx + 1)}
              >
                <img
                  src={img}
                  alt={`${hotel.name} ${idx + 2}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-background/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
            <Button
              variant="glass"
              size="sm"
              className="absolute bottom-4 right-4 gap-2"
            >
              <ImageIcon className="h-4 w-4" />
              Show all photos and Reviews
            </Button>
          </div>

          {/* Hotel Header */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8 animate-fade-in-up">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {hotel.tags.map((tag, index) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full glass text-sm font-medium animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-3">{hotel.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-5 w-5" />
                  <span>{hotel.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="h-5 w-5 fill-accent text-accent" />
                  <span className="font-semibold text-foreground">{hotel.rating}</span>
                  <span>({hotel.reviews.toLocaleString()} reviews)</span>
                </div>
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-gradient">${hotel.price}</span>
              <span className="text-muted-foreground">/night</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Hotel Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <Card className="glass border-border/50 animate-fade-in-up overflow-hidden group">
                <CardHeader className="relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    About this property
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{hotel.description}</p>
                </CardContent>
              </Card>

              {/* Amenities */}
              <Card className="glass border-border/50 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                <CardHeader>
                  <CardTitle>What this place offers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {hotel.amenities.map((amenity, index) => {
                      const IconComponent = amenityIcons[amenity] || Check;
                      return (
                        <div
                          key={amenity}
                          className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all duration-300 cursor-default group animate-fade-in"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <IconComponent className="h-5 w-5 text-accent group-hover:scale-110 transition-transform" />
                          <span className="text-sm">{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Rooms Section — Booking.com Style */}
              <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Available Rooms</h2>
                  <div className="flex items-center gap-4">
                    <Button
                      variant={filterAC === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleFilterChange('all')}
                    >
                      All
                    </Button>
                    <Button
                      variant={filterAC === 'ac' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleFilterChange('ac')}
                    >
                      AC
                    </Button>
                    <Button
                      variant={filterAC === 'non-ac' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleFilterChange('non-ac')}
                    >
                      Non-AC
                    </Button>
                  </div>
                </div>

                {filteredRooms.length === 0 ? (
                  <div className="p-6 rounded-xl bg-secondary/30 border border-border/50 text-center text-muted-foreground animate-fade-in">
                    No room found for this filter
                  </div>
                ) : (
                  <div className="space-y-5">
                    {filteredRooms.map((room, index) => {
                      const isExpanded = expandedRoomType === room.id;
                      const availableVariations = room.variations?.filter(v => v.status === "AVAILABLE") || [];

                      return (
                        <div
                          key={room.id}
                          className="animate-fade-in"
                          style={{ animationDelay: `${index * 80}ms` }}
                        >
                          {/* Room Type Header Card — no image, common properties */}
                          <Card
                            className={cn(
                              "border-border/50 transition-all duration-500 overflow-hidden cursor-pointer group",
                              isExpanded ? "border-primary/60 shadow-lg shadow-primary/5" : "hover:border-primary/30 hover:shadow-md"
                            )}
                            onClick={() => {
                              if (isExpanded) {
                                setExpandedRoomType(null);
                              } else {
                                setExpandedRoomType(room.id);
                              }
                            }}
                          >
                            <CardContent className="p-5">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                                      <Bed className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                      <h3 className="text-lg font-bold">{room.name}</h3>
                                      <p className="text-sm text-muted-foreground">{room.description}</p>
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                      <Maximize className="h-4 w-4" />
                                      <span>{room.size} m²</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <Users className="h-4 w-4" />
                                      <span>Up to {room.capacity} guests</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <Bed className="h-4 w-4" />
                                      <span>{room.beds} bed</span>
                                    </div>
                                    {availableVariations.length > 0 && (
                                      <span className="px-2.5 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-semibold">
                                        {availableVariations.length} available
                                      </span>
                                    )}
                                  </div>

                                  {/* Common amenities chips */}
                                  {room.amenities.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-3">
                                      {room.amenities.slice(0, 6).map((amenity, ai) => (
                                        <span key={`${amenity}-${ai}`} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary/50 text-xs text-muted-foreground">
                                          <Check className="w-3 h-3 text-accent" />
                                          {amenity}
                                        </span>
                                      ))}
                                      {room.amenities.length > 6 && (
                                        <span className="px-2.5 py-1 rounded-full bg-secondary/50 text-xs text-muted-foreground">
                                          +{room.amenities.length - 6} more
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                                  <div className="text-right">
                                    <div className="text-sm text-muted-foreground">from</div>
                                    <div className="text-2xl font-bold text-gradient">${room.price}</div>
                                    <div className="text-xs text-muted-foreground">per night</div>
                                  </div>
                                  <div className={cn(
                                    "w-8 h-8 rounded-full border border-border/50 flex items-center justify-center transition-all duration-300",
                                    isExpanded ? "bg-primary text-primary-foreground rotate-180" : "bg-secondary/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                                  )}>
                                    <ChevronDown className="w-4 h-4" />
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Expanded Variations — Grouped Room Cards */}
                          {isExpanded && room.variations && room.variations.length > 0 && (
                            <div className="mt-2 ml-4 border-l-2 border-primary/20 pl-4 space-y-3 animate-fade-in">
                              {room.variations.map((variation, vi) => {
                                // Create a unique key for this variation
                                const variationKey = `${variation.bed_type}-${variation.max_occupancy}-${variation.smoking_allowed}-${variation.pet_allowed}`;
                                const variationPrice = room.price + (variation.price_modifier || 0);
                                const currentImgIdx = variationImageIndices[variationKey] || 0;
                                const images = variation.images || [];
                                const roomCount = selectedRoomCounts[variationKey] || 0;
                                const roomAvailability = availabilityByRoomId[room.id];
                                const availableRooms = roomAvailability?.available ?? variation.available_count;
                                const isAvailable = availableRooms > 0;
                                const roomSelectedCount = selectedRoomCountByRoomId[room.id] || 0;
                                const overSelectedCapacity = roomAvailability ? roomSelectedCount > availableRooms : false;

                                const nextImage = (e: React.MouseEvent) => {
                                  e.stopPropagation();
                                  if (images.length <= 1) return;
                                  setVariationImageIndices(prev => ({
                                    ...prev,
                                    [variationKey]: (currentImgIdx + 1) % images.length
                                  }));
                                };

                                const prevImage = (e: React.MouseEvent) => {
                                  e.stopPropagation();
                                  if (images.length <= 1) return;
                                  setVariationImageIndices(prev => ({
                                    ...prev,
                                    [variationKey]: (currentImgIdx - 1 + images.length) % images.length
                                  }));
                                };

                                const updateRoomCount = (count: number) => {
                                  const maxCount = roomAvailability ? Math.min(availableRooms, variation.available_count) : variation.available_count;
                                  setSelectedRoomCounts(prev => ({
                                    ...prev,
                                    [variationKey]: Math.max(0, Math.min(maxCount, count))
                                  }));
                                };

                                return (
                                  <Card
                                    key={variationKey}
                                    className={cn(
                                      "overflow-hidden border-border/40 transition-all duration-300",
                                      isAvailable ? "hover:shadow-md hover:border-primary/30" : "opacity-60",
                                      roomCount > 0 && "border-primary ring-1 ring-primary/20"
                                    )}
                                    style={{ animationDelay: `${vi * 60}ms` }}
                                  >
                                    <CardContent className="p-0">
                                      {roomCount > 0 && (!isAvailable || overSelectedCapacity) && (
                                        <div className="p-3 bg-destructive/10 border-b border-destructive/30 text-destructive text-sm font-medium">
                                          {overSelectedCapacity
                                            ? "Selected room quantity exceeds availability for the chosen dates."
                                            : "This room isn’t available for the selected dates or has already been reserved."}
                                        </div>
                                      )}
                                      {roomCount > 0 && invalidDateRange && (
                                        <div className="p-3 bg-destructive/10 border-b border-destructive/30 text-destructive text-sm font-medium">
                                          Please select a valid check-in and check-out range.
                                        </div>
                                      )}
                                      <div className="flex flex-col md:flex-row">
                                        {/* Image Slider - Left Side */}
                                        <div
                                          className="relative w-full md:w-48 h-48 md:h-auto flex-shrink-0 overflow-hidden group/img bg-secondary/10 cursor-pointer"
                                          onClick={(e) => { e.stopPropagation(); setRoomDetailModal({ room, variation }); }}
                                        >
                                          {images.length > 0 ? (
                                            <>
                                              <img
                                                src={images[currentImgIdx]}
                                                alt={`${variation.bed_type} room`}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105"
                                              />
                                              {images.length > 1 && (
                                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                                                  {images.map((_, imgIdx) => (
                                                    <div
                                                      key={imgIdx}
                                                      className={cn(
                                                        "w-1.5 h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                                                        imgIdx === currentImgIdx ? "bg-white w-4" : "bg-white/50"
                                                      )}
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        setVariationImageIndices(prev => ({
                                                          ...prev,
                                                          [variationKey]: imgIdx
                                                        }));
                                                      }}
                                                    />
                                                  ))}
                                                </div>
                                              )}
                                              {images.length > 1 && (
                                                <>
                                                  <button
                                                    onClick={(e) => { e.stopPropagation(); prevImage(e); }}
                                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all duration-200 hover:bg-background hover:scale-110"
                                                  >
                                                    <ArrowLeft className="w-4 h-4" />
                                                  </button>
                                                  <button
                                                    onClick={(e) => { e.stopPropagation(); nextImage(e); }}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all duration-200 hover:bg-background hover:scale-110"
                                                  >
                                                    <ChevronRight className="w-4 h-4" />
                                                  </button>
                                                </>
                                              )}
                                              {!isAvailable && (
                                                <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-destructive/90 text-destructive-foreground text-xs font-medium backdrop-blur-sm">
                                                  {variation.status}
                                                </div>
                                              )}
                                            </>
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                              <ImageIcon className="w-12 h-12 text-muted-foreground/40" />
                                            </div>
                                          )}
                                        </div>

                                        {/* Room Details */}
                                        <div className="flex-1 p-4 flex flex-col md:flex-row gap-4">
                                          {/* Info Column */}
                                          <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm font-semibold">{room.name} • {variation.bed_type} Bed</span>
                                              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/60 text-muted-foreground">
                                                {variation.available_count} available
                                              </span>
                                            </div>

                                            {/* Room properties */}
                                            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                              <div className="flex items-center gap-1">
                                                <Users className="w-3.5 h-3.5" />
                                                <span>{variation.max_occupancy} guest{variation.max_occupancy > 1 ? "s" : ""}</span>
                                              </div>
                                              <div className="flex items-center gap-1">
                                                <Cigarette className={cn("w-3.5 h-3.5", variation.smoking_allowed ? "text-accent" : "text-muted-foreground/40")} />
                                                <span>{variation.smoking_allowed ? "Smoking" : "No smoking"}</span>
                                              </div>
                                              <div className="flex items-center gap-1">
                                                <PawPrint className={cn("w-3.5 h-3.5", variation.pet_allowed ? "text-accent" : "text-muted-foreground/40")} />
                                                <span>{variation.pet_allowed ? "Pet friendly" : "No pets"}</span>
                                              </div>
                                            </div>

                                            {/* Room amenities */}
                                            {variation.amenities && variation.amenities.length > 0 && (
                                              <div className="flex flex-wrap gap-1">
                                                {variation.amenities.map((amenity, ai) => (
                                                  <span key={`${amenity}-${ai}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary/40 text-xs text-muted-foreground">
                                                    <Check className="w-2.5 h-2.5 text-accent" />
                                                    {amenity}
                                                  </span>
                                                ))}
                                              </div>
                                            )}
                                          </div>

                                          {/* Price Column */}
                                          <div className="flex flex-col items-start md:items-center justify-between gap-2 md:min-w-[140px] md:border-l md:border-border/30 md:pl-4">
                                            <div className="text-center">
                                              <div className="text-xl font-bold text-gradient">${variationPrice}</div>
                                              <div className="text-xs text-muted-foreground">per night</div>
                                              {variation.price_modifier !== undefined && variation.price_modifier > 0 && (
                                                <div className="text-xs text-muted-foreground mt-0.5">+${variation.price_modifier} taxes</div>
                                              )}
                                            </div>

                                            {/* Meal plan */}
                                            {variation.meal_plan && (
                                              <div className={cn(
                                                "text-xs font-medium px-2 py-1 rounded-md",
                                                variation.meal_plan.includes("breakfast") || variation.meal_plan.includes("inclusive")
                                                  ? "bg-accent/10 text-accent"
                                                  : "bg-secondary/50 text-muted-foreground"
                                              )}>
                                                {variation.meal_plan === "Room only" ? "🛏️" : "🍳"} {variation.meal_plan}
                                              </div>
                                            )}

                                            {/* Refund policy */}
                                            {variation.refund_policy && (
                                              <div className={cn(
                                                "text-xs font-medium",
                                                variation.refund_policy === "Free cancellation" ? "text-accent" :
                                                variation.refund_policy === "Non-refundable" ? "text-destructive" :
                                                "text-muted-foreground"
                                              )}>
                                                {variation.refund_policy === "Non-refundable" && "⊘ "}
                                                {variation.refund_policy === "Free cancellation" && "✓ "}
                                                {variation.refund_policy}
                                              </div>
                                            )}
                                          </div>

                                          {/* Select Column */}
                                          <div className="flex flex-row md:flex-col items-center gap-2 md:min-w-[100px] md:border-l md:border-border/30 md:pl-4 md:justify-center">
                                            {isAvailable ? (
                                              <>
                                                <div className="flex items-center gap-1">
                                                  <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={(e) => { e.stopPropagation(); updateRoomCount(roomCount - 1); }}
                                                    disabled={roomCount <= 0}
                                                  >
                                                    <span className="text-sm">−</span>
                                                  </Button>
                                                  <span className="w-6 text-center font-semibold text-sm">{roomCount}</span>
                                                  <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={(e) => { e.stopPropagation(); updateRoomCount(roomCount + 1); }}
                                                    disabled={roomCount >= variation.available_count}
                                                  >
                                                    <span className="text-sm">+</span>
                                                  </Button>
                                                </div>
                                              </>
                                            ) : (
                                              <span className="text-xs text-destructive font-medium">Unavailable</span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Policies */}
              <Card className="glass border-border/50 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
                <CardHeader>
                  <CardTitle>Things to know</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-3 gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-5 h-5 text-primary" />
                        <h4 className="font-semibold">Check-in/out</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">Check-in: 3:00 PM</p>
                      <p className="text-sm text-muted-foreground">Check-out: 11:00 AM</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Shield className="w-5 h-5 text-primary" />
                        <h4 className="font-semibold">Cancellation</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">Free cancellation up to 48 hours before check-in</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="w-5 h-5 text-primary" />
                        <h4 className="font-semibold">House rules</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">No smoking • No parties • Pets allowed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Booking Widget */}
            <div className="lg:col-span-1">
              <div className="sticky top-28">
                <Card className="glass border-border/50 animate-fade-in-up overflow-hidden" style={{ animationDelay: "150ms" }}>
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Book your stay</span>
                      <div>
                        <span className="text-2xl font-bold text-gradient">
                          {/* Show min price of all selected variations, or hotel price */}
                          {(() => {
                            const selectedVariations = Object.entries(selectedRoomCounts)
                              .filter(([_, count]) => count > 0);
                            if (selectedVariations.length > 0 && hotel.rooms) {
                              let minPrice = null;
                              hotel.rooms.forEach(room => {
                                room.variations?.forEach(variation => {
                                  const key = `${variation.bed_type}-${variation.max_occupancy}-${variation.smoking_allowed}-${variation.pet_allowed}`;
                                  if (selectedRoomCounts[key] > 0) {
                                    const price = room.price + (variation.price_modifier || 0);
                                    if (minPrice === null || price < minPrice) minPrice = price;
                                  }
                                });
                              });
                              return minPrice !== null ? `$${minPrice}` : `$${hotel.price}`;
                            }
                            return hotel.price > 0 ? `$${hotel.price}` : "Price unavailable";
                          })()}
                        </span>
                        <span className="text-sm text-muted-foreground font-normal">/night</span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Check-in */}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                        Check-in
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !checkIn && "text-muted-foreground"
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {checkIn ? format(checkIn, "EEE, MMM d, yyyy") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="center" side="bottom" sideOffset={4}>
                          <CalendarComponent
                            mode="single"
                            selected={checkIn}
                            onSelect={setCheckIn}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Check-out */}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                        Check-out
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !checkOut && "text-muted-foreground"
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {checkOut ? format(checkOut, "EEE, MMM d, yyyy") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="center" side="bottom" sideOffset={4}>
                          <CalendarComponent
                            mode="single"
                            selected={checkOut}
                            onSelect={setCheckOut}
                            disabled={(date) => date < (checkIn || new Date())}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Selected Rooms Display */}
                    {Object.entries(selectedRoomCounts).filter(([_, count]) => count > 0).length > 0 ? (
                      <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 animate-fade-in">
                        <div className="text-sm text-muted-foreground mb-1">Selected rooms</div>
                        <ul className="text-sm">
                          {hotel.rooms.map(room => (
                            room.variations?.map(variation => {
                              const key = `${variation.bed_type}-${variation.max_occupancy}-${variation.smoking_allowed}-${variation.pet_allowed}`;
                              const count = selectedRoomCounts[key] || 0;
                              if (count > 0) {
                                return (
                                  <li key={key} className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-accent" />
                                    <span>{room.name} • {variation.bed_type} Bed</span>
                                    <span className="ml-2 text-xs text-muted-foreground">x{count}</span>
                                  </li>
                                );
                              }
                              return null;
                            })
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 text-center animate-fade-in">
                        <p className="text-sm text-accent font-medium">Please select a room to book</p>
                      </div>
                    )}

                    {/* Price Summary (only after a room is selected) */}
                    {nights > 0 && Object.entries(selectedRoomCounts).filter(([_, count]) => count > 0).length > 0 && (
                      <div className="pt-4 border-t border-border space-y-2 animate-fade-in">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {Object.entries(selectedRoomCounts).filter(([variationKey, count]) => count > 0).map(([variationKey, count]) => {
                              let price = null;
                              hotel.rooms.forEach(room => {
                                room.variations?.forEach(variation => {
                                  const key = `${variation.bed_type}-${variation.max_occupancy}-${variation.smoking_allowed}-${variation.pet_allowed}`;
                                  if (key === variationKey) {
                                    price = room.price + (variation.price_modifier || 0);
                                  }
                                });
                              });
                              return price !== null ? (
                                <span key={variationKey} className="block">
                                  ${price} × {count} room{count > 1 ? "s" : ""}
                                </span>
                              ) : null;
                            })}
                          </span>
                          <span>${grandTotal}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Service fee</span>
                          <span>${serviceFee}</span>
                        </div>
                        <div className="flex justify-between font-semibold pt-2 border-t border-border">
                          <span>Total</span>
                          <span className="text-gradient">${grandTotal}</span>
                        </div>
                      </div>
                    )}

                    {selectedUnavailableRooms && (
                      <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive font-medium text-center">
                        Some selected rooms aren’t available for the selected dates or have already been reserved.
                      </div>
                    )}
                    {invalidDateRange && (
                      <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive font-medium text-center">
                        Please select a valid check-in and check-out range.
                      </div>
                    )}

                    <Button
                      variant="hero"
                      size="xl"
                      className="w-full group"
                      onClick={handleBookNow}
                      disabled={!canReserve}
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      {hasSelectedRooms ? (
                        selectedUnavailableRooms ? "Selected room unavailable" : invalidDateRange ? "Select valid dates" : `Reserve for $${grandTotal}`
                      ) : (
                        "Select a room to book"
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                      <Shield className="w-3 h-3" />
                      You won't be charged yet
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Room Detail Modal */}
      {roomDetailModal && (
        <RoomDetailModal
          isOpen={!!roomDetailModal}
          onClose={() => setRoomDetailModal(null)}
          room={roomDetailModal.room}
          variation={roomDetailModal.variation}
        />
      )}

      {/* Booking Confirmation Modal */}
      {showBookingModal && checkIn && checkOut && (
        <BookingConfirmation
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          hotel={hotel}
          selectedRoomCounts={selectedRoomCounts}
          checkIn={checkIn}
          checkOut={checkOut}
          guests={guests}
          room={hotel.rooms[0]}
          grandTotal={grandTotal}
        />
      )}
    </div>
  );
};

export default HotelDetail;
