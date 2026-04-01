import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Filter, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { fetchHotels, fetchBookings, fetchEndUsers, BookingResponse, HotelResponse, EndUserResponse } from "@/services/adminApi";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

const getBadgeClasses = (value: string) => {
  if (value === "cancelled" || value === "refunded") return "border-destructive/20 bg-destructive/10 text-destructive";
  if (value === "confirmed" || value === "paid") return "border-primary/20 bg-primary/10 text-primary";
  return "border-border bg-secondary text-foreground";
};

const AdminHotelBookings = () => {
  const navigate = useNavigate();
  const { hotelId } = useParams();
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hotel, setHotel] = useState<HotelResponse | null>(null);
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [endUsers, setEndUsers] = useState<EndUserResponse[]>([]);
  const [search, setSearch] = useState("");
  const [filterRoom, setFilterRoom] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [hotelsData, bookingsData, endUsersData] = await Promise.all([
          fetchHotels(),
          fetchBookings(),
          fetchEndUsers()
        ]);

        const foundHotel = hotelsData.find(h => h.hotel_id === Number(hotelId));
        if (!foundHotel) {
          toast({
            title: "Not Found",
            description: "Hotel not found",
            variant: "destructive",
          });
          navigate("/admin/bookings");
          return;
        }

        setHotel(foundHotel);
        setBookings(bookingsData);
        setEndUsers(endUsersData);
        setIsLoaded(true);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to load data";
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
  }, [hotelId, toast, navigate]);

  // Get user name by ID
  const getUserName = (endUserId: number) => {
    const user = endUsers.find(u => u.end_user_id === endUserId);
    return user?.name || "Unknown Guest";
  };

  const hotelBookings = useMemo(
    () => bookings.filter((booking) => {
      // Since we can't directly map room_id to hotel_id from current API response,
      // we'll filter by checking if the booking exists
      // A proper solution would need backend changes to include hotel_id in booking response
      return booking.room_id > 0; // Include all bookings for now
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [bookings],
  );

  const roomOptions = [...new Set(hotelBookings.map((booking) => booking.room_id.toString()))];

  const filteredBookings = hotelBookings.filter((booking) => {
    const guestName = getUserName(booking.end_user_id).toLowerCase();
    const matchesSearch = guestName.includes(search.toLowerCase());
    const matchesRoom = filterRoom === "all" || booking.room_id.toString() === filterRoom;
    const matchesStatus = filterStatus === "all" || booking.booking_status === filterStatus;
    const matchesPayment = filterPayment === "all" || booking.payment_status === filterPayment;
    return matchesSearch && matchesRoom && matchesStatus && matchesPayment;
  });

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Loading hotel bookings...</p>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="space-y-4 max-w-3xl">
        <Button variant="outline" onClick={() => navigate("/admin/bookings")}>Go Back</Button>
        <Card><CardContent className="p-6"><p className="font-medium">Hotel not found.</p></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={`flex items-center gap-4 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`}>
        <Button variant="outline" size="icon" onClick={() => navigate("/admin/bookings")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{hotel.name} Bookings</h1>
          <p className="text-muted-foreground">Click on a row to see booking details, or click a guest name to view their profile.</p>
        </div>
      </div>

      <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "100ms" }}>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Total Bookings</p><p className="text-3xl font-bold">{hotelBookings.length}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Paid Revenue</p><p className="text-3xl font-bold">{formatCurrency(hotelBookings.filter((b) => b.payment_status === "paid").reduce((sum, b) => sum + b.total_amount, 0))}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Rooms Used</p><p className="text-3xl font-bold">{roomOptions.length}</p></CardContent></Card>
      </div>

      <div className={`space-y-3 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "180ms" }}>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by guest name..." className="pl-10" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Filter className="h-4 w-4" /> Filters:</div>
          <Select value={filterRoom} onValueChange={setFilterRoom}>
            <SelectTrigger className="h-9 w-[180px] text-sm"><SelectValue placeholder="Room" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rooms</SelectItem>
              {roomOptions.map((room) => <SelectItem key={room} value={room}>Room {room}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-9 w-[160px] text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
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

      <Card className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "240ms" }}>
        <CardHeader><CardTitle>Guest Booking History</CardTitle></CardHeader>
        <CardContent className="p-0">
          {filteredBookings.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No bookings match the selected filters.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead className="hidden md:table-cell">Check-in</TableHead>
                  <TableHead className="hidden md:table-cell">Check-out</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="hidden lg:table-cell">Booked At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.booking_id} className="cursor-pointer" onClick={() => navigate(`/admin/booking/${booking.booking_id}`)}>
                    <TableCell>
                      <span className="font-medium text-primary">
                        {getUserName(booking.end_user_id)}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">#{booking.room_id}</TableCell>
                    <TableCell className="hidden md:table-cell">{formatDate(booking.check_in_date)}</TableCell>
                    <TableCell className="hidden md:table-cell">{formatDate(booking.check_out_date)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(booking.total_amount)}</TableCell>
                    <TableCell><Badge variant="outline" className={getBadgeClasses(booking.booking_status)}>{booking.booking_status}</Badge></TableCell>
                    <TableCell><Badge variant="outline" className={getBadgeClasses(booking.payment_status)}>{booking.payment_status}</Badge></TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">{formatDate(booking.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {filteredBookings.length === 0 && <p className="py-8 text-center text-muted-foreground">No bookings match the selected filters.</p>}
    </div>
  );
};

export default AdminHotelBookings;
