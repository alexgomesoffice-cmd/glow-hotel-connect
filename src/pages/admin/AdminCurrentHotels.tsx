import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BedDouble, Calendar, Edit, Filter, LayoutGrid, List, MapPin, Plus, Search, Star, UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminData } from "@/data/adminStore";

const AdminCurrentHotels = () => {
  const navigate = useNavigate();
  const { data } = useAdminData();
  const [isLoaded, setIsLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterCity, setFilterCity] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterStars, setFilterStars] = useState("all");

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const filteredHotels = data.hotels.filter((hotel) => {
    const matchesSearch =
      hotel.name.toLowerCase().includes(search.toLowerCase()) ||
      hotel.location.toLowerCase().includes(search.toLowerCase());
    const matchesCity = filterCity === "all" || hotel.location === filterCity;
    const matchesType = filterType === "all" || hotel.type === filterType;
    const matchesStars = filterStars === "all" || hotel.stars === Number(filterStars);
    return matchesSearch && matchesCity && matchesType && matchesStars;
  });

  const cities = [...new Set(data.hotels.map((hotel) => hotel.location))];

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

      {viewMode === "grid" && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredHotels.map((hotel, index) => (
            <Card key={hotel.id} className={`group relative overflow-hidden transition-all duration-300 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: `${(index + 2) * 100}ms` }}>
              <div className="flex h-40 items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20 text-6xl">{hotel.image}</div>
              <CardContent className="space-y-3 p-5">
                <h3 className="text-lg font-semibold">{hotel.name}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" /> {hotel.location}</div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground"><UserCheck className="h-4 w-4" /> Admin: {hotel.adminName}</div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1"><BedDouble className="h-4 w-4" /> {hotel.rooms.length} rooms</span>
                  <span className="flex items-center gap-1"><Star className="h-4 w-4 text-primary" /> {hotel.rating}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-primary">{hotel.occupancy}% occupied</span>
                </div>
              </CardContent>
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/70 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
                <Button variant="hero" className="w-48" onClick={() => navigate(`/admin/update-hotel/${hotel.id}`)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit Hotel
                </Button>
                <Button variant="outline" className="w-48" onClick={() => navigate(`/admin/bookings/hotel/${hotel.id}`)}>
                  <Calendar className="mr-2 h-4 w-4" /> See All Bookings
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {viewMode === "list" && (
        <div className="space-y-3">
          {filteredHotels.map((hotel, index) => (
            <Card key={hotel.id} className={`group relative overflow-hidden transition-all duration-300 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: `${(index + 2) * 100}ms` }}>
              <CardContent className="flex flex-col items-start gap-4 p-4 sm:flex-row sm:items-center">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-3xl">{hotel.image}</div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold">{hotel.name}</h3>
                  <p className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3 w-3" /> {hotel.location}</p>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><UserCheck className="h-4 w-4" /> {hotel.adminName}</span>
                  <span className="flex items-center gap-1"><BedDouble className="h-4 w-4" /> {hotel.rooms.length}</span>
                  <span className="flex items-center gap-1"><Star className="h-4 w-4 text-primary" /> {hotel.rating}</span>
                  <span className="font-medium text-primary">{hotel.occupancy}%</span>
                </div>
                <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button variant="hero" size="sm" onClick={() => navigate(`/admin/update-hotel/${hotel.id}`)}>
                    <Edit className="mr-1 h-3 w-3" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/admin/bookings/hotel/${hotel.id}`)}>
                    <Calendar className="mr-1 h-3 w-3" /> Bookings
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredHotels.length === 0 && <p className="py-8 text-center text-muted-foreground">No hotels found matching your criteria.</p>}
    </div>
  );
};

export default AdminCurrentHotels;
