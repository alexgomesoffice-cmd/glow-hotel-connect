import { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const bookings = [
  { id: 1, guest: "Emma Wilson", hotel: "Grand Palace Hotel", room: "Suite 301", checkIn: "Feb 15", checkOut: "Feb 18", amount: "$840", status: "confirmed" },
  { id: 2, guest: "Michael Chen", hotel: "Ocean View Resort", room: "Deluxe 205", checkIn: "Feb 16", checkOut: "Feb 20", amount: "$780", status: "pending" },
  { id: 3, guest: "Sarah Johnson", hotel: "Nordic Forest Lodge", room: "Cabin 12", checkIn: "Feb 17", checkOut: "Feb 19", amount: "$330", status: "confirmed" },
  { id: 4, guest: "David Brown", hotel: "Tropical Paradise Villa", room: "Villa A", checkIn: "Feb 18", checkOut: "Feb 25", amount: "$2,240", status: "confirmed" },
  { id: 5, guest: "Lisa Anderson", hotel: "Grand Palace Hotel", room: "Standard 112", checkIn: "Feb 19", checkOut: "Feb 21", amount: "$560", status: "cancelled" },
  { id: 6, guest: "James Taylor", hotel: "Seaside Resort", room: "Ocean 101", checkIn: "Feb 20", checkOut: "Feb 23", amount: "$930", status: "confirmed" },
  { id: 7, guest: "Sophia Martinez", hotel: "Mountain Lodge", room: "Suite 8", checkIn: "Feb 21", checkOut: "Feb 24", amount: "$720", status: "pending" },
];

const AdminBookings = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterHotel, setFilterHotel] = useState("all");

  useEffect(() => { setIsLoaded(true); }, []);

  const hotels = [...new Set(bookings.map((b) => b.hotel))];

  const filtered = bookings.filter((b) => {
    const matchSearch = b.guest.toLowerCase().includes(search.toLowerCase()) || b.hotel.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || b.status === filterStatus;
    const matchHotel = filterHotel === "all" || b.hotel === filterHotel;
    return matchSearch && matchStatus && matchHotel;
  });

  return (
    <div className="space-y-6">
      <div className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`}>
        <h1 className="text-2xl sm:text-3xl font-bold">All Bookings</h1>
        <p className="text-muted-foreground">Platform-wide booking management</p>
      </div>

      {/* Search & Filters */}
      <div className={`space-y-3 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "100ms" }}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by guest name or hotel..." className="pl-10 max-w-md" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Filter className="h-4 w-4" /> Filters:</div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px] h-9 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterHotel} onValueChange={setFilterHotel}>
            <SelectTrigger className="w-[200px] h-9 text-sm"><SelectValue placeholder="Hotel" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Hotels</SelectItem>
              {hotels.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "200ms" }}>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest</TableHead>
                  <TableHead>Hotel</TableHead>
                  <TableHead className="hidden md:table-cell">Room</TableHead>
                  <TableHead className="hidden sm:table-cell">Check-in</TableHead>
                  <TableHead className="hidden sm:table-cell">Check-out</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.guest}</TableCell>
                    <TableCell className="text-muted-foreground">{b.hotel}</TableCell>
                    <TableCell className="text-muted-foreground hidden md:table-cell">{b.room}</TableCell>
                    <TableCell className="hidden sm:table-cell">{b.checkIn}</TableCell>
                    <TableCell className="hidden sm:table-cell">{b.checkOut}</TableCell>
                    <TableCell className="font-medium">{b.amount}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          b.status === "confirmed" ? "bg-green-500/10 text-green-500 border-green-500/20"
                            : b.status === "pending" ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            : "bg-destructive/10 text-destructive border-destructive/20"
                        }
                      >
                        {b.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No bookings found.</p>}
    </div>
  );
};

export default AdminBookings;
