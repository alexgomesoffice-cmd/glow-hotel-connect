import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Heart, MapPin, Flame, Award, ThumbsUp, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { hotels } from "@/data/hotels";

const Popular = () => {
  const navigate = useNavigate();
  const [likedHotels, setLikedHotels] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy] = useState<"rating" | "price" | "reviews">("rating");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");

  const uniqueLocations = [...new Set(hotels.map((h) => h.location))];

  const filters = [
    { id: "all", label: "All", icon: Grid },
    { id: "luxury", label: "Luxury", icon: Award },
    { id: "trending", label: "Trending", icon: Flame },
    { id: "top-rated", label: "Top Rated", icon: ThumbsUp },
  ];

  const toggleLike = (e: React.MouseEvent, hotelId: number) => {
    e.stopPropagation();
    setLikedHotels((prev) =>
      prev.includes(hotelId) ? prev.filter((id) => id !== hotelId) : [...prev, hotelId]
    );
  };

  const sortedHotels = [...hotels].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating;
      case "price":
        return a.price - b.price;
      case "reviews":
        return b.reviews - a.reviews;
      default:
        return 0;
    }
  });

  const filteredHotels = sortedHotels.filter((hotel) => {
    const passesTag = activeFilter === "all" ? true
      : activeFilter === "luxury" ? hotel.tags.includes("Luxury")
      : activeFilter === "trending" ? hotel.tags.includes("Trending")
      : activeFilter === "top-rated" ? hotel.rating >= 4.8
      : true;
    const passesLocation = locationFilter === "all" || hotel.location === locationFilter;
    return passesTag && passesLocation;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        {/* Animated Elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 left-20 w-80 h-80 bg-accent/15 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
        
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary/40 rounded-full animate-float"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 20}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          />
        ))}

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6 animate-fade-in-down">
              <Flame className="w-4 h-4 text-destructive animate-pulse" />
              <span className="text-sm font-medium text-muted-foreground">Most Popular Stays</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in-up">
              Popular <span className="text-gradient">Hotels</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              Discover the most loved accommodations chosen by travelers worldwide
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            {filters.map((filter) => (
              <Button
                key={filter.id}
                variant={activeFilter === filter.id ? "hero" : "glass"}
                size="sm"
                onClick={() => setActiveFilter(filter.id)}
                className="group transition-all duration-300 hover:scale-105"
              >
                <filter.icon className="w-4 h-4 mr-2 transition-transform group-hover:rotate-12" />
                {filter.label}
              </Button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mb-8 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Location:</span>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="bg-card border border-border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all appearance-none pr-8 cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
              >
                <option value="all">All Locations</option>
                {uniqueLocations.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className="transition-all duration-300"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="transition-all duration-300"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Hotels Grid/List */}
      <section className="pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "flex flex-col gap-6"}>
            {filteredHotels.map((hotel, index) => (
              <div
                key={hotel.id}
                onClick={() => navigate(`/hotel/${hotel.id}`)}
                className={`group relative rounded-2xl overflow-hidden bg-card border border-border transition-all duration-500 cursor-pointer animate-fade-in-up hover:border-primary/30 ${
                  viewMode === "grid" ? "hover-lift" : "flex flex-row hover:bg-card/80"
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Image */}
                <div className={`relative overflow-hidden ${viewMode === "grid" ? "aspect-[4/3]" : "w-72 h-48 flex-shrink-0"}`}>
                  <img
                    src={hotel.image}
                    alt={hotel.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Like Button */}
                  <button
                    onClick={(e) => toggleLike(e, hotel.id)}
                    className="absolute top-4 right-4 p-2.5 rounded-full glass transition-all duration-300 hover:scale-110 group/like"
                  >
                    <Heart
                      className={`h-5 w-5 transition-all duration-300 ${
                        likedHotels.includes(hotel.id)
                          ? "fill-destructive text-destructive scale-110"
                          : "text-foreground group-hover/like:text-destructive"
                      }`}
                    />
                  </button>

                  {/* Rating Badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/90 backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
                    <Star className="h-4 w-4 fill-primary-foreground text-primary-foreground" />
                    <span className="text-sm font-semibold text-primary-foreground">{hotel.rating}</span>
                  </div>

                  {/* Tags */}
                  <div className={`absolute bottom-4 left-4 flex gap-2 ${viewMode === "list" ? "hidden" : ""}`}>
                    {hotel.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2.5 py-1 rounded-full glass font-medium transition-transform duration-300 hover:scale-105"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className={`p-5 ${viewMode === "list" ? "flex-1 flex flex-col justify-between" : ""}`}>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                      {hotel.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-muted-foreground mb-3">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{hotel.location}</span>
                    </div>
                    {viewMode === "list" && (
                      <div className="flex gap-2 mb-3">
                        {hotel.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
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

                {/* Hover Overlay - Grid only */}
                {viewMode === "grid" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Button variant="hero" size="lg" className="transform scale-90 group-hover:scale-100 transition-transform duration-300">
                      View Details
                    </Button>
                  </div>
                )}

                {/* Animated Border */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary/20 transition-colors pointer-events-none overflow-hidden">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredHotels.length === 0 && (
            <div className="text-center py-16 animate-fade-in">
              <p className="text-xl text-muted-foreground mb-4">No hotels match your filters</p>
              <Button variant="ghost" onClick={() => setActiveFilter("all")}>
                Clear filters
              </Button>
            </div>
          )}

          {/* Load More */}
          <div className="text-center mt-12 animate-fade-in-up" style={{ animationDelay: "500ms" }}>
            <Button variant="hero" size="lg" className="group">
              Load More Hotels
              <span className="ml-2 transition-transform group-hover:translate-y-1">↓</span>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Popular;
