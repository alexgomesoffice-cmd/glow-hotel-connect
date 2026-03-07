import { useParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, User, Calendar, BedDouble, CreditCard, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import ConfirmDialog from "@/components/ConfirmDialog";

const allReservations = [
  { id: "RES-001", guest: "Alice Martin", guestId: "g1", room: "Suite 301", roomType: "Suite", checkIn: "2025-02-20", checkOut: "2025-02-24", status: "confirmed", total: "$1,400", nights: 4, guests: 2, email: "alice@email.com", phone: "+1 555 0101", paymentMethod: "Visa •••• 4242", bookedAt: "2025-02-10" },
  { id: "RES-002", guest: "Robert Kim", guestId: "g2", room: "Deluxe 205", roomType: "Deluxe", checkIn: "2025-02-21", checkOut: "2025-02-23", status: "checked-in", total: "$440", nights: 2, guests: 1, email: "robert@email.com", phone: "+1 555 0102", paymentMethod: "Mastercard •••• 1234", bookedAt: "2025-02-15" },
  { id: "RES-003", guest: "Sophie Chen", guestId: "g3", room: "Standard 112", roomType: "Standard", checkIn: "2025-02-18", checkOut: "2025-02-21", status: "checked-out", total: "$360", nights: 3, guests: 2, email: "sophie@email.com", phone: "+1 555 0103", paymentMethod: "Visa •••• 5678", bookedAt: "2025-02-12" },
  { id: "RES-004", guest: "James Wilson", guestId: "g4", room: "Suite 402", roomType: "Suite", checkIn: "2025-02-22", checkOut: "2025-02-26", status: "pending", total: "$1,600", nights: 4, guests: 3, email: "james@email.com", phone: "+1 555 0104", paymentMethod: "Amex •••• 9012", bookedAt: "2025-02-18" },
  { id: "RES-005", guest: "Emma Davis", guestId: "g5", room: "Deluxe 310", roomType: "Deluxe", checkIn: "2025-02-23", checkOut: "2025-02-25", status: "confirmed", total: "$500", nights: 2, guests: 2, email: "emma@email.com", phone: "+1 555 0105", paymentMethod: "Visa •••• 3456", bookedAt: "2025-02-19" },
];

const statusConfig: Record<string, { bg: string; dot: string }> = {
  confirmed: { bg: "bg-green-500/10 text-green-500 border-green-500/20", dot: "bg-green-500" },
  "checked-in": { bg: "bg-blue-500/10 text-blue-500 border-blue-500/20", dot: "bg-blue-500" },
  "checked-out": { bg: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground" },
  pending: { bg: "bg-amber-500/10 text-amber-500 border-amber-500/20", dot: "bg-amber-500" },
  cancelled: { bg: "bg-destructive/10 text-destructive border-destructive/20", dot: "bg-destructive" },
};

const HotelAdminReservationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showCancel, setShowCancel] = useState(false);
  const reservation = allReservations.find((r) => r.id === id);

  if (!reservation) return (
    <div className="text-center py-20">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-secondary/50 flex items-center justify-center mb-4">
        <Calendar className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-bold mb-2">Reservation not found</h2>
      <Button variant="outline" onClick={() => navigate("/hotel-admin/reservations")}>Back to Reservations</Button>
    </div>
  );

  const config = statusConfig[reservation.status];

  const handleCancel = () => {
    toast({ title: "Reservation Cancelled", description: `${reservation.id} has been cancelled.` });
    setShowCancel(false);
    navigate("/hotel-admin/reservations");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4 animate-fade-in-up">
        <Button variant="outline" size="icon" className="shrink-0 hover:border-primary/50 transition-colors" onClick={() => navigate("/hotel-admin/reservations")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold">{reservation.id}</h1>
            <Badge className={`border text-sm px-3 py-1 ${config?.bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${config?.dot}`} />
              {reservation.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">Booked on {reservation.bookedAt}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent"><User className="h-4 w-4 text-primary-foreground" /></div>
              Guest Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Name</span>
              <Link to={`/hotel-admin/guest/${reservation.guestId}`} className="font-medium text-primary hover:underline">{reservation.guest}</Link>
            </div>
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Email</span><span className="text-sm font-medium">{reservation.email}</span></div>
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Phone</span><span className="text-sm font-medium">{reservation.phone}</span></div>
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Guests</span><span className="text-sm font-medium">{reservation.guests}</span></div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500"><BedDouble className="h-4 w-4 text-primary-foreground" /></div>
              Room Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-5">
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Room</span><span className="text-sm font-medium">{reservation.room}</span></div>
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Type</span><span className="text-sm font-medium">{reservation.roomType}</span></div>
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Nights</span><span className="text-sm font-medium">{reservation.nights}</span></div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500"><Calendar className="h-4 w-4 text-primary-foreground" /></div>
              Stay Period
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-5">
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Check-in</span><span className="text-sm font-medium">{reservation.checkIn}</span></div>
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Check-out</span><span className="text-sm font-medium">{reservation.checkOut}</span></div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up" style={{ animationDelay: "400ms" }}>
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500"><CreditCard className="h-4 w-4 text-primary-foreground" /></div>
              Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-xl font-bold text-gradient">{reservation.total}</span>
            </div>
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Method</span><span className="text-sm font-medium">{reservation.paymentMethod}</span></div>
          </CardContent>
        </Card>
      </div>

      {reservation.status !== "cancelled" && reservation.status !== "checked-out" && (
        <div className="flex justify-end animate-fade-in-up" style={{ animationDelay: "500ms" }}>
          <Button variant="destructive" onClick={() => setShowCancel(true)} className="hover:shadow-lg transition-shadow">
            <XCircle className="h-4 w-4 mr-2" /> Cancel Reservation
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={showCancel}
        onOpenChange={setShowCancel}
        title="Cancel this reservation?"
        description={`Are you sure you want to cancel reservation ${reservation.id} for ${reservation.guest}? This action cannot be undone.`}
        confirmLabel="Yes, Cancel Reservation"
        onConfirm={handleCancel}
        variant="destructive"
      />
    </div>
  );
};

export default HotelAdminReservationDetail;
