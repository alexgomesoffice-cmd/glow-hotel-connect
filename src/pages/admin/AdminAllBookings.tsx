import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Filter, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate, sortBookingsByRecent, useAdminData } from "@/data/adminStore";

const getBadgeClasses = (value: string) => {
  if (value === "cancelled" || value === "refunded") {
    return "border-destructive/20 bg-destructive/10 text-destructive";
  }

  if (value === "confirmed" || value === "paid") {
    return "border-primary/20 bg-primary/10 text-primary";
  }

  return "border-border bg-secondary text-foreground";
};

const AdminAllBookings = () => {
  const { data } = useAdminData();
  const [isLoaded, setIsLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const bookings = useMemo(() => sortBookingsByRecent(data.bookings), [data.bookings]);
  const hotelMap = useMemo(() => new Map(data.hotels.map((hotel) => [hotel.id, hotel.name])), [data.hotels]);

  const filteredBookings = bookings.filter((booking) => {
    const hotelName = hotelMap.get(booking.hotelId) || "Unknown Hotel";
    const matchesSearch =
      booking.guestName.toLowerCase().includes(search.toLowerCase()) ||
      hotelName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || booking.status === filterStatus;
    const matchesPayment = filterPayment === "all" || booking.paymentStatus === filterPayment;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  return (
    <div className="space-y-6">
      <div className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`}>
        <h1 className="text-2xl sm:text-3xl font-bold">All Bookings</h1>
        <p className="text-muted-foreground">Sorted by most recent booking activity across every hotel.</p>
      </div>

      <div className={`space-y-3 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "100ms" }}>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by hotel or guest..." className="pl-10" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" /> Filters:
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-9 w-[160px] text-sm"><SelectValue placeholder="Booking Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPayment} onValueChange={setFilterPayment}>
            <SelectTrigger className="h-9 w-[160px] text-sm"><SelectValue placeholder="Payment" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "180ms" }}>
        <CardHeader>
          <CardTitle>Recent Booking Feed</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest</TableHead>
                <TableHead>Hotel</TableHead>
                <TableHead className="hidden md:table-cell">Room</TableHead>
                <TableHead className="hidden md:table-cell">Check-in</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="hidden lg:table-cell">Booked At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.guestName}</TableCell>
                  <TableCell>
                    <Link className="font-medium text-primary hover:underline" to={`/admin/bookings/hotel/${booking.hotelId}`}>
                      {hotelMap.get(booking.hotelId) || "Unknown Hotel"}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{booking.room}</TableCell>
                  <TableCell className="hidden md:table-cell">{formatDate(booking.checkIn)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(booking.amount)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getBadgeClasses(booking.status)}>{booking.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getBadgeClasses(booking.paymentStatus)}>{booking.paymentStatus}</Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">{formatDate(booking.bookedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filteredBookings.length === 0 && <p className="py-8 text-center text-muted-foreground">No bookings found.</p>}
    </div>
  );
};

export default AdminAllBookings;
