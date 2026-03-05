import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, CreditCard, Hotel } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate, sortBookingsByRecent, useAdminData } from "@/data/adminStore";

const AdminClientHistory = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data } = useAdminData();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const client = data.clients.find((item) => item.id === Number(id));
  const hotelMap = useMemo(() => new Map(data.hotels.map((hotel) => [hotel.id, hotel.name])), [data.hotels]);
  const history = useMemo(
    () => sortBookingsByRecent(data.bookings.filter((booking) => booking.clientId === Number(id))),
    [data.bookings, id],
  );

  if (!client) {
    return (
      <div className="space-y-4 max-w-3xl">
        <Button variant="outline" onClick={() => navigate("/admin/clients")}>Go Back</Button>
        <Card>
          <CardContent className="p-6">
            <p className="font-medium">Client not found.</p>
            <p className="text-sm text-muted-foreground">This history is unavailable because the client no longer exists.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalSpent = history.filter((booking) => booking.paymentStatus === "paid").reduce((sum, booking) => sum + booking.amount, 0);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className={`flex items-center gap-4 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`}>
        <Button variant="outline" size="icon" onClick={() => navigate("/admin/clients")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Booking History</h1>
          <p className="text-muted-foreground">{client.name}'s booking records across all hotels</p>
        </div>
      </div>

      <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "100ms" }}>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-xl bg-primary/10 p-3"><Calendar className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold">{history.length}</p>
              <p className="text-sm text-muted-foreground">Total Bookings</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-xl bg-primary/10 p-3"><CreditCard className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
              <p className="text-sm text-muted-foreground">Total Paid</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-xl bg-primary/10 p-3"><Hotel className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold">{new Set(history.map((booking) => booking.hotelId)).size}</p>
              <p className="text-sm text-muted-foreground">Hotels Visited</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "180ms" }}>
        <CardHeader><CardTitle>Detailed Bookings</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hotel</TableHead>
                <TableHead className="hidden sm:table-cell">Room</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead className="hidden sm:table-cell">Check-out</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Booked At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{hotelMap.get(booking.hotelId) || "Unknown Hotel"}</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">{booking.room}</TableCell>
                  <TableCell>{formatDate(booking.checkIn)}</TableCell>
                  <TableCell className="hidden sm:table-cell">{formatDate(booking.checkOut)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={booking.status === "cancelled" ? "border-destructive/20 bg-destructive/10 text-destructive" : booking.status === "confirmed" ? "border-primary/20 bg-primary/10 text-primary" : "border-border bg-secondary text-foreground"}>
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={booking.paymentStatus === "paid" ? "border-primary/20 bg-primary/10 text-primary" : booking.paymentStatus === "refunded" ? "border-destructive/20 bg-destructive/10 text-destructive" : "border-border bg-secondary text-foreground"}>
                      {booking.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(booking.bookedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {history.length === 0 && <p className="py-8 text-center text-muted-foreground">No booking history found for this client.</p>}
    </div>
  );
};

export default AdminClientHistory;
