import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Heart, MapPin, LayoutGrid, List, ArrowLeft, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiGet } from "@/utils/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Hotel {
  hotel_id: number;
  name: string;
  city: string;
  email?: string;
  address?: string;
  hotel_type?: string;
  owner_name?: string;
  star_rating?: number;
  guest_rating?: number;
  description?: string;
  images?: Array<{ image_url: string; is_cover?: boolean }>;
  hotel_images?: Array<{ image_url: string; is_cover: boolean }>;
  hotel_details?: {
    star_rating?: string | number;
    description?: string;
  };
}

interface City {
  id: number;
  name: string;
  image_url: string | null;
}

const DestinationHotels = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoadingHotels, setIsLoadingHotels] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("recommended");
  const [priceFilter, setPriceFilter] = useState("all");
  const [likedHotels, setLikedHotels] = useState<number[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [cityImage, setCityImage] = useState<string | null>(null);

  const destinationName = name ? decodeURIComponent(name).replace(/-/g, " ") : "";

  // Helper function to get cover image or first image
  const getCoverImage = (hotel: Hotel): string | null => {
    const allImages = hotel.hotel_images || hotel.images || [];
    
    // Find cover image first
    const coverImage = allImages.find(img => img.is_cover);
    if (coverImage) return coverImage.image_url;
    
    // Fall back to first image
    if (allImages.length > 0) return allImages[0].image_url;
    
    return null;
  };

  const fetchCityImage = useCallback(async () => {
    try {
      const response = await apiGet("/cities");
      if (response.success && response.data) {
        const city = response.data.find(
          (c: City) => c.name.toLowerCase() === destinationName.toLowerCase()
        );
        if (city?.image_url) {
          setCityImage(city.image_url);
        }
      }
    } catch (error) {
      console.error("Failed to fetch city image:", error);
    }
  }, [destinationName]);

  const fetchHotels = useCallback(async () => {
    try {
      setIsLoadingHotels(true);
      const response = await apiGet("/hotels");
      if (response.success && response.data) {
        // Handle both response formats: direct array or nested under .data.hotels
        const hotelsData = Array.isArray(response.data) ? response.data : (response.data?.hotels || []);
        
        // Filter hotels by city - normalize the comparison
        const normalizedDestinationName = destinationName.toLowerCase().trim();
        console.log("Looking for hotels in city:", normalizedDestinationName);
        console.log("Available cities:", hotelsData.map((h: Hotel) => h.city?.toLowerCase()));
        
        const filteredByCity = hotelsData.filter((h: Hotel) => {
          const hotelCity = h.city?.toLowerCase().trim();
          return hotelCity === normalizedDestinationName;
        });
        
        console.log("Filtered hotels:", filteredByCity);
        setHotels(filteredByCity);
      }
    } catch (error) {
      console.error("Failed to fetch hotels:", error);
    } finally {
      setIsLoadingHotels(false);
    }
  }, [destinationName]);

  useEffect(() => {
    setIsLoaded(true);
    fetchCityImage();
    fetchHotels();
  }, [fetchCityImage, fetchHotels]);

  const filteredHotels = hotels
    .filter((h) => h.name.toLowerCase().includes(search.toLowerCase()))
    .filter((h) => {
      if (priceFilter === "budget") return true; // Hotels from API don't have price field
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "rating") return (b.guest_rating || 0) - (a.star_rating || 0);
      return 0;
    });

  const toggleLike = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setLikedHotels((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const displayName =
    destinationName.charAt(0).toUpperCase() + destinationName.slice(1);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Banner */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        {cityImage && (
          <div className="absolute inset-0">
            <img src={cityImage} alt={displayName} className="w-full h-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
          </div>
        )}
        {!cityImage && <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Button variant="ghost" size="sm" className="mb-4 gap-2" onClick={() => navigate("/destinations")}>
            <ArrowLeft className="h-4 w-4" /> All Destinations
          </Button>
          <h1 className={`text-4xl sm:text-5xl font-bold mb-3 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`}>
            Hotels in <span className="text-gradient">{displayName}</span>
          </h1>
          <p className={`text-lg text-muted-foreground max-w-2xl mb-2 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "100ms" }}>
            Discover the best hotels in {displayName}
          </p>
          <p className={`text-sm text-muted-foreground ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "150ms" }}>
            {isLoadingHotels ? "Loading hotels..." : `${filteredHotels.length} hotels available`}
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* Toolbar */}
        <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-8 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "200ms" }}>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search hotels..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Filter className="h-4 w-4" /></div>
            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger className="h-9 w-[140px] text-sm"><SelectValue placeholder="Price" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="budget">Under $200</SelectItem>
                <SelectItem value="mid">$200 - $400</SelectItem>
                <SelectItem value="luxury">$400+</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-9 w-[160px] text-sm"><SelectValue placeholder="Sort" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-1">
              <Button variant={view === "grid" ? "default" : "outline"} size="icon" className="h-9 w-9" onClick={() => setView("grid")}><LayoutGrid className="h-4 w-4" /></Button>
              <Button variant={view === "list" ? "default" : "outline"} size="icon" className="h-9 w-9" onClick={() => setView("list")}><List className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>

        {/* Hotels Grid/List */}
        {isLoadingHotels ? (
          <div className="flex justify-center items-center py-20">
            <p className="text-muted-foreground">Loading hotels...</p>
          </div>
        ) : filteredHotels.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <p className="text-xl text-muted-foreground mb-4">No hotels found in {displayName}</p>
            <Button variant="ghost" onClick={() => setSearch("")}>
              Clear search
            </Button>
          </div>
        ) : (
          <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
            {filteredHotels.map((hotel, index) => (
              <div
                key={hotel.hotel_id}
                onClick={() => navigate(`/hotel/${hotel.hotel_id}`)}
                className={`group relative rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/30 transition-all duration-500 cursor-pointer hover:scale-[1.02] hover:-translate-y-2 ${
                  isLoaded ? "animate-fade-in-up" : "opacity-0"
                } ${view === "list" ? "flex flex-col sm:flex-row" : ""}`}
                style={{ animationDelay: `${(index + 3) * 80}ms` }}
              >
                <div
                  className={`relative overflow-hidden ${
                    view === "list"
                      ? "w-full sm:w-72 shrink-0 aspect-[16/10] sm:aspect-auto sm:h-64"
                      : "aspect-[4/3]"
                  } bg-muted`}
                >
                  {(() => {
                    const coverImageUrl = getCoverImage(hotel);
                    return coverImageUrl ? (
                      <img
                        src={coverImageUrl}
                        alt={hotel.name}
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <span className="text-muted-foreground">No image</span>
                      </div>
                    );
                  })()}
                  <button
                    onClick={(e) => toggleLike(e, hotel.hotel_id)}
                    className="absolute top-4 right-4 p-2.5 rounded-full glass transition-all duration-300 hover:scale-125 z-10"
                  >
                    <Heart
                      className={`h-5 w-5 transition-all ${
                        likedHotels.includes(hotel.hotel_id)
                          ? "fill-destructive text-destructive"
                          : "text-foreground hover:text-destructive"
                      }`}
                    />
                  </button>
                  {(hotel.star_rating || hotel.guest_rating || hotel.hotel_details?.star_rating) && (
                    <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/90 backdrop-blur-sm z-10">
                      <Star className="h-4 w-4 fill-primary-foreground text-primary-foreground" />
                      <span className="text-sm font-semibold text-primary-foreground">
                        {Number(hotel.guest_rating || hotel.star_rating || hotel.hotel_details?.star_rating || 0).toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-5 flex-1">
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                    {hotel.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-3">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{hotel.city}</span>
                  </div>
                  {(hotel.description || hotel.hotel_details?.description) && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {hotel.description || hotel.hotel_details?.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {hotel.hotel_type && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
                        {hotel.hotel_type}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default DestinationHotels;
