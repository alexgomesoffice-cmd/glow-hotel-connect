import { useState, useMemo } from "react";
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
  Share2,
  Image as ImageIcon
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
import { getHotelById, Room } from "@/data/hotels";
import { cn } from "@/lib/utils";

const amenityIcons: Record<string, typeof Wifi> = {
  "Free WiFi": Wifi,
  "Gym": Dumbbell,
  "Valet Parking": Car,
  "Fine Dining": UtensilsCrossed,
  "Free Parking": Car,
};

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

  const hotel = getHotelById(Number(id));

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

  if (!hotel) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
            <ImageIcon className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Hotel not found</h1>
          <p className="text-muted-foreground mb-6">The hotel you're looking for doesn't exist</p>
          <Button variant="hero" onClick={() => navigate("/")}>
            Go back home
          </Button>
        </div>
      </div>
    );
  }

  const handleBookNow = () => {
    if (!selectedRoom) {
      // Auto-select first room if none selected
      setSelectedRoom(hotel.rooms[0]);
    }
    setShowBookingModal(true);
  };

  // Mock gallery images (using same image for demo)
  const galleryImages = [hotel.image, hotel.image, hotel.image, hotel.image];

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
          <div className="grid grid-cols-4 gap-2 mb-8 rounded-3xl overflow-hidden animate-fade-in">
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
                className="relative aspect-[4/3] group cursor-pointer overflow-hidden"
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
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
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

                            <div className="flex flex-wrap gap-2">
                              {room.amenities.map((amenity, amenityIndex) => (
                                <span
                                  key={amenity}
                                  className="px-2.5 py-1 rounded-lg bg-secondary/50 text-xs transition-all duration-300 hover:bg-primary/20 hover:text-primary"
                                  style={{ transitionDelay: `${amenityIndex * 30}ms` }}
                                >
                                  {amenity}
                                </span>
                              ))}
                            </div>
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
                          ${selectedRoom?.price || hotel.price}
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
                        <PopoverContent className="w-auto p-0" align="start">
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
                        <PopoverContent className="w-auto p-0" align="start">
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

                    {/* Price Summary */}
                    {nights > 0 && (
                      <div className="pt-4 border-t border-border space-y-2 animate-fade-in">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            ${selectedRoom?.price || hotel.price} × {nights} night{nights > 1 ? "s" : ""}
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

                    <Button
                      variant="hero"
                      size="xl"
                      className="w-full group"
                      onClick={handleBookNow}
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
