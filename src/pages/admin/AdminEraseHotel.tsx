import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, AlertTriangle, Search, Filter, LayoutGrid, List, MapPin, BedDouble, Star, UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const initialHotels = [
  { id: 1, name: "Grand Palace Hotel", location: "Dhaka", hotelSystemAdmin: "Maria Garcia", rooms: 120, rating: 4.8, type: "hotel", stars: 5, image: "🏨" },
  { id: 2, name: "Seaside Resort", location: "Cox's Bazar", hotelSystemAdmin: "John Smith", rooms: 85, rating: 4.6, type: "resort", stars: 4, image: "🏖️" },
  { id: 3, name: "Mountain Lodge", location: "Sylhet", hotelSystemAdmin: "Sarah Lee", rooms: 45, rating: 4.9, type: "boutique", stars: 5, image: "🏔️" },
  { id: 4, name: "Urban Suites", location: "Chittagong", hotelSystemAdmin: "Maria Garcia", rooms: 60, rating: 4.5, type: "hotel", stars: 3, image: "🏢" },
];

const AdminEraseHotel = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [hotels, setHotels] = useState(initialHotels);
  const [search, setSearch] = useState("");
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [filterCity, setFilterCity] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterStars, setFilterStars] = useState("all");

  useEffect(() => { setIsLoaded(true); }, []);

  const cities = [...new Set(initialHotels.map((h) => h.location))];

  const filtered = hotels.filter((h) => {
    const matchSearch = h.name.toLowerCase().includes(search.toLowerCase()) || h.location.toLowerCase().includes(search.toLowerCase());
    const matchCity = filterCity === "all" || h.location === filterCity;
    const matchType = filterType === "all" || h.type === filterType;
    const matchStars = filterStars === "all" || h.stars === Number(filterStars);
    return matchSearch && matchCity && matchType && matchStars;
  });

  const handleDelete = (id: number) => {
    const hotel = hotels.find((h) => h.id === id);
    setHotels(hotels.filter((h) => h.id !== id));
    setConfirmId(null);
    toast({ title: "Hotel Erased", description: `${hotel?.name} has been permanently removed.` });
  };

  return (
    <div className="space-y-6">
      <div className={`flex items-center gap-4 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`}>
        <Button variant="outline" size="icon" onClick={() => navigate("/admin/hotels")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Erase Hotel</h1>
          <p className="text-muted-foreground">Permanently remove a property from the platform</p>
        </div>
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

      {/* List View */}
      {viewMode === "list" && (
        <div className="space-y-3">
          {filtered.map((hotel, i) => (
            <Card key={hotel.id} className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: `${(i + 2) * 100}ms` }}>
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl shrink-0">{hotel.image}</div>
                    <div>
                      <h3 className="font-semibold text-lg">{hotel.name}</h3>
                      <p className="text-sm text-muted-foreground">{hotel.location} · {hotel.rooms} rooms · Admin: {hotel.hotelSystemAdmin}</p>
                    </div>
                  </div>
                  {confirmId === hotel.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-destructive flex items-center gap-1"><AlertTriangle className="h-4 w-4" /> Confirm?</span>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(hotel.id)}>Yes, Erase</Button>
                      <Button variant="outline" size="sm" onClick={() => setConfirmId(null)}>Cancel</Button>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => setConfirmId(hotel.id)}>
                      <Trash2 className="h-4 w-4 mr-2" /> Erase
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((hotel, i) => (
            <Card key={hotel.id} className={`overflow-hidden ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: `${(i + 2) * 100}ms` }}>
              <div className="h-32 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-5xl">{hotel.image}</div>
              <CardContent className="p-5 space-y-3">
                <h3 className="text-lg font-semibold">{hotel.name}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" /> {hotel.location}</div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground"><UserCheck className="h-4 w-4" /> {hotel.hotelSystemAdmin}</div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1"><BedDouble className="h-4 w-4" /> {hotel.rooms} rooms</span>
                  <span className="flex items-center gap-1"><Star className="h-4 w-4 text-amber-500" /> {hotel.rating}</span>
                </div>
                <div className="pt-2">
                  {confirmId === hotel.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-destructive flex items-center gap-1"><AlertTriangle className="h-4 w-4" /> Confirm?</span>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(hotel.id)}>Yes</Button>
                      <Button variant="outline" size="sm" onClick={() => setConfirmId(null)}>No</Button>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" className="w-full text-destructive hover:bg-destructive/10" onClick={() => setConfirmId(hotel.id)}>
                      <Trash2 className="h-4 w-4 mr-2" /> Erase
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No hotels found.</p>
      )}
    </div>
  );
};

export default AdminEraseHotel;
