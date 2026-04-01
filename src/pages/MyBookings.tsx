import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getLoggedInUser } from "@/utils/auth";
import { apiGet } from "@/utils/api";

type MyBooking = {
  booking_id: number;
  booking_reference: string;
  hotel_id: number;
  end_user_id: number;
  check_in: string;
  check_out: string;
  status: string;
  total_price: string | number;
  created_at: string;
  hotel_name?: string;
  room_type?: string;
  location?: string;
};

const statusColors: Record<string, string> = {
  reserved: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  booked: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  expired: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  checked_in: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  checked_out: "bg-sky-500/10 text-sky-700 border-sky-500/20",
  no_show: "bg-violet-500/10 text-violet-700 border-violet-500/20",
};

const mapStatus = (status: string) => {
  const key = status.toLowerCase();
  if (key === "confirmed") return "booked";
  if (key === "pending") return "reserved";
  if (key === "completed") return "checked_out";
  if (key === "checked-in") return "checked_in";
  if (key === "checked-out") return "checked_out";
  if (key === "no show" || key === "no_show") return "no_show";
  return key;
};

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<MyBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = useMemo(() => getLoggedInUser(), []);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        console.log("[BOOKINGS PAGE] Fetching bookings for user:", user.id);

        // Use the apiGet utility which handles auth headers properly
        const response = await apiGet(`/bookings?end_user_id=${user.id}&skip=0&take=50`);
        
        console.log("[BOOKINGS PAGE] API Response:", response);

        if (response.success && response.data?.bookings) {
          console.log("[BOOKINGS PAGE] Fetched bookings:", response.data.bookings);
          setBookings(response.data.bookings);
        } else {
          console.warn("[BOOKINGS PAGE] No bookings data in response");
          setBookings([]);
        }
      } catch (error) {
        console.error("[BOOKINGS PAGE] Error fetching bookings:", error);
        setBookings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-28 max-w-3xl">
        <div className="mb-4 animate-fade-in-up">
          <h1 className="text-2xl sm:text-3xl font-bold">My <span className="text-gradient">Bookings</span></h1>
          <p className="text-muted-foreground">View and manage your hotel reservations</p>
        </div>
        <div className="rounded-2xl border border-sky-200/70 bg-sky-50 p-3 mb-6 text-sky-800">
          <div className="text-sm font-semibold text-sky-700">Reservation hold notice</div>
          <div className="text-sm text-sky-700/90">Reserved rooms are held for 30 minutes. If you don't complete payment within this window, the room may be released.</div>
        </div>

        {bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking, i) => {
              const normalized = mapStatus(booking.status);
              const className = statusColors[normalized] ?? "bg-secondary/10 text-foreground border-border";
              return (
                <Card key={booking.booking_id} className="hover-lift cursor-pointer animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{booking.hotel_name || `Hotel #${booking.hotel_id}`}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {booking.location || "Location"}</span>
                          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {booking.check_in} → {booking.check_out}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{booking.room_type || `Room Type #${booking.hotel_id}`}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gradient">${Number(booking.total_price).toFixed(2)}</span>
                        <Badge className={`border ${className}`}>{normalized.replace("_", " ")}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : isLoading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-secondary/50 flex items-center justify-center mb-4">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
            <p className="text-muted-foreground">Loading your bookings...</p>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-secondary/50 flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No bookings yet. Start exploring hotels!</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MyBookings;
