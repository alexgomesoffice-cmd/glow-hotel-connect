import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, XCircle, Calendar, Users, CheckCircle, Clock, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { apiGet, apiPost } from "@/utils/api";
import ConfirmDialog from "@/components/ConfirmDialog";

const statusConfig: Record<string, { bg: string; dot: string; icon: any }> = {
  confirmed: { bg: "bg-green-500/10 text-green-500 border-green-500/20", dot: "bg-green-500", icon: CheckCircle },
  "checked-in": { bg: "bg-blue-500/10 text-blue-500 border-blue-500/20", dot: "bg-blue-500", icon: Users },
  "checked-out": { bg: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground", icon: Calendar },
  reserved: { bg: "bg-amber-500/10 text-amber-500 border-amber-500/20", dot: "bg-amber-500", icon: Clock },
  expired: { bg: "bg-red-500/10 text-red-500 border-red-500/20", dot: "bg-red-500", icon: XCircle },
  cancelled: { bg: "bg-destructive/10 text-destructive border-destructive/20", dot: "bg-destructive", icon: XCircle },
  "no-show": { bg: "bg-gray-500/10 text-gray-500 border-gray-500/20", dot: "bg-gray-500", icon: XCircle },
};

const HotelAdminReservations = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roomTypeFilter, setRoomTypeFilter] = useState("all");
  const [roomTypes, setRoomTypes] = useState<string[]>([]);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        // Get assigned hotel
        const hotelResponse = await apiGet("/hotels/admin/me/assigned-hotel");
        if (!hotelResponse.success || !hotelResponse.data?.hotel_id) {
          throw new Error("Could not determine assigned hotel");
        }
        const hotelId = hotelResponse.data.hotel_id;

        // Fetch bookings for this hotel
        const bookingsResponse = await apiGet(`/bookings?hotel_id=${hotelId}&take=1000`);
        if (!bookingsResponse.success || !bookingsResponse.data?.bookings) {
          throw new Error("Failed to fetch reservations");
        }

        // Map backend data to frontend format
        const mappedReservations = bookingsResponse.data.bookings.map((booking: any) => {
          const statusMap: Record<string, string> = {
            RESERVED: "reserved",
            BOOKED: "confirmed",
            EXPIRED: "expired",
            CANCELLED: "cancelled",
            CHECKED_IN: "checked-in",
            CHECKED_OUT: "checked-out",
            NO_SHOW: "no-show",
          };

          return {
            id: booking.booking_reference,
            guest: booking.guest_name || "Unknown Guest",
            guestId: booking.end_user_id,
            room: booking.room_type || "N/A",
            roomType: booking.room_type || "N/A",
            checkIn: booking.check_in,
            checkOut: booking.check_out,
            status: statusMap[booking.status] || booking.status.toLowerCase(),
            total: `$${booking.total_price}`,
            bookingId: booking.booking_id, // For cancel action
          };
        });

        setReservations(mappedReservations);

        // Extract unique room types
        const uniqueRoomTypes = Array.from(new Set(mappedReservations.map(r => r.roomType).filter(Boolean))) as string[];
        setRoomTypes(uniqueRoomTypes);
      } catch (error) {
        console.error("Failed to fetch reservations:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load reservations",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [toast]);

  const filtered = reservations.filter((r) => {
    const matchSearch = r.guest.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase()) || r.room.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const matchType = roomTypeFilter === "all" || r.roomType.toLowerCase() === roomTypeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const handleCancel = async () => {
    if (!cancelTarget) return;

    try {
      const booking = reservations.find((r) => r.id === cancelTarget);
      if (!booking) return;

      const response = await apiPost(`/bookings/${booking.bookingId}/cancel`, {});
      if (response.success) {
        toast({ title: "Reservation Cancelled", description: `${cancelTarget} has been cancelled.` });
        // Refresh the list
        window.location.reload();
      } else {
        throw new Error(response.message || "Failed to cancel reservation");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel reservation",
        variant: "destructive"
      });
    } finally {
      setCancelTarget(null);
    }
  };

  const cancelReservation = reservations.find((r) => r.id === cancelTarget);

  const totalBookings = reservations.length;
  const confirmedCount = reservations.filter(r => r.status === "confirmed").length;
  const checkedInCount = reservations.filter(r => r.status === "checked-in").length;
  const reservedCount = reservations.filter(r => r.status === "reserved").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-muted-foreground">Loading reservations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl sm:text-3xl font-bold">Reservations</h1>
        <p className="text-muted-foreground">Manage guest bookings and check-ins</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        {[
          { label: "Total Bookings", value: totalBookings, gradient: "from-primary to-accent", icon: Calendar },
          { label: "Confirmed", value: confirmedCount, gradient: "from-green-500 to-emerald-500", icon: CheckCircle },
          { label: "Checked In", value: checkedInCount, gradient: "from-blue-500 to-cyan-500", icon: Users },
          { label: "Reserved", value: reservedCount, gradient: "from-amber-500 to-orange-500", icon: Clock },
        ].map((stat) => (
          <Card key={stat.label} className="relative overflow-hidden hover-lift">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-xl sm:text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shrink-0`}>
                  <stat.icon className="h-4 w-4 text-primary-foreground" />
                </div>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by guest, ID, or room..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="checked-in">Checked In</SelectItem>
                <SelectItem value="checked-out">Checked Out</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no-show">No Show</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roomTypeFilter} onValueChange={setRoomTypeFilter}>
              <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Room Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {roomTypes.map((type) => (
                  <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  {["ID", "Guest", "Room", "Check-in", "Check-out", "Total", "Status", ""].map((h) => (
                    <th key={h} className="text-left py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const config = statusConfig[r.status];
                  return (
                    <tr key={r.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer group" onClick={() => navigate(`/hotel-admin/reservations/${r.id}`)}>
                      <td className="py-3.5 px-4 font-mono text-sm text-primary">{r.id}</td>
                      <td className="py-3.5 px-4">
                        <Link
                          to={`/hotel-admin/guest/${r.guestId}`}
                          className="font-medium text-foreground hover:text-primary transition-colors flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-bold text-primary-foreground">{r.guest.split(" ").map(n => n[0]).join("")}</span>
                          </div>
                          {r.guest}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-sm text-muted-foreground">{r.room}</td>
                      <td className="py-3.5 px-4 text-sm">{r.checkIn}</td>
                      <td className="py-3.5 px-4 text-sm">{r.checkOut}</td>
                      <td className="py-3.5 px-4 font-semibold">{r.total}</td>
                      <td className="py-3.5 px-4">
                        <Badge className={`border ${config?.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${config?.dot}`} />
                          {r.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        {r.status !== "checked-out" && r.status !== "cancelled" && (
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); setCancelTarget(r.id); }}>
                            <XCircle className="h-4 w-4 mr-1" /> Cancel
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-secondary/50 flex items-center justify-center mb-4">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">No reservations match your criteria.</p>
        </div>
      )}

      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        title="Cancel this reservation?"
        description={`Are you sure you want to cancel reservation ${cancelTarget} for ${cancelReservation?.guest || "this guest"}? This action cannot be undone.`}
        confirmLabel="Yes, Cancel"
        onConfirm={handleCancel}
        variant="destructive"
      />
    </div>
  );
};

export default HotelAdminReservations;
