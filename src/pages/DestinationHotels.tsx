import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Heart, MapPin, LayoutGrid, List, ArrowLeft, Search, Filter, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { hotels } from "@/data/hotels";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import barcelonaImg from "@/assets/destinations/barcelona.jpg";
import londonImg from "@/assets/destinations/london.jpg";
import tokyoImg from "@/assets/destinations/tokyo.jpg";
import dubaiImg from "@/assets/destinations/dubai.jpg";
import parisImg from "@/assets/destinations/paris.jpg";

const destinationMeta: Record<string, { image: string; description: string; country: string }> = {
  barcelona: { image: barcelonaImg, description: "Gothic quarters, Gaudí masterpieces, and Mediterranean beaches", country: "Spain" },
  london: { image: londonImg, description: "Royal palaces, world-class museums, and iconic landmarks", country: "United Kingdom" },
  tokyo: { image: tokyoImg, description: "Ancient temples, neon-lit streets, and culinary excellence", country: "Japan" },
  dubai: { image: dubaiImg, description: "Futuristic architecture, luxury shopping, and desert adventures", country: "UAE" },
  paris: { image: parisImg, description: "Romantic ambiance, art galleries, and exquisite cuisine", country: "France" },
  "new york": { image: barcelonaImg, description: "The city that never sleeps with endless entertainment", country: "USA" },
  sydney: { image: londonImg, description: "Stunning harbor views and beautiful beaches", country: "Australia" },
  rome: { image: parisImg, description: "Ancient ruins, Renaissance art, and authentic Italian cuisine", country: "Italy" },
};

const DestinationHotels = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("recommended");
  const [priceFilter, setPriceFilter] = useState("all");
  const [likedHotels, setLikedHotels] = useState<number[]>([]);

  useEffect(() => { setIsLoaded(true); }, []);

  const destinationName = name ? decodeURIComponent(name).replace(/-/g, " ") : "";
  const meta = destinationMeta[destinationName.toLowerCase()];

  // Filter hotels that match this destination's location (fuzzy match on city name)
  const destinationHotels = hotels.filter((h) => {
    const loc = h.location.toLowerCase();
    const dest = destinationName.toLowerCase();
    return loc.includes(dest) || dest.includes(loc.split(",")[0].trim());
  });

  // If no exact match, show all hotels as "available in this destination"
  const displayHotels = destinationHotels.length > 0 ? destinationHotels : hotels;

  const filteredHotels = displayHotels
    .filter((h) => h.name.toLowerCase().includes(search.toLowerCase()))
    .filter((h) => {
      if (priceFilter === "budget") return h.price < 200;
      if (priceFilter === "mid") return h.price >= 200 && h.price < 400;
      if (priceFilter === "luxury") return h.price >= 400;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0;
    });

  const toggleLike = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setLikedHotels((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const displayName = destinationName.charAt(0).toUpperCase() + destinationName.slice(1);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Banner */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        {meta?.image && (
          <div className="absolute inset-0">
            <img src={meta.image} alt={displayName} className="w-full h-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
          </div>
        )}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Button variant="ghost" size="sm" className="mb-4 gap-2" onClick={() => navigate("/destinations")}>
            <ArrowLeft className="h-4 w-4" /> All Destinations
          </Button>
          <h1 className={`text-4xl sm:text-5xl font-bold mb-3 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`}>
            Hotels in <span className="text-gradient">{displayName}</span>
          </h1>
          {meta && (
            <p className={`text-lg text-muted-foreground max-w-2xl mb-2 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "100ms" }}>
              {meta.description}
            </p>
          )}
          <p className={`text-sm text-muted-foreground ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "150ms" }}>
            {filteredHotels.length} hotels available
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
        <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
          {filteredHotels.map((hotel, index) => (
            <div
              key={hotel.id}
              onClick={() => navigate(`/hotel/${hotel.id}`)}
              className={`group relative rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/30 transition-all duration-500 cursor-pointer hover:scale-[1.02] hover:-translate-y-2 ${isLoaded ? "animate-fade-in-up" : "opacity-0"} ${view === "list" ? "flex flex-col sm:flex-row" : ""}`}
              style={{ animationDelay: `${(index + 3) * 80}ms` }}
            >
              <div className={`relative overflow-hidden ${view === "list" ? "w-full sm:w-72 shrink-0 aspect-[16/10] sm:aspect-auto sm:h-auto" : "aspect-[4/3]"}`}>
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

        {filteredHotels.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <p className="text-xl text-muted-foreground mb-4">No hotels found</p>
            <Button variant="ghost" onClick={() => { setSearch(""); setPriceFilter("all"); }}>Clear filters</Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default DestinationHotels;
