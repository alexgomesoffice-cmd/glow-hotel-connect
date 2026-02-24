import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Heart, MapPin, LayoutGrid, List, ArrowUpDown, MapPinned } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hotels } from "@/data/hotels";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HotelFilterSidebar from "@/components/HotelFilterSidebar";

const ExploreHotels = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [likedHotels, setLikedHotels] = useState<number[]>([]);
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => { setIsLoaded(true); }, []);

  const toggleLike = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setLikedHotels((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Header */}
        <div className={`mb-8 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`}>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Explore All <span className="text-gradient">Hotels</span></h1>
          <p className="text-muted-foreground">Discover {hotels.length} amazing stays worldwide</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter Sidebar */}
          <div className={`${isLoaded ? "animate-fade-in-left" : "opacity-0"}`} style={{ animationDelay: "100ms" }}>
            <HotelFilterSidebar />
          </div>

          {/* Main content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className={`flex items-center justify-between mb-6 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "150ms" }}>
              <span className="text-sm text-muted-foreground">{hotels.length} hotels found</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <MapPinned className="h-4 w-4" /> See Location
                </Button>
                <Button variant={view === "grid" ? "default" : "outline"} size="icon" className="h-9 w-9" onClick={() => setView("grid")}>
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button variant={view === "list" ? "default" : "outline"} size="icon" className="h-9 w-9" onClick={() => setView("list")}>
                  <List className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <ArrowUpDown className="h-4 w-4" /> Sort by
                </Button>
              </div>
            </div>

            {/* Hotels */}
            <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
              {hotels.map((hotel, index) => (
                <div
                  key={hotel.id}
                  onClick={() => navigate(`/hotel/${hotel.id}`)}
                  className={`group relative rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/30 transition-all duration-500 cursor-pointer hover:scale-[1.02] hover:-translate-y-2 ${isLoaded ? "animate-fade-in-up" : "opacity-0"} ${view === "list" ? "flex" : ""}`}
                  style={{ animationDelay: `${(index + 2) * 80}ms` }}
                >
                  <div className={`relative overflow-hidden ${view === "list" ? "w-72 shrink-0" : "aspect-[4/3]"}`}>
                    <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" />
                    <button onClick={(e) => toggleLike(e, hotel.id)} className="absolute top-4 right-4 p-2.5 rounded-full glass transition-all duration-300 hover:scale-125 z-10">
                      <Heart className={`h-5 w-5 transition-all ${likedHotels.includes(hotel.id) ? "fill-destructive text-destructive" : "text-foreground hover:text-destructive"}`} />
                    </button>
                    <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/90 backdrop-blur-sm z-10">
                      <Star className="h-4 w-4 fill-primary-foreground text-primary-foreground" />
                      <span className="text-sm font-semibold text-primary-foreground">{hotel.rating}</span>
                    </div>
                  </div>
                  <div className="p-5 flex-1">
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">{hotel.name}</h3>
                    <div className="flex items-center gap-1.5 text-muted-foreground mb-3">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{hotel.location}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {hotel.tags.map((tag) => (
                        <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">{tag}</span>
                      ))}
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-2xl font-bold text-gradient">${hotel.price}</span>
                        <span className="text-sm text-muted-foreground">/night</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{hotel.reviews.toLocaleString()} reviews</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ExploreHotels;
