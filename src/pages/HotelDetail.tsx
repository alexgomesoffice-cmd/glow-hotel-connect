import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
    max_occupancy?: number;
    bed_type?: string;
    room_size?: string;
  }>;
}

interface RoomVariation {
  room_details_id: number;
  room_number: string;
  bed_type: string;
  max_occupancy: number;
  smoking_allowed: boolean;
  pet_allowed: boolean;
  status: string;
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
      amenities: ["Free Wi-Fi", "Room Service", "Mini Bar"],
      image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600",
      variations: [
        { room_details_id: 1, room_number: "101", bed_type: "Queen", max_occupancy: 2, smoking_allowed: true, pet_allowed: false, status: "AVAILABLE" },
        { room_details_id: 2, room_number: "102", bed_type: "Queen", max_occupancy: 2, smoking_allowed: false, pet_allowed: true, status: "AVAILABLE" },
        { room_details_id: 3, room_number: "103", bed_type: "Queen", max_occupancy: 2, smoking_allowed: false, pet_allowed: false, status: "UNAVAILABLE" },
        { room_details_id: 4, room_number: "104", bed_type: "Queen", max_occupancy: 2, smoking_allowed: true, pet_allowed: true, status: "MAINTENANCE" },
        { room_details_id: 5, room_number: "105", bed_type: "Queen", max_occupancy: 2, smoking_allowed: false, pet_allowed: false, status: "AVAILABLE" },
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
      image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600",
      variations: [
        { room_details_id: 6, room_number: "201", bed_type: "Queen", max_occupancy: 2, smoking_allowed: false, pet_allowed: false, status: "AVAILABLE" },
        { room_details_id: 7, room_number: "202", bed_type: "Queen", max_occupancy: 2, smoking_allowed: true, pet_allowed: false, status: "AVAILABLE" },
        { room_details_id: 8, room_number: "203", bed_type: "Queen", max_occupancy: 2, smoking_allowed: false, pet_allowed: true, status: "UNAVAILABLE" },
        { room_details_id: 9, room_number: "204", bed_type: "Queen", max_occupancy: 2, smoking_allowed: false, pet_allowed: false, status: "AVAILABLE" },
        { room_details_id: 10, room_number: "205", bed_type: "Queen", max_occupancy: 2, smoking_allowed: true, pet_allowed: false, status: "MAINTENANCE" },
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
      amenities: ["Free Wi-Fi", "Living Area", "Mini Bar", "Jacuzzi"],
      image: "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=600",
      variations: [
        { room_details_id: 11, room_number: "301", bed_type: "King", max_occupancy: 4, smoking_allowed: false, pet_allowed: true, status: "AVAILABLE" },
        { room_details_id: 12, room_number: "302", bed_type: "King", max_occupancy: 4, smoking_allowed: false, pet_allowed: false, status: "AVAILABLE" },
        { room_details_id: 13, room_number: "303", bed_type: "King", max_occupancy: 4, smoking_allowed: true, pet_allowed: false, status: "UNAVAILABLE" },
        { room_details_id: 14, room_number: "304", bed_type: "King", max_occupancy: 4, smoking_allowed: false, pet_allowed: true, status: "AVAILABLE" },
        { room_details_id: 15, room_number: "305", bed_type: "King", max_occupancy: 4, smoking_allowed: false, pet_allowed: false, status: "AVAILABLE" },
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
      image: "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=600",
      variations: [
        { room_details_id: 16, room_number: "401", bed_type: "Twin", max_occupancy: 2, smoking_allowed: false, pet_allowed: false, status: "AVAILABLE" },
        { room_details_id: 17, room_number: "402", bed_type: "Twin", max_occupancy: 2, smoking_allowed: false, pet_allowed: false, status: "AVAILABLE" },
        { room_details_id: 18, room_number: "403", bed_type: "Twin", max_occupancy: 2, smoking_allowed: true, pet_allowed: false, status: "UNAVAILABLE" },
        { room_details_id: 19, room_number: "404", bed_type: "Twin", max_occupancy: 2, smoking_allowed: false, pet_allowed: true, status: "AVAILABLE" },
        { room_details_id: 20, room_number: "405", bed_type: "Twin", max_occupancy: 2, smoking_allowed: false, pet_allowed: false, status: "MAINTENANCE" },
      ],
    },
  ],
};
// ============================================================

const HotelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [checkIn, setCheckIn] = useState<Date | undefined>(addDays(new Date(), 1));
  const [checkOut, setCheckOut] = useState<Date | undefined>(addDays(new Date(), 3));
  const [guests, setGuests] = useState(2);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRoomType, setExpandedRoomType] = useState<number | null>(null);

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

              // Get room details from hotel_room_details array (if available)
              const roomDetail = backendRoom.hotel_room_details?.[0];
              const capacity = roomDetail?.max_occupancy || 2;
              const beds = roomDetail?.bed_type || "1 Queen Bed";
              const roomSize = roomDetail?.room_size ? parseInt(roomDetail.room_size) : (backendRoom.room_size ? parseInt(backendRoom.room_size) : 30);

              // Get room amenities from the room_amenities array - ONLY use room amenities
              const roomAmenities = backendRoom.room_amenities?.map(ra => ra.amenity.name) || [];
              
              // Debug: log the amenities to see what we're getting
              console.log(`Room "${backendRoom.room_type}" amenities:`, roomAmenities, "room_amenities object:", backendRoom.room_amenities);

              const room: Room = {
                id: backendRoom.hotel_room_id,
                name: backendRoom.room_type,
                description: backendRoom.description || "",
                price: Number(backendRoom.base_price) || 150,
                capacity,
                beds,
                size: roomSize,
                amenities: roomAmenities, // Use ONLY room amenities, even if empty
                image: roomImageUrl,
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

          // Clear any previously selected room when navigating between hotels.
          setSelectedRoom(null);
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

  // Calculate pricing
  const nights = useMemo(() => {
    if (checkIn && checkOut) {
      return differenceInDays(checkOut, checkIn);
    }
    return 1;
  }, [checkIn, checkOut]);

  const totalPrice = useMemo(() => {
    const roomPrice = selectedRoom?.price || hotel?.price || 0;
    return roomPrice * nights;
  }, [selectedRoom, hotel, nights]);

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
    if (!selectedRoom) {
      console.log("[HOTEL DETAIL] No room selected");
      return; // Don't open modal without a room selected
    }

    // Check if user is logged in
    const user = getLoggedInUser();
    console.log("[HOTEL DETAIL] User check:", user ? `Logged in as ${user.email}` : "Not logged in");
    
    if (!user) {
      console.log("[HOTEL DETAIL] Redirecting to login with return URL");
      // Redirect to login with return URL
      const hotelId = hotel.id;
      localStorage.setItem("returnUrl", `/hotel/${hotelId}`);
      navigate("/login");
      return;
    }

    // User is logged in, open the booking modal
    console.log("[HOTEL DETAIL] Opening booking modal");
    setShowBookingModal(true);
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
              Show all photos
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
              Show all photos
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
              <span className="text-4xl font-bold text-gradient">${selectedRoom?.price || hotel.price}</span>
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

              {/* Rooms Section */}
              <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Available Rooms</h2>
                  <span className="text-muted-foreground">{hotel.rooms.length} room types</span>
                </div>
                {hotel.rooms.length === 0 ? (
                  <div className="p-6 rounded-xl bg-secondary/30 border border-border/50 text-center text-muted-foreground animate-fade-in">
                    No room found for this hotel
                  </div>
                ) : (
                  <div className="space-y-4">
                    {hotel.rooms.map((room, index) => (
                      <Card
                        key={room.id}
                        className={cn(
                          "glass border-border/50 transition-all duration-500 cursor-pointer group overflow-hidden",
                          selectedRoom?.id === room.id
                            ? "border-primary ring-2 ring-primary/20 scale-[1.01]"
                            : "hover:border-primary/50 hover:scale-[1.005]"
                        )}
                        onClick={() => setSelectedRoom(room)}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <CardContent className="p-0 flex flex-col sm:flex-row">
                          {/* Room Image - Left Side */}
                          {room.image && (
                            <div className="w-full sm:w-48 flex-shrink-0 h-48 sm:h-auto overflow-hidden rounded-tl-lg sm:rounded-l-lg">
                              <img
                                src={room.image}
                                alt={room.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                onError={(e) => {
                                  // Hide image if it fails to load
                                  (e.currentTarget.parentElement as HTMLElement).style.display = 'none';
                                }}
                              />
                            </div>
                          )}

                          {/* Room Details - Right Side */}
                          <div className="p-6 flex-1 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                                  {room.name}
                                </h3>
                                {selectedRoom?.id === room.id && (
                                  <span className="px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center gap-1 animate-scale-in">
                                    <Check className="w-3 h-3" />
                                    Selected
                                  </span>
                                )}
                              </div>
                              <p className="text-muted-foreground text-sm mb-4">{room.description}</p>

                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                                <div className="flex items-center gap-1.5 group/item">
                                  <Users className="h-4 w-4 group-hover/item:text-primary transition-colors" />
                                  <span>Up to {room.capacity} guests</span>
                                </div>
                                <div className="flex items-center gap-1.5 group/item">
                                  <Bed className="h-4 w-4 group-hover/item:text-primary transition-colors" />
                                  <span>{room.beds}</span>
                                </div>
                                <div className="flex items-center gap-1.5 group/item">
                                  <Maximize className="h-4 w-4 group-hover/item:text-primary transition-colors" />
                                  <span>{room.size} m²</span>
                                </div>
                              </div>

                              {/* Room Amenities */}
                              {room.amenities && room.amenities.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {room.amenities.map((amenity, amenityIndex) => (
                                    <span
                                      key={`${amenity}-${amenityIndex}`}
                                      className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-accent/20 to-primary/20 text-xs font-medium text-foreground hover:from-accent/30 hover:to-primary/30 transition-all duration-300 whitespace-nowrap"
                                      style={{ animationDelay: `${amenityIndex * 30}ms` }}
                                    >
                                      {amenity}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="text-right flex flex-col items-end">
                              <div className="text-3xl font-bold text-gradient">${room.price}</div>
                              <div className="text-sm text-muted-foreground mb-3">per night</div>
                              <Button
                                variant={selectedRoom?.id === room.id ? "hero" : "outline"}
                                size="sm"
                                className="gap-1 group/btn"
                              >
                                {selectedRoom?.id === room.id ? "Selected" : "Select"}
                                <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
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
                          {selectedRoom?.price && selectedRoom.price > 0
                            ? `$${selectedRoom.price}`
                            : hotel.price > 0
                              ? `$${hotel.price}`
                              : "Price unavailable"}
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

                    {/* Guests */}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                        Guests
                      </label>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setGuests(Math.max(1, guests - 1))}
                          disabled={guests <= 1}
                        >
                          -
                        </Button>
                        <span className="flex-1 text-center font-semibold">{guests} guest{guests > 1 ? "s" : ""}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setGuests(Math.min(selectedRoom?.capacity || 10, guests + 1))}
                          disabled={guests >= (selectedRoom?.capacity || 10)}
                        >
                          +
                        </Button>
                      </div>
                    </div>

                    {/* Selected Room Display */}
                    {selectedRoom && (
                      <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 animate-fade-in">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">Selected room</div>
                            <div className="font-semibold">{selectedRoom.name}</div>
                          </div>
                          <Check className="w-5 h-5 text-accent" />
                        </div>
                      </div>
                    )}

                    {/* Price Summary (only after a room is selected) */}
                    {nights > 0 && selectedRoom && (
                      <div className="pt-4 border-t border-border space-y-2 animate-fade-in">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            ${selectedRoom.price} × {nights} night{nights > 1 ? "s" : ""}
                          </span>
                          <span>${totalPrice}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Service fee</span>
                          <span>${Math.round(totalPrice * 0.12)}</span>
                        </div>
                        <div className="flex justify-between font-semibold pt-2 border-t border-border">
                          <span>Total</span>
                          <span className="text-gradient">${totalPrice + Math.round(totalPrice * 0.12)}</span>
                        </div>
                      </div>
                    )}

                    {!selectedRoom && (
                      <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 text-center animate-fade-in">
                        <p className="text-sm text-accent font-medium">Please select a room to book</p>
                      </div>
                    )}

                    <Button
                      variant="hero"
                      size="xl"
                      className="w-full group"
                      onClick={handleBookNow}
                      disabled={!selectedRoom}
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      {selectedRoom ? `Reserve for $${totalPrice + Math.round(totalPrice * 0.12)}` : "Select a room to book"}
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

      {/* Booking Confirmation Modal */}
      {showBookingModal && checkIn && checkOut && (
        <BookingConfirmation
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          hotel={hotel}
          room={selectedRoom || hotel.rooms[0]}
          checkIn={checkIn}
          checkOut={checkOut}
          guests={guests}
        />
      )}
    </div>
  );
};

export default HotelDetail;
