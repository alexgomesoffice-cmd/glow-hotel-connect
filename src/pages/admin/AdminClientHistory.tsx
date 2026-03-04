import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Hotel, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const clientNames: Record<string, string> = {
  "1": "Emma Wilson",
  "2": "Michael Chen",
  "3": "Sarah Johnson",
  "4": "David Brown",
  "5": "Lisa Anderson",
};

const mockHistory: Record<string, any[]> = {
  "1": [
    { id: 1, hotel: "Grand Palace Hotel", room: "Suite 301", checkIn: "2024-12-15", checkOut: "2024-12-18", amount: "$840", status: "paid", bookedAt: "2024-12-01" },
    { id: 2, hotel: "Ocean View Resort", room: "Deluxe 205", checkIn: "2024-11-10", checkOut: "2024-11-14", amount: "$1,120", status: "paid", bookedAt: "2024-10-25" },
    { id: 3, hotel: "Nordic Forest Lodge", room: "Cabin 5", checkIn: "2025-01-05", checkOut: "2025-01-08", amount: "$495", status: "cancelled", bookedAt: "2024-12-20" },
  ],
  "2": [
    { id: 1, hotel: "Urban Suites", room: "Standard 112", checkIn: "2024-10-20", checkOut: "2024-10-22", amount: "$320", status: "paid", bookedAt: "2024-10-05" },
    { id: 2, hotel: "Grand Palace Hotel", room: "Deluxe 402", checkIn: "2025-02-10", checkOut: "2025-02-14", amount: "$1,680", status: "paid", bookedAt: "2025-01-15" },
  ],
  "3": [
    { id: 1, hotel: "Seaside Resort", room: "Ocean Suite", checkIn: "2024-08-01", checkOut: "2024-08-05", amount: "$2,000", status: "paid", bookedAt: "2024-07-10" },
    { id: 2, hotel: "Mountain Lodge", room: "Cabin 12", checkIn: "2024-09-15", checkOut: "2024-09-17", amount: "$330", status: "paid", bookedAt: "2024-09-01" },
    { id: 3, hotel: "Grand Palace Hotel", room: "Suite 301", checkIn: "2024-11-20", checkOut: "2024-11-25", amount: "$1,400", status: "cancelled", bookedAt: "2024-11-05" },
    { id: 4, hotel: "Tropical Paradise Villa", room: "Villa B", checkIn: "2025-01-10", checkOut: "2025-01-17", amount: "$2,240", status: "paid", bookedAt: "2024-12-28" },
  ],
};

const AdminClientHistory = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => { setIsLoaded(true); }, []);

  const clientName = clientNames[id || "1"] || "Unknown Client";
  const history = mockHistory[id || "1"] || [];

  const totalSpent = history.filter((b) => b.status === "paid").reduce((sum, b) => sum + parseFloat(b.amount.replace(/[$,]/g, "")), 0);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className={`flex items-center gap-4 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`}>
        <Button variant="outline" size="icon" onClick={() => navigate("/admin/clients")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Booking History</h1>
          <p className="text-muted-foreground">{clientName}'s complete booking records</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "100ms" }}>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10"><Calendar className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold">{history.length}</p>
              <p className="text-sm text-muted-foreground">Total Bookings</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-500/10"><CreditCard className="h-5 w-5 text-green-500" /></div>
            <div>
              <p className="text-2xl font-bold">${totalSpent.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Spent</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10"><Hotel className="h-5 w-5 text-amber-500" /></div>
            <div>
              <p className="text-2xl font-bold">{new Set(history.map((b) => b.hotel)).size}</p>
              <p className="text-sm text-muted-foreground">Hotels Visited</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Booking Table */}
      <Card className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "200ms" }}>
        <CardHeader><CardTitle>All Bookings</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hotel</TableHead>
                  <TableHead className="hidden sm:table-cell">Room</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead className="hidden sm:table-cell">Check-out</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Booked At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.hotel}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">{booking.room}</TableCell>
                    <TableCell>{booking.checkIn}</TableCell>
                    <TableCell className="hidden sm:table-cell">{booking.checkOut}</TableCell>
                    <TableCell className="font-medium">{booking.amount}</TableCell>
                    <TableCell>
                      <Badge variant={booking.status === "paid" ? "default" : "destructive"} className={booking.status === "paid" ? "bg-green-500/10 text-green-500 hover:bg-green-500/20" : ""}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{booking.bookedAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {history.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No booking history found for this client.</p>
      )}
    </div>
  );
};

export default AdminClientHistory;
