import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, MapPin, Heart, ArrowLeft, Users, Bed, Maximize, Check, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getHotelById, Room } from "@/data/hotels";

const HotelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");

  const hotel = getHotelById(Number(id));

  if (!hotel) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Hotel not found</h1>
          <Button onClick={() => navigate("/")}>Go back home</Button>
        </div>
      </div>
    );
  }

  const handleBookNow = () => {
    if (!selectedRoom) {
      alert("Please select a room first");
      return;
    }
    alert(`Booking confirmed for ${selectedRoom.name} at ${hotel.name}!\nCheck-in: ${checkIn}\nCheck-out: ${checkOut}\nGuests: ${guests}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6 gap-2 hover:gap-3 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to hotels
          </Button>

          {/* Hero Image Section */}
          <div className="relative rounded-3xl overflow-hidden mb-8 animate-fade-in">
            <img
              src={hotel.image}
              alt={hotel.name}
              className="w-full h-[50vh] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            
            {/* Like Button */}
            <button
              onClick={() => setIsLiked(!isLiked)}
              className="absolute top-6 right-6 p-3 rounded-full glass transition-all duration-300 hover:scale-110"
            >
              <Heart
                className={`h-6 w-6 transition-colors ${
                  isLiked ? "fill-destructive text-destructive" : "text-foreground"
                }`}
              />
            </button>

            {/* Rating Badge */}
            <div className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full bg-primary/90 backdrop-blur-sm">
              <Star className="h-5 w-5 fill-primary-foreground text-primary-foreground" />
              <span className="font-semibold text-primary-foreground">{hotel.rating}</span>
              <span className="text-primary-foreground/80 text-sm">({hotel.reviews.toLocaleString()} reviews)</span>
            </div>

            {/* Hotel Info Overlay */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex flex-wrap gap-2 mb-3">
                {hotel.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full glass text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">{hotel.name}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-5 w-5" />
                <span className="text-lg">{hotel.location}</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Hotel Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <Card className="glass border-border/50 animate-fade-in-up">
                <CardHeader>
                  <CardTitle>About this property</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{hotel.description}</p>
                </CardContent>
              </Card>

              {/* Amenities */}
              <Card className="glass border-border/50 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                <CardHeader>
                  <CardTitle>Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {hotel.amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-accent" />
                        <span className="text-sm">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Rooms Section */}
              <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
                <h2 className="text-2xl font-bold mb-6">Available Rooms</h2>
                <div className="space-y-4">
                  {hotel.rooms.map((room) => (
                    <Card
                      key={room.id}
                      className={`glass border-border/50 transition-all duration-300 cursor-pointer hover:border-primary/50 ${
                        selectedRoom?.id === room.id ? "border-primary ring-2 ring-primary/20" : ""
                      }`}
                      onClick={() => setSelectedRoom(room)}
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold">{room.name}</h3>
                              {selectedRoom?.id === room.id && (
                                <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                                  Selected
                                </span>
                              )}
                            </div>
                            <p className="text-muted-foreground text-sm mb-3">{room.description}</p>
                            
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                <Users className="h-4 w-4" />
                                <span>Up to {room.capacity} guests</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Bed className="h-4 w-4" />
                                <span>{room.beds}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Maximize className="h-4 w-4" />
                                <span>{room.size} m²</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-3">
                              {room.amenities.map((amenity) => (
                                <span
                                  key={amenity}
                                  className="px-2 py-1 rounded-md bg-secondary/50 text-xs"
                                >
                                  {amenity}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-2xl font-bold text-gradient">${room.price}</div>
                            <div className="text-sm text-muted-foreground">per night</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Booking Widget */}
            <div className="lg:col-span-1">
              <div className="sticky top-28">
                <Card className="glass border-border/50 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
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
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          type="date"
                          value={checkIn}
                          onChange={(e) => setCheckIn(e.target.value)}
                          className="pl-12"
                        />
                      </div>
                    </div>

                    {/* Check-out */}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                        Check-out
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          type="date"
                          value={checkOut}
                          onChange={(e) => setCheckOut(e.target.value)}
                          className="pl-12"
                        />
                      </div>
                    </div>

                    {/* Guests */}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                        Guests
                      </label>
                      <div className="relative">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          type="number"
                          min={1}
                          max={selectedRoom?.capacity || 10}
                          value={guests}
                          onChange={(e) => setGuests(e.target.value)}
                          className="pl-12"
                        />
                      </div>
                    </div>

                    {/* Selected Room Display */}
                    {selectedRoom && (
                      <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                        <div className="text-sm text-muted-foreground mb-1">Selected room</div>
                        <div className="font-semibold">{selectedRoom.name}</div>
                      </div>
                    )}

                    <Button
                      variant="hero"
                      size="xl"
                      className="w-full"
                      onClick={handleBookNow}
                    >
                      {selectedRoom ? `Book for $${selectedRoom.price}/night` : "Select a room"}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
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
    </div>
  );
};

export default HotelDetail;
