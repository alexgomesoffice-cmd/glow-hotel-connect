import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, CreditCard, Hotel } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { fetchEndUsers, fetchBookings, fetchHotels, EndUserResponse, BookingResponse, HotelResponse } from "@/services/adminApi";

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

const AdminClientHistory = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [client, setClient] = useState<EndUserResponse | null>(null);
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [hotels, setHotels] = useState<HotelResponse[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [endUsersData, bookingsData, hotelsData] = await Promise.all([
          fetchEndUsers(),
          fetchBookings(),
          fetchHotels()
        ]);

        const foundClient = endUsersData.find((item) => item.end_user_id === Number(id));
        if (!foundClient) {
          toast({
            title: "Not Found",
            description: "Client not found",
            variant: "destructive",
          });
          navigate("/admin/clients");
          return;
        }

        setClient(foundClient);
        setBookings(bookingsData.filter((booking) => booking.end_user_id === Number(id)).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        setHotels(hotelsData);
        setIsLoaded(true);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to load history";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        navigate("/admin/clients");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, toast, navigate]);

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Loading booking history...</p>
      </div>
    );
  }

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

  const totalSpent = bookings.filter((booking) => booking.payment_status === "paid").reduce((sum, booking) => sum + booking.total_amount, 0);
  const getHotelName = (roomId: number) => {
    // Find hotel by room ID from our hotels list
    // Since we don't have direct hotel_id in booking, we'll show room ID
    return `Room #${roomId}`;
  };

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
              <p className="text-2xl font-bold">{bookings.length}</p>
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
              <p className="text-2xl font-bold">{hotels.length}</p>
              <p className="text-sm text-muted-foreground">Available Hotels</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "180ms" }}>
        <CardHeader><CardTitle>Detailed Bookings</CardTitle></CardHeader>
        <CardContent className="p-0">
          {bookings.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No bookings found for this guest.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead className="hidden sm:table-cell">Check-out</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="hidden lg:table-cell">Booked At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.booking_id}>
                    <TableCell className="font-medium">{getHotelName(booking.room_id)}</TableCell>
                    <TableCell>{formatDate(booking.check_in_date)}</TableCell>
                    <TableCell className="hidden sm:table-cell">{formatDate(booking.check_out_date)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(booking.total_amount)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={booking.booking_status === "cancelled" ? "border-destructive/20 bg-destructive/10 text-destructive" : booking.booking_status === "confirmed" ? "border-primary/20 bg-primary/10 text-primary" : "border-border bg-secondary text-foreground"}>
                        {booking.booking_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={booking.payment_status === "paid" ? "border-primary/20 bg-primary/10 text-primary" : booking.payment_status === "refunded" ? "border-destructive/20 bg-destructive/10 text-destructive" : "border-border bg-secondary text-foreground"}>
                        {booking.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{formatDate(booking.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminClientHistory;
