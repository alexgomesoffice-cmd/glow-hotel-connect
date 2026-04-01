import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, User, Calendar, BedDouble, CreditCard, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { fetchBookings, fetchHotels, fetchEndUsers, BookingResponse, HotelResponse, EndUserResponse } from "@/services/adminApi";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useState, useEffect } from "react";

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

const statusConfig: Record<string, { bg: string; dot: string }> = {
  confirmed: { bg: "bg-green-500/10 text-green-500 border-green-500/20", dot: "bg-green-500" },
  pending: { bg: "bg-amber-500/10 text-amber-500 border-amber-500/20", dot: "bg-amber-500" },
  cancelled: { bg: "bg-destructive/10 text-destructive border-destructive/20", dot: "bg-destructive" },
};

const AdminBookingDetail = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [hotel, setHotel] = useState<HotelResponse | null>(null);
  const [endUser, setEndUser] = useState<EndUserResponse | null>(null);
  const [showCancel, setShowCancel] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [bookingsData, hotelsData, endUsersData] = await Promise.all([
          fetchBookings(),
          fetchHotels(),
          fetchEndUsers()
        ]);

        // Find the specific booking
        const foundBooking = bookingsData.find(b => b.booking_id === Number(bookingId));
        if (!foundBooking) {
          toast({
            title: "Not Found",
            description: "Booking not found",
            variant: "destructive",
          });
          navigate(-1);
          return;
        }

        setBooking(foundBooking);

        // Find associated hotel
        const foundHotel = hotelsData.find(h => h.hotel_id === foundBooking.room_id);
        if (foundHotel) {
          setHotel(foundHotel);
        }

        // Find associated end user
        const foundUser = endUsersData.find(u => u.end_user_id === foundBooking.end_user_id);
        if (foundUser) {
          setEndUser(foundUser);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to load booking details";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        navigate(-1);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [bookingId, toast, navigate]);

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Loading booking details...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-secondary/50 flex items-center justify-center mb-4">
          <Calendar className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold mb-2">Booking not found</h2>
        <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const config = statusConfig[booking.booking_status] || statusConfig.pending;

  const handleCancel = () => {
    // For now, this will be a placeholder since we need a backend endpoint
    toast({
      title: "Info",
      description: "Cancel booking feature not yet implemented",
    });
    setShowCancel(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 animate-fade-in-up">
        <Button variant="outline" size="icon" className="shrink-0 hover:border-primary/50 transition-colors" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold">Booking #{booking.booking_id}</h1>
            <Badge className={`border text-sm px-3 py-1 ${config.bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${config.dot}`} />
              {booking.booking_status}
            </Badge>
          </div>
          <p className="text-muted-foreground">Booked on {formatDate(booking.created_at)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Guest Info */}
        <Card className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
              Guest Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Name</span>
              <span className="font-medium text-primary">{endUser?.name || "Unknown"}</span>
            </div>
            {endUser && (
              <>
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Email</span><span className="text-sm font-medium">{endUser.email}</span></div>
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">User ID</span><span className="text-sm font-medium">#{endUser.end_user_id}</span></div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Room Details */}
        <Card className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                <BedDouble className="h-4 w-4 text-primary-foreground" />
              </div>
              Room & Hotel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-5">
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Room ID</span><span className="text-sm font-medium">#{booking.room_id}</span></div>
            {hotel && (
              <>
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Hotel</span><span className="text-sm font-medium">{hotel.name}</span></div>
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Location</span><span className="text-sm font-medium">{hotel.city}</span></div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Stay Period */}
        <Card className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                <Calendar className="h-4 w-4 text-primary-foreground" />
              </div>
              Stay Period
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-5">
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Check-in</span><span className="text-sm font-medium">{formatDate(booking.check_in_date)}</span></div>
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Check-out</span><span className="text-sm font-medium">{formatDate(booking.check_out_date)}</span></div>
          </CardContent>
        </Card>

        {/* Payment */}
        <Card className="animate-fade-in-up" style={{ animationDelay: "400ms" }}>
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
                <CreditCard className="h-4 w-4 text-primary-foreground" />
              </div>
              Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-xl font-bold text-gradient">{formatCurrency(booking.total_amount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Payment Status</span>
              <Badge variant="outline" className={booking.payment_status === "paid" ? "border-primary/20 bg-primary/10 text-primary" : booking.payment_status === "refunded" ? "border-destructive/20 bg-destructive/10 text-destructive" : ""}>
                {booking.payment_status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {booking.booking_status !== "cancelled" && (
        <div className="flex justify-end animate-fade-in-up" style={{ animationDelay: "500ms" }}>
          <Button variant="destructive" onClick={() => setShowCancel(true)} className="hover:shadow-lg transition-shadow">
            <XCircle className="h-4 w-4 mr-2" /> Cancel Booking
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={showCancel}
        onOpenChange={setShowCancel}
        title="Cancel this booking?"
        description={`Are you sure you want to cancel booking #${booking.booking_id} for ${endUser?.name}? This action will also issue a refund.`}
        confirmLabel="Yes, Cancel Booking"
        onConfirm={handleCancel}
        variant="destructive"
      />
    </div>
  );
};

export default AdminBookingDetail;
