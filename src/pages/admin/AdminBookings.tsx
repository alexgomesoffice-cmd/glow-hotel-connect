import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Filter, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { fetchHotels, fetchBookings, HotelResponse, BookingResponse } from "@/services/adminApi";

const AdminBookings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hotels, setHotels] = useState<HotelResponse[]>([]);
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [search, setSearch] = useState("");
  const [filterCity, setFilterCity] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterStars, setFilterStars] = useState("all");

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [hotelsData, bookingsData] = await Promise.all([
          fetchHotels(),
          fetchBookings()
        ]);
        setHotels(hotelsData);
        setBookings(bookingsData);
        setIsLoaded(true);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to load bookings";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast]);

  const cities = [...new Set(hotels.map((hotel) => hotel.city))].filter(Boolean);
  const bookingCountByHotel = useMemo(
    () =>
      bookings.reduce<Record<string, number>>((accumulator, booking) => {
        accumulator[booking.room_id] = (accumulator[booking.room_id] || 0) + 1;
        return accumulator;
      }, {}),
    [bookings],
  );

  const filteredHotels = hotels.filter((hotel) => {
    const matchesSearch = hotel.name.toLowerCase().includes(search.toLowerCase());
    const matchesCity = filterCity === "all" || hotel.city === filterCity;
    const matchesType = filterType === "all" || hotel.hotel_type === filterType;
    const matchesStars = filterStars === "all" || hotel.hotel_details?.star_rating === Number(filterStars);
    return matchesSearch && matchesCity && matchesType && matchesStars;
  });

  return (
    <div className="space-y-6">
      <div className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`}>
        <h1 className="text-2xl sm:text-3xl font-bold">Hotel Booking List</h1>
        <p className="text-muted-foreground">Search by hotel, then open a hotel to see user booking history with detailed filters.</p>
      </div>

      <div className={`space-y-3 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "100ms" }}>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by hotel name..." className="pl-10" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" /> Filters:
          </div>
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
        </div>
      </div>

      <Card className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "200ms" }}>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>Loading hotels and bookings...</p>
            </div>
          ) : filteredHotels.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No hotels found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hotel</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead className="hidden md:table-cell">Type</TableHead>
                  <TableHead className="hidden md:table-cell">Stars</TableHead>
                  <TableHead>Total Bookings</TableHead>
                  <TableHead className="hidden lg:table-cell">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHotels.map((hotel) => (
                  <TableRow
                    key={hotel.hotel_id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/admin/bookings/hotel/${hotel.hotel_id}`)}
                  >
                    <TableCell className="font-medium text-primary">{hotel.name}</TableCell>
                    <TableCell>{hotel.city}</TableCell>
                    <TableCell className="hidden md:table-cell capitalize text-muted-foreground">{hotel.hotel_type}</TableCell>
                    <TableCell className="hidden md:table-cell">{hotel.hotel_details?.star_rating ?? "N/A"} ⭐</TableCell>
                    <TableCell>{bookingCountByHotel[hotel.hotel_id] || 0}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className={`text-xs px-2 py-1 rounded-full ${hotel.approval_status === "approved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {hotel.approval_status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {!isLoading && filteredHotels.length === 0 && <p className="py-8 text-center text-muted-foreground">No hotels found.</p>}
    </div>
  );
};

export default AdminBookings;
