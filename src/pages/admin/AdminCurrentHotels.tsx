import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, MapPin, Star, BedDouble, Search, LayoutGrid, List, Filter, UserCheck, Edit, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";

const mockHotels = [
  { id: 1, name: "Grand Palace Hotel", location: "Dhaka", rooms: 120, rating: 4.8, occupancy: 87, type: "hotel", stars: 5, hotelSystemAdmin: "Maria Garcia", image: "🏨" },
  { id: 2, name: "Seaside Resort", location: "Cox's Bazar", rooms: 85, rating: 4.6, occupancy: 72, type: "resort", stars: 4, hotelSystemAdmin: "John Smith", image: "🏖️" },
  { id: 3, name: "Mountain Lodge", location: "Sylhet", rooms: 45, rating: 4.9, occupancy: 91, type: "boutique", stars: 5, hotelSystemAdmin: "Sarah Lee", image: "🏔️" },
  { id: 4, name: "Urban Suites", location: "Chittagong", rooms: 60, rating: 4.5, occupancy: 68, type: "hotel", stars: 3, hotelSystemAdmin: "Maria Garcia", image: "🏢" },
];

const AdminCurrentHotels = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterCity, setFilterCity] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterStars, setFilterStars] = useState("all");

  useEffect(() => { setIsLoaded(true); }, []);

  const filtered = mockHotels.filter((h) => {
    const matchSearch = h.name.toLowerCase().includes(search.toLowerCase()) || h.location.toLowerCase().includes(search.toLowerCase());
    const matchCity = filterCity === "all" || h.location === filterCity;
    const matchType = filterType === "all" || h.type === filterType;
    const matchStars = filterStars === "all" || h.stars === Number(filterStars);
    return matchSearch && matchCity && matchType && matchStars;
  });

  const cities = [...new Set(mockHotels.map((h) => h.location))];

  return (
    <div className="space-y-6">
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`}>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Current Hotels</h1>
          <p className="text-muted-foreground">All registered properties on the platform</p>
        </div>
        <Button variant="hero" asChild>
          <Link to="/admin/add-hotel"><Plus className="h-4 w-4 mr-2" /> Add New Hotel</Link>
        </Button>
      </div>

      {/* Search & Filters */}
      <div className={`space-y-3 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "100ms" }}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search hotels by name or location..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Filter className="h-4 w-4" /> Filters:</div>
          <Select value={filterCity} onValueChange={setFilterCity}>
            <SelectTrigger className="w-[150px] h-9 text-sm"><SelectValue placeholder="City" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px] h-9 text-sm"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="hotel">Hotel</SelectItem>
              <SelectItem value="resort">Resort</SelectItem>
              <SelectItem value="boutique">Boutique</SelectItem>
              <SelectItem value="hostel">Hostel</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStars} onValueChange={setFilterStars}>
            <SelectTrigger className="w-[140px] h-9 text-sm"><SelectValue placeholder="Stars" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stars</SelectItem>
              {[5, 4, 3, 2, 1].map((s) => <SelectItem key={s} value={String(s)}>{s} Star{s > 1 && "s"}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="ml-auto flex gap-1">
            <Button variant={viewMode === "grid" ? "default" : "outline"} size="icon" className="h-9 w-9" onClick={() => setViewMode("grid")}><LayoutGrid className="h-4 w-4" /></Button>
            <Button variant={viewMode === "list" ? "default" : "outline"} size="icon" className="h-9 w-9" onClick={() => setViewMode("list")}><List className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((hotel, i) => (
            <Card
              key={hotel.id}
              className={`overflow-hidden transition-all duration-300 group relative ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: `${(i + 2) * 100}ms` }}
            >
              <div className="h-40 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-6xl">
                {hotel.image}
              </div>
              <CardContent className="p-5 space-y-3">
                <h3 className="text-lg font-semibold">{hotel.name}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" /> {hotel.location}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <UserCheck className="h-4 w-4" /> Admin: {hotel.hotelSystemAdmin}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1"><BedDouble className="h-4 w-4" /> {hotel.rooms} rooms</span>
                  <span className="flex items-center gap-1"><Star className="h-4 w-4 text-amber-500" /> {hotel.rating}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-500">{hotel.occupancy}% occupied</span>
                </div>
              </CardContent>
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-background/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3 z-10">
                <Button variant="hero" className="w-48" onClick={() => navigate(`/admin/update-hotel/${hotel.id}`)}>
                  <Edit className="h-4 w-4 mr-2" /> Edit Hotel
                </Button>
                <Button variant="outline" className="w-48" onClick={() => navigate(`/admin/bookings?hotel=${hotel.id}`)}>
                  <Calendar className="h-4 w-4 mr-2" /> See All Bookings
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="space-y-3">
          {filtered.map((hotel, i) => (
            <Card
              key={hotel.id}
              className={`overflow-hidden transition-all duration-300 group relative ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: `${(i + 2) * 100}ms` }}
            >
              <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-3xl shrink-0">
                  {hotel.image}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">{hotel.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {hotel.location}</p>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><UserCheck className="h-4 w-4" /> {hotel.hotelSystemAdmin}</span>
                  <span className="flex items-center gap-1"><BedDouble className="h-4 w-4" /> {hotel.rooms}</span>
                  <span className="flex items-center gap-1"><Star className="h-4 w-4 text-amber-500" /> {hotel.rating}</span>
                  <span className="text-green-500 font-medium">{hotel.occupancy}%</span>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="hero" size="sm" onClick={() => navigate(`/admin/update-hotel/${hotel.id}`)}>
                    <Edit className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/admin/bookings?hotel=${hotel.id}`)}>
                    <Calendar className="h-3 w-3 mr-1" /> Bookings
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No hotels found matching your criteria.</p>
      )}
    </div>
  );
};

export default AdminCurrentHotels;
