import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Heart, MapPin, ArrowRight, BedDouble } from "lucide-react";
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
        const sorted = [...data].sort(
          (a, b) =>
            Number(b.hotel_details?.star_rating || 0) -
            Number(a.hotel_details?.star_rating || 0)
        );
        setHotels(sorted.slice(0, 6));
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
              Featured <span className="text-gradient">hotels</span>
            </h2>
            <p
              className={`text-muted-foreground max-w-lg ${
                isVisible ? "animate-fade-in-up" : "opacity-0"
              }`}
              style={{ animationDelay: "100ms" }}
            >
              Hand-picked stays with exceptional amenities, top ratings, and a range of room options
            </p>
          </div>
          <button
            onClick={() => navigate("/popular")}
            className={`group flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all ${
              isVisible ? "animate-fade-in-up" : "opacity-0"
            }`}
            style={{ animationDelay: "200ms" }}
          >
            View all hotels
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Hotels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {error && (
            <div className="col-span-full text-center py-16">
              <p className="text-xl font-semibold mb-2 text-destructive">{error}</p>
              <p className="text-muted-foreground">Try again later</p>
            </div>
          )}
          {!error && loading && (
            <div className="col-span-full text-center py-16">
              <p className="text-xl font-semibold mb-2">Loading hotels...</p>
            </div>
          )}
          {!error && !loading && hotels.map((hotel, index) => {
            const coverImg =
              hotel.hotel_images?.find((img) => img.is_cover)?.image_url ||
              hotel.hotel_images?.[0]?.image_url ||
              "https://via.placeholder.com/600x400?text=No+Image";

            const amenities =
              hotel.hotel_amenities?.map((a) => a.amenity.name).filter(Boolean) || [];

            const roomTypes = Array.from(
              new Set(
                (hotel.hotel_rooms || [])
                  .map((r) => r.room_type)
                  .filter((t): t is string => Boolean(t))
              )
            );

            const minPrice =
              hotel.hotel_rooms && hotel.hotel_rooms.length > 0
                ? Math.min(...hotel.hotel_rooms.map((r) => Number(r.base_price)))
                : null;

            return (
              <div
                key={hotel.hotel_id}
                onClick={() => handleCardClick(hotel.hotel_id)}
                className={`group relative flex flex-col rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/40 transition-all duration-500 cursor-pointer hover:-translate-y-2 hover:shadow-[var(--shadow-elevated)] ${
                  isVisible ? "animate-fade-in-up" : "opacity-0"
                }`}
                style={{ animationDelay: `${(index + 2) * 100}ms` }}
              >
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={coverImg}
                    alt={hotel.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                  {/* Hotel Type - top left */}
                  {hotel.hotel_type && (
                    <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-primary/90 backdrop-blur-sm text-xs font-semibold text-primary-foreground uppercase tracking-wide z-10">
                      {hotel.hotel_type}
                    </div>
                  )}

                  {/* Wishlist */}
                  <button
                    onClick={(e) => toggleLike(e, hotel.hotel_id)}
                    className="absolute top-4 right-4 p-2.5 rounded-full glass transition-all duration-300 hover:scale-125 active:scale-95 z-10"
                    aria-label="Add to wishlist"
                  >
                    <Heart
                      className={`h-5 w-5 transition-all duration-300 ${
                        likedHotels.includes(hotel.hotel_id)
                          ? "fill-destructive text-destructive scale-110"
                          : "text-white hover:text-destructive"
                      }`}
                    />
                  </button>

                  {/* Rating */}
                  {hotel.hotel_details?.star_rating && (
                    <div className="absolute bottom-4 left-4 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-background/90 backdrop-blur-sm z-10">
                      <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                      <span className="text-sm font-bold">{hotel.hotel_details.star_rating}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-5">
                  <h3 className="text-lg font-bold mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                    {hotel.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-3">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm line-clamp-1">
                      {hotel.city || hotel.address || "Unknown"}
                    </span>
                  </div>

                  {/* Description */}
                  {hotel.hotel_details?.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {hotel.hotel_details.description}
                    </p>
                  )}

                  {/* Amenities */}
                  {amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {amenities.slice(0, 4).map((a) => (
                        <span
                          key={a}
                          className="px-2.5 py-1 rounded-md bg-secondary text-xs text-secondary-foreground"
                        >
                          {a}
                        </span>
                      ))}
                      {amenities.length > 4 && (
                        <span className="px-2.5 py-1 rounded-md bg-secondary text-xs text-muted-foreground">
                          +{amenities.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Room types */}
                  {roomTypes.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-2">
                        <BedDouble className="h-3.5 w-3.5" />
                        Room types
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {roomTypes.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="px-2.5 py-1 rounded-full border border-border text-xs"
                          >
                            {t}
                          </span>
                        ))}
                        {roomTypes.length > 3 && (
                          <span className="px-2.5 py-1 rounded-full border border-border text-xs text-muted-foreground">
                            +{roomTypes.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-auto pt-4 border-t border-border flex items-end justify-between">
                    <div>
                      {minPrice !== null ? (
                        <>
                          <span className="text-xs text-muted-foreground">from </span>
                          <span className="text-xl font-bold text-gradient">${minPrice}</span>
                          <span className="text-sm text-muted-foreground">/night</span>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">No rooms</span>
                      )}
                    </div>
                    <Button
                      variant="hero"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(hotel.hotel_id);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
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
