import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Filter, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { fetchBookings, fetchHotels, BookingResponse, HotelResponse } from "@/services/adminApi";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

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
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [hotels, setHotels] = useState<HotelResponse[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [bookingsData, hotelsData] = await Promise.all([
          fetchBookings({ limit: 100 }),
          fetchHotels({ limit: 100 }),
        ]);
        setBookings(bookingsData);
        setHotels(hotelsData);
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

  const sortedBookings = useMemo(() => {
    return bookings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [bookings]);

  const hotelMap = useMemo(() => new Map(hotels.map((hotel) => [hotel.hotel_id, hotel.name])), [hotels]);

  const filteredBookings = sortedBookings.filter((booking) => {
    const matchesSearch = booking.booking_status.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || booking.booking_status === filterStatus;
    const matchesPayment = filterPayment === "all" || booking.payment_status === filterPayment;
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
          {isLoading ? (
            <div className="p-6 text-center text-muted-foreground">Loading bookings...</div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">No bookings found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest ID</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="hidden lg:table-cell">Booked At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.booking_id}>
                    <TableCell className="font-medium">User #{booking.end_user_id}</TableCell>
                    <TableCell className="hidden md:table-cell">{formatDate(booking.check_in_date)}</TableCell>
                    <TableCell className="hidden md:table-cell">{formatDate(booking.check_out_date)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(booking.total_amount)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getBadgeClasses(booking.booking_status)}>{booking.booking_status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getBadgeClasses(booking.payment_status)}>{booking.payment_status}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">{formatDate(booking.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {!isLoading && filteredBookings.length === 0 && <p className="py-8 text-center text-muted-foreground">No bookings found.</p>}
    </div>
  );
};

export default AdminAllBookings;
