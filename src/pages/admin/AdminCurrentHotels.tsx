import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BedDouble, Calendar, Edit, Filter, LayoutGrid, List, MapPin, Plus, Search, Star, UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { fetchHotels, HotelResponse } from "@/services/adminApi";

const getHotelEmoji = (hotelType: string | null) => {
  const type = hotelType?.toLowerCase() || "";
  const emojiMap: Record<string, string> = {
    hotel: "🏨",
    "5-star luxury": "🏨",
    "resort": "🏖️",
    "boutique": "🏛️",
    hostel: "🧳",
    "heritage hotel": "🏛️",
    "business hotel": "🏢",
    "budget hotel": "🛏️",
  };
  return emojiMap[type] || "🏨";
};

const AdminCurrentHotels = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hotels, setHotels] = useState<HotelResponse[]>([]);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterCity, setFilterCity] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterStars, setFilterStars] = useState("all");

  useEffect(() => {
    const loadHotels = async () => {
      try {
        setIsLoading(true);
        const data = await fetchHotels({ limit: 100 });
        setHotels(data);
        setIsLoaded(true);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to load hotels";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        console.error("Error loading hotels:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHotels();
  }, [toast]);

  const filteredHotels = hotels.filter((hotel) => {
    const matchesSearch =
      hotel.name.toLowerCase().includes(search.toLowerCase()) ||
      (hotel.city?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesCity = filterCity === "all" || hotel.city === filterCity;
    const matchesType = filterType === "all" || hotel.hotel_type === filterType;
    const matchesStars = filterStars === "all" || hotel.star_rating === Number(filterStars);
    return matchesSearch && matchesCity && matchesType && matchesStars;
  });

  const cities = [...new Set(hotels.map((hotel) => hotel.city).filter(Boolean))] as string[];

  return (
    <div className="space-y-6">
      <div className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`}>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Current Hotels</h1>
          <p className="text-muted-foreground">All registered properties on the platform</p>
        </div>
        <Button variant="hero" asChild>
          <Link to="/admin/add-hotel"><Plus className="mr-2 h-4 w-4" /> Add New Hotel</Link>
        </Button>
      </div>

      <div className={`space-y-3 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "100ms" }}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search hotels by name or location..." className="pl-10" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Filter className="h-4 w-4" /> Filters:</div>
          <Select value={filterCity} onValueChange={setFilterCity}>
            <SelectTrigger className="h-9 w-[150px] text-sm"><SelectValue placeholder="City" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map((city) => <SelectItem key={city} value={city}>{city}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="h-9 w-[140px] text-sm"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="hotel">Hotel</SelectItem>
              <SelectItem value="resort">Resort</SelectItem>
              <SelectItem value="boutique">Boutique</SelectItem>
              <SelectItem value="hostel">Hostel</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStars} onValueChange={setFilterStars}>
            <SelectTrigger className="h-9 w-[140px] text-sm"><SelectValue placeholder="Stars" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stars</SelectItem>
              {[5, 4, 3, 2, 1].map((star) => <SelectItem key={star} value={String(star)}>{star} Star{star > 1 && "s"}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="ml-auto flex gap-1">
            <Button variant={viewMode === "grid" ? "default" : "outline"} size="icon" className="h-9 w-9" onClick={() => setViewMode("grid")}><LayoutGrid className="h-4 w-4" /></Button>
            <Button variant={viewMode === "list" ? "default" : "outline"} size="icon" className="h-9 w-9" onClick={() => setViewMode("list")}><List className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <p className="py-8 text-center text-muted-foreground">Loading hotels...</p>
      ) : filteredHotels.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">No hotels found matching your criteria.</p>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredHotels.map((hotel, index) => (
            <Card key={hotel.hotel_id} className={`group relative overflow-hidden transition-all duration-300 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: `${(index + 2) * 100}ms` }}>
              <div className="flex h-40 items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20 text-6xl">{getHotelEmoji(hotel.hotel_type)}</div>
              <CardContent className="space-y-3 p-5">
                <h3 className="text-lg font-semibold">{hotel.name}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" /> {hotel.city || "N/A"}</div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground"><UserCheck className="h-4 w-4" /> {hotel.owner_name || "No owner"}</div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1"><BedDouble className="h-4 w-4" /> Hotel</span>
                  <span className="flex items-center gap-1"><Star className="h-4 w-4 text-primary" /> {hotel.star_rating || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs rounded-full bg-primary/10 px-2 py-1 text-primary font-medium">{hotel.approval_status}</span>
                </div>
              </CardContent>
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/70 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
                <Button variant="hero" className="w-48" onClick={() => navigate(`/admin/update-hotel/${hotel.hotel_id}`)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit Hotel
                </Button>
                <Button variant="outline" className="w-48" onClick={() => navigate(`/admin/bookings/hotel/${hotel.hotel_id}`)}>
                  <Calendar className="mr-2 h-4 w-4" /> See All Bookings
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHotels.map((hotel, index) => (
            <Card key={hotel.hotel_id} className={`group relative overflow-hidden transition-all duration-300 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: `${(index + 2) * 100}ms` }}>
              <CardContent className="flex flex-col items-start gap-4 p-4 sm:flex-row sm:items-center">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-3xl">{getHotelEmoji(hotel.hotel_type)}</div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold">{hotel.name}</h3>
                  <p className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3 w-3" /> {hotel.city || "N/A"}</p>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><UserCheck className="h-4 w-4" /> {hotel.owner_name || "No owner"}</span>
                  <span className="flex items-center gap-1"><Star className="h-4 w-4 text-primary" /> {hotel.star_rating || "N/A"}</span>
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-primary font-medium text-xs">{hotel.approval_status}</span>
                </div>
                <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button variant="hero" size="sm" onClick={() => navigate(`/admin/update-hotel/${hotel.hotel_id}`)}>
                    <Edit className="mr-1 h-3 w-3" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/admin/bookings/hotel/${hotel.hotel_id}`)}>
                    <Calendar className="mr-1 h-3 w-3" /> Bookings
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCurrentHotels;
