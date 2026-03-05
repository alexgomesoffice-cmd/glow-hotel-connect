import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Filter, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminData } from "@/data/adminStore";

const AdminBookings = () => {
  const navigate = useNavigate();
  const { data } = useAdminData();
  const [isLoaded, setIsLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCity, setFilterCity] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterStars, setFilterStars] = useState("all");

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const cities = [...new Set(data.hotels.map((hotel) => hotel.location))];
  const bookingCountByHotel = useMemo(
    () =>
      data.bookings.reduce<Record<number, number>>((accumulator, booking) => {
        accumulator[booking.hotelId] = (accumulator[booking.hotelId] || 0) + 1;
        return accumulator;
      }, {}),
    [data.bookings],
  );

  const filteredHotels = data.hotels.filter((hotel) => {
    const matchesSearch = hotel.name.toLowerCase().includes(search.toLowerCase());
    const matchesCity = filterCity === "all" || hotel.location === filterCity;
    const matchesType = filterType === "all" || hotel.type === filterType;
    const matchesStars = filterStars === "all" || hotel.stars === Number(filterStars);
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hotel</TableHead>
                <TableHead>City</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead className="hidden md:table-cell">Stars</TableHead>
                <TableHead className="hidden lg:table-cell">Rooms</TableHead>
                <TableHead>Total Bookings</TableHead>
                <TableHead className="hidden lg:table-cell">Hotel Admin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHotels.map((hotel) => (
                <TableRow
                  key={hotel.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/admin/bookings/hotel/${hotel.id}`)}
                >
                  <TableCell className="font-medium text-primary">{hotel.name}</TableCell>
                  <TableCell>{hotel.location}</TableCell>
                  <TableCell className="hidden md:table-cell capitalize text-muted-foreground">{hotel.type}</TableCell>
                  <TableCell className="hidden md:table-cell">{hotel.stars}</TableCell>
                  <TableCell className="hidden lg:table-cell">{hotel.rooms.length}</TableCell>
                  <TableCell>{bookingCountByHotel[hotel.id] || 0}</TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">{hotel.adminName}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filteredHotels.length === 0 && <p className="py-8 text-center text-muted-foreground">No hotels found.</p>}
    </div>
  );
};

export default AdminBookings;
