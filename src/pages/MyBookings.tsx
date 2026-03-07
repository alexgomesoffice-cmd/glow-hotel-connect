import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getLoggedInUser } from "@/components/Navbar";
import { useEffect } from "react";

const mockBookings = [
  { id: 1, hotel: "The Grand Palace Hotel", location: "London, UK", room: "Deluxe King Room", checkIn: "2025-03-10", checkOut: "2025-03-13", amount: "$840", status: "confirmed" },
  { id: 2, hotel: "Ocean View Resort", location: "Barcelona, Spain", room: "Sea View Room", checkIn: "2025-04-01", checkOut: "2025-04-05", amount: "$780", status: "pending" },
  { id: 3, hotel: "Nordic Forest Lodge", location: "Stockholm, Sweden", room: "Forest Cabin", checkIn: "2024-12-20", checkOut: "2024-12-24", amount: "$660", status: "completed" },
];

const statusColors: Record<string, string> = {
  confirmed: "bg-green-500/10 text-green-500 border-green-500/20",
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  completed: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

const MyBookings = () => {
  const navigate = useNavigate();
  const user = getLoggedInUser();

  useEffect(() => {
    if (!user) navigate("/login");
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-28 max-w-3xl">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-2xl sm:text-3xl font-bold">My <span className="text-gradient">Bookings</span></h1>
          <p className="text-muted-foreground">View and manage your hotel reservations</p>
        </div>

        <div className="space-y-4">
          {mockBookings.map((booking, i) => (
            <Card key={booking.id} className="hover-lift cursor-pointer animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{booking.hotel}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {booking.location}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {booking.checkIn} → {booking.checkOut}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{booking.room}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gradient">{booking.amount}</span>
                    <Badge className={`border ${statusColors[booking.status]}`}>{booking.status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {mockBookings.length === 0 && (
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
