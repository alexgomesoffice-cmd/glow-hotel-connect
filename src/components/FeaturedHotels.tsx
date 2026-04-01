import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Heart, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchPublicHotels, PublicHotel } from "@/services/publicHotelApi";

const FeaturedHotels = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  const [likedHotels, setLikedHotels] = useState<number[]>([]);
  const [hotels, setHotels] = useState<PublicHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchPublicHotels()
      .then((data) => {
        // Sort by star rating and take top 4
        const sorted = [...data].sort((a, b) => (b.hotel_details?.star_rating || 0) - (a.hotel_details?.star_rating || 0));
        setHotels(sorted.slice(0, 4));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load hotels");
        setLoading(false);
      });
  }, []);

  const toggleLike = (e: React.MouseEvent, hotelId: number) => {
    e.stopPropagation();
    setLikedHotels((prev) =>
      prev.includes(hotelId)
        ? prev.filter((id) => id !== hotelId)
        : [...prev, hotelId]
    );
  };

  const handleCardClick = (hotelId: number) => {
    navigate(`/hotel/${hotelId}`);
  };

  return (
    <section ref={sectionRef} className="py-24 relative overflow-hidden bg-secondary/20">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute top-1/3 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
          <div>
            <h2
              className={`text-3xl sm:text-4xl font-bold mb-3 ${
                isVisible ? "animate-fade-in-up" : "opacity-0"
              }`}
            >
              Hotels loved by <span className="text-gradient">guests</span>
            </h2>
            <p
              className={`text-muted-foreground max-w-lg ${
                isVisible ? "animate-fade-in-up" : "opacity-0"
              }`}
              style={{ animationDelay: "100ms" }}
            >
              Top-rated stays with exceptional reviews and unforgettable experiences
            </p>
          </div>
          <button
            onClick={() => navigate("/popular")}
            className={`group flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all ${
              isVisible ? "animate-fade-in-up" : "opacity-0"
            }`}
            style={{ animationDelay: "200ms" }}
          >
            View all loved hotels
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Hotels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {error && (
            <div className="col-span-4 text-center py-16">
              <p className="text-xl font-semibold mb-2 text-destructive">{error}</p>
              <p className="text-muted-foreground">Try again later</p>
            </div>
          )}
          {!error && loading && (
            <div className="col-span-4 text-center py-16">
              <p className="text-xl font-semibold mb-2">Loading hotels...</p>
            </div>
          )}
          {!error && !loading && hotels.map((hotel, index) => {
            const coverImg = hotel.hotel_images?.find(img => img.is_cover)?.image_url || hotel.hotel_images?.[0]?.image_url || "https://via.placeholder.com/400x300?text=No+Image";
            return (
              <div
                key={hotel.hotel_id}
                onClick={() => handleCardClick(hotel.hotel_id)}
                className={`group relative rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/30 transition-all duration-500 cursor-pointer hover:scale-[1.02] hover:-translate-y-3 ${
                  isVisible ? "animate-fade-in-up" : "opacity-0"
                }`}
                style={{ animationDelay: `${(index + 2) * 100}ms` }}
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={coverImg}
                    alt={hotel.name}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-105"
                  />
                  {/* Animated shine overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  {/* Like Button */}
                  <button
                    onClick={(e) => toggleLike(e, hotel.hotel_id)}
                    className="absolute top-4 right-4 p-2.5 rounded-full glass transition-all duration-300 hover:scale-125 active:scale-95 z-10"
                  >
                    <Heart
                      className={`h-5 w-5 transition-all duration-300 ${
                        likedHotels.includes(hotel.hotel_id)
                          ? "fill-destructive text-destructive scale-110"
                          : "text-foreground hover:text-destructive"
                      }`}
                    />
                  </button>
                  {/* Rating Badge */}
                  {hotel.hotel_details?.star_rating && (
                    <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/90 backdrop-blur-sm group-hover:scale-105 transition-transform z-10">
                      <Star className="h-4 w-4 fill-primary-foreground text-primary-foreground animate-pulse" />
                      <span className="text-sm font-semibold text-primary-foreground">
                        {hotel.hotel_details.star_rating}
                      </span>
                    </div>
                  )}
                </div>
                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-1">
                    {hotel.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4 group-hover:text-primary transition-colors" />
                    <span className="text-sm">{hotel.city || hotel.address || "Unknown"}</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      {hotel.hotel_rooms && hotel.hotel_rooms.length > 0 ? (
                        <>
                          <span className="text-2xl font-bold text-gradient">
                            ${hotel.hotel_rooms
                              .map((room) => room.base_price)
                              .reduce((min, price) => price < min ? price : min, hotel.hotel_rooms[0].base_price)}
                          </span>
                          <span className="text-sm text-muted-foreground">/night</span>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">No rooms available</span>
                      )}
                    </div>
                  </div>
                </div>
                {/* View Details Overlay - no blur, keeps zoom visible */}
                <div className="absolute inset-0 flex items-center justify-center bg-background/70 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                  <Button variant="hero" size="lg" className="scale-90 group-hover:scale-100 transition-transform duration-300 shadow-xl pointer-events-auto">
                    View Details
                  </Button>
                </div>
                {/* Hover border glow */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/30 rounded-2xl transition-colors pointer-events-none" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-gradient-to-t from-primary/5 via-transparent to-transparent rounded-2xl" />
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div
          className={`text-center mt-12 ${
            isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
          style={{ animationDelay: "700ms" }}
        >
          <Button variant="hero" size="lg" onClick={() => navigate("/explore")}>
            Explore all hotels
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedHotels;
