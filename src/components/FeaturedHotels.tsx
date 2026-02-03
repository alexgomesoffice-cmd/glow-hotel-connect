import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Heart, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hotels } from "@/data/hotels";

const FeaturedHotels = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [likedHotels, setLikedHotels] = useState<number[]>([]);
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
        <div className="text-center mb-12">
          <h2
            className={`text-3xl sm:text-4xl font-bold mb-3 ${
              isVisible ? "animate-fade-in-up" : "opacity-0"
            }`}
          >
            Hotels loved by <span className="text-gradient">guests</span>
          </h2>
          <p
            className={`text-muted-foreground max-w-lg mx-auto ${
              isVisible ? "animate-fade-in-up" : "opacity-0"
            }`}
            style={{ animationDelay: "100ms" }}
          >
            Top-rated stays with exceptional reviews and unforgettable experiences
          </p>
        </div>

        {/* Hotels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {hotels.map((hotel, index) => (
            <div
              key={hotel.id}
              onClick={() => handleCardClick(hotel.id)}
              className={`group relative rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/30 transition-all duration-500 hover-lift cursor-pointer ${
                isVisible ? "animate-fade-in-up" : "opacity-0"
              }`}
              style={{ animationDelay: `${(index + 2) * 100}ms` }}
            >
              {/* Image Container */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Like Button */}
                <button
                  onClick={(e) => toggleLike(e, hotel.id)}
                  className="absolute top-4 right-4 p-2.5 rounded-full glass transition-all duration-300 hover:scale-110"
                >
                  <Heart
                    className={`h-5 w-5 transition-colors ${
                      likedHotels.includes(hotel.id)
                        ? "fill-destructive text-destructive"
                        : "text-foreground"
                    }`}
                  />
                </button>

                {/* Rating Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/90 backdrop-blur-sm">
                  <Star className="h-4 w-4 fill-primary-foreground text-primary-foreground" />
                  <span className="text-sm font-semibold text-primary-foreground">
                    {hotel.rating}
                  </span>
                </div>

                {/* Tags */}
                <div className="absolute bottom-4 left-4 flex gap-2">
                  {hotel.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2.5 py-1 rounded-full glass font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-1">
                  {hotel.name}
                </h3>
                <div className="flex items-center gap-1.5 text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{hotel.location}</span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-2xl font-bold text-gradient">${hotel.price}</span>
                    <span className="text-sm text-muted-foreground">/night</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {hotel.reviews.toLocaleString()} reviews
                  </span>
                </div>
              </div>

              {/* View Details Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button variant="hero" size="lg">
                  View Details
                </Button>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/20 rounded-2xl transition-colors pointer-events-none" />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          className={`text-center mt-12 ${
            isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
          style={{ animationDelay: "700ms" }}
        >
          <Button variant="hero" size="lg">
            Explore all hotels
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedHotels;
