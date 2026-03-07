import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, User, Calendar, BedDouble, CreditCard, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminData, formatCurrency, formatDate } from "@/data/adminStore";
import { toast } from "@/hooks/use-toast";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useState } from "react";

const statusConfig: Record<string, { bg: string; dot: string }> = {
  confirmed: { bg: "bg-green-500/10 text-green-500 border-green-500/20", dot: "bg-green-500" },
  pending: { bg: "bg-amber-500/10 text-amber-500 border-amber-500/20", dot: "bg-amber-500" },
  cancelled: { bg: "bg-destructive/10 text-destructive border-destructive/20", dot: "bg-destructive" },
};

const AdminBookingDetail = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { data, saveData } = useAdminData();
  const [showCancel, setShowCancel] = useState(false);

  const booking = data.bookings.find((b) => b.id === Number(bookingId));
  const hotel = booking ? data.hotels.find((h) => h.id === booking.hotelId) : null;
  const client = booking ? data.clients.find((c) => c.id === booking.clientId) : null;

  if (!booking) return (
    <div className="text-center py-20">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-secondary/50 flex items-center justify-center mb-4">
        <Calendar className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-bold mb-2">Booking not found</h2>
      <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
    </div>
  );

  const config = statusConfig[booking.status] || statusConfig.pending;

  const handleCancel = () => {
    saveData((current) => ({
      ...current,
      bookings: current.bookings.map((b) =>
        b.id === booking.id ? { ...b, status: "cancelled" as const, paymentStatus: "refunded" as const } : b
      ),
    }));
    toast({ title: "Booking Cancelled", description: `Booking #${booking.id} has been cancelled and refunded.` });
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
            <h1 className="text-2xl sm:text-3xl font-bold">Booking #{booking.id}</h1>
            <Badge className={`border text-sm px-3 py-1 ${config.bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${config.dot}`} />
              {booking.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">Booked on {formatDate(booking.bookedAt)}</p>
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
              <Link to={`/admin/client-history/${booking.clientId}`} className="font-medium text-primary hover:underline">{booking.guestName}</Link>
            </div>
            {client && (
              <>
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Email</span><span className="text-sm font-medium">{client.email}</span></div>
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Phone</span><span className="text-sm font-medium">{client.phone}</span></div>
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Country</span><span className="text-sm font-medium">{client.country}</span></div>
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
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Room</span><span className="text-sm font-medium">{booking.room}</span></div>
            {hotel && (
              <>
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Hotel</span><span className="text-sm font-medium">{hotel.name}</span></div>
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Location</span><span className="text-sm font-medium">{hotel.location}</span></div>
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
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Check-in</span><span className="text-sm font-medium">{formatDate(booking.checkIn)}</span></div>
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Check-out</span><span className="text-sm font-medium">{formatDate(booking.checkOut)}</span></div>
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
              <span className="text-xl font-bold text-gradient">{formatCurrency(booking.amount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Payment Status</span>
              <Badge variant="outline" className={booking.paymentStatus === "paid" ? "border-primary/20 bg-primary/10 text-primary" : booking.paymentStatus === "refunded" ? "border-destructive/20 bg-destructive/10 text-destructive" : ""}>
                {booking.paymentStatus}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {booking.status !== "cancelled" && (
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
        description={`Are you sure you want to cancel booking #${booking.id} for ${booking.guestName}? This action will also issue a refund.`}
        confirmLabel="Yes, Cancel Booking"
        onConfirm={handleCancel}
        variant="destructive"
      />
    </div>
  );
};

export default AdminBookingDetail;
