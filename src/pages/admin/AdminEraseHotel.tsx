import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Search, Filter, LayoutGrid, List, MapPin, BedDouble, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchHotels, type HotelResponse } from "@/services/adminApi";
import { useToast } from "@/hooks/use-toast";
import { apiDelete } from "@/utils/api";
import ConfirmDialog from "@/components/ConfirmDialog";

const AdminEraseHotel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hotels, setHotels] = useState<HotelResponse[]>([]);
  const [search, setSearch] = useState("");
  const [eraseTarget, setEraseTarget] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [filterCity, setFilterCity] = useState("all");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    const loadHotels = async () => {
      try {
        const data = await fetchHotels();
        setHotels(data);
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load hotels",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        setIsLoaded(true);
      }
    };

    loadHotels();
  }, [toast]);

  const cities = [...new Set(hotels.map((h) => h.city).filter(Boolean))];
  const types = ["hotel", "resort", "boutique", "hostel"];

  const filtered = hotels.filter((h) => {
    const matchSearch = h.name.toLowerCase().includes(search.toLowerCase()) ||
      (h.city && h.city.toLowerCase().includes(search.toLowerCase()));
    const matchCity = filterCity === "all" || h.city === filterCity;
    const matchType = filterType === "all" || h.hotel_type === filterType;
    return matchSearch && matchCity && matchType;
  });

  const handleDelete = async () => {
    if (!eraseTarget) return;
    
    setIsDeleting(true);

    try {
      const response = await apiDelete(`/hotels/${eraseTarget}`);

      if (!response.success) {
        throw new Error(response.message || "Failed to delete hotel");
      }

      const deletedHotel = hotels.find((h) => h.hotel_id === eraseTarget);
      setHotels(hotels.filter((h) => h.hotel_id !== eraseTarget));

      toast({
        title: "Hotel Erased Successfully",
        description: `${deletedHotel?.name || "Hotel"} has been permanently removed.`,
      });

      setEraseTarget(null);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete hotel",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const targetHotel = hotels.find((h) => h.hotel_id === eraseTarget);

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

      <Card className={`border-red-200 bg-red-50 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "100ms" }}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-2">Danger Zone</h3>
              <p className="text-sm text-red-800">
                Erasing a hotel will permanently remove it from the platform along with all associated data. This action cannot be undone.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Loading hotels...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className={`space-y-3 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "180ms" }}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search hotels by name or location..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Filter className="h-4 w-4" /> Filters:</div>
              <Select value={filterCity} onValueChange={setFilterCity}>
                <SelectTrigger className="w-[150px] h-9 text-sm">
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[140px] h-9 text-sm">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {types.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="ml-auto flex gap-1">
                <Button variant={viewMode === "grid" ? "default" : "outline"} size="icon" className="h-9 w-9" onClick={() => setViewMode("grid")}>
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button variant={viewMode === "list" ? "default" : "outline"} size="icon" className="h-9 w-9" onClick={() => setViewMode("list")}>
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {viewMode === "list" && (
            <div className="space-y-3">
              {filtered.length === 0 ? (
                <Card>
                  <CardContent className="p-6">
                    <p className="text-center text-muted-foreground">No hotels found.</p>
                  </CardContent>
                </Card>
              ) : (
                filtered.map((hotel, i) => (
                  <Card key={hotel.hotel_id} className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: `${(i + 3) * 100}ms` }}>
                    <CardContent className="p-5">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl shrink-0">🏨</div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-lg">{hotel.name}</h3>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1"><MapPin className="h-4 w-4 shrink-0" /> {hotel.city || "N/A"}</span>
                              <span className="flex items-center gap-1"><BedDouble className="h-4 w-4 shrink-0" /> {hotel.hotel_type || "N/A"}</span>
                              {hotel.hotel_details?.star_rating && <span className="flex items-center gap-1"><Star className="h-4 w-4 shrink-0 text-amber-500" /> {hotel.hotel_details.star_rating} Stars</span>}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 shrink-0"
                          onClick={() => setEraseTarget(hotel.hotel_id)}
                        >
                          Erase
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.length === 0 ? (
                <Card className="md:col-span-2 lg:col-span-3">
                  <CardContent className="p-6">
                    <p className="text-center text-muted-foreground">No hotels found.</p>
                  </CardContent>
                </Card>
              ) : (
                filtered.map((hotel, i) => (
                  <Card key={hotel.hotel_id} className={`overflow-hidden ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: `${(i + 3) * 100}ms` }}>
                    <div className="h-32 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-5xl">🏨</div>
                    <CardContent className="p-5 space-y-3">
                      <h3 className="text-lg font-semibold">{hotel.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" /> {hotel.city || "N/A"}</div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground capitalize"><BedDouble className="h-4 w-4" /> {hotel.hotel_type || "N/A"}</div>
                      {hotel.hotel_details?.star_rating && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Star className="h-4 w-4 text-amber-500" /> {hotel.hotel_details.star_rating} Stars
                        </div>
                      )}
                      <div className="pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-destructive hover:bg-destructive/10"
                          onClick={() => setEraseTarget(hotel.hotel_id)}
                        >
                          Erase
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!eraseTarget}
        onOpenChange={(open) => !open && setEraseTarget(null)}
        title="Erase this hotel?"
        description={`Are you sure you want to permanently erase "${targetHotel?.name || "this hotel"}"? This action cannot be undone and will remove all associated data.`}
        confirmLabel={isDeleting ? "Erasing..." : "Yes, Erase Hotel"}
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
};

export default AdminEraseHotel;
