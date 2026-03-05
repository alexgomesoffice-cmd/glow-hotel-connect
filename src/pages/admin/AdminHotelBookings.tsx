import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Filter, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

const AdminHotelBookings = () => {
  const navigate = useNavigate();
  const { hotelId } = useParams();
  const { data } = useAdminData();
  const [isLoaded, setIsLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [filterRoom, setFilterRoom] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const hotel = data.hotels.find((item) => item.id === Number(hotelId));
  const hotelBookings = useMemo(
    () => sortBookingsByRecent(data.bookings.filter((booking) => booking.hotelId === Number(hotelId))),
    [data.bookings, hotelId],
  );

  const roomOptions = [...new Set(hotelBookings.map((booking) => booking.room))];

  const filteredBookings = hotelBookings.filter((booking) => {
    const matchesSearch = booking.guestName.toLowerCase().includes(search.toLowerCase());
    const matchesRoom = filterRoom === "all" || booking.room === filterRoom;
    const matchesStatus = filterStatus === "all" || booking.status === filterStatus;
    const matchesPayment = filterPayment === "all" || booking.paymentStatus === filterPayment;
    return matchesSearch && matchesRoom && matchesStatus && matchesPayment;
  });

  if (!hotel) {
    return (
      <div className="space-y-4 max-w-3xl">
        <Button variant="outline" onClick={() => navigate("/admin/bookings")}>Go Back</Button>
        <Card>
          <CardContent className="p-6">
            <p className="font-medium">Hotel not found.</p>
            <p className="text-sm text-muted-foreground">The selected hotel booking page is unavailable.</p>
          </CardContent>
        </Card>
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
          <p className="text-muted-foreground">Search guest history and filter bookings by room, booking status, and payment.</p>
        </div>
      </div>

      <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "100ms" }}>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Bookings</p>
            <p className="text-3xl font-bold">{hotelBookings.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Paid Revenue</p>
            <p className="text-3xl font-bold">
              {formatCurrency(hotelBookings.filter((booking) => booking.paymentStatus === "paid").reduce((sum, booking) => sum + booking.amount, 0))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Rooms Used</p>
            <p className="text-3xl font-bold">{roomOptions.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className={`space-y-3 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "180ms" }}>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by guest name..." className="pl-10" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" /> Filters:
          </div>
          <Select value={filterRoom} onValueChange={setFilterRoom}>
            <SelectTrigger className="h-9 w-[180px] text-sm"><SelectValue placeholder="Room" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rooms</SelectItem>
              {roomOptions.map((room) => <SelectItem key={room} value={room}>{room}</SelectItem>)}
            </SelectContent>
          </Select>
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

      <Card className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "240ms" }}>
        <CardHeader>
          <CardTitle>Guest Booking History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
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
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.guestName}</TableCell>
                  <TableCell className="text-muted-foreground">{booking.room}</TableCell>
                  <TableCell className="hidden md:table-cell">{formatDate(booking.checkIn)}</TableCell>
                  <TableCell className="hidden md:table-cell">{formatDate(booking.checkOut)}</TableCell>
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

      {filteredBookings.length === 0 && <p className="py-8 text-center text-muted-foreground">No bookings match the selected filters.</p>}
    </div>
  );
};

export default AdminHotelBookings;
