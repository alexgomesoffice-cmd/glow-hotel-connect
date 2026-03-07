import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, XCircle, Calendar, Users, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import ConfirmDialog from "@/components/ConfirmDialog";

const reservations = [
  { id: "RES-001", guest: "Alice Martin", guestId: "g1", room: "Suite 301", roomType: "Suite", checkIn: "2025-02-20", checkOut: "2025-02-24", status: "confirmed", total: "$1,400" },
  { id: "RES-002", guest: "Robert Kim", guestId: "g2", room: "Deluxe 205", roomType: "Deluxe", checkIn: "2025-02-21", checkOut: "2025-02-23", status: "checked-in", total: "$440" },
  { id: "RES-003", guest: "Sophie Chen", guestId: "g3", room: "Standard 112", roomType: "Standard", checkIn: "2025-02-18", checkOut: "2025-02-21", status: "checked-out", total: "$360" },
  { id: "RES-004", guest: "James Wilson", guestId: "g4", room: "Suite 402", roomType: "Suite", checkIn: "2025-02-22", checkOut: "2025-02-26", status: "pending", total: "$1,600" },
  { id: "RES-005", guest: "Emma Davis", guestId: "g5", room: "Deluxe 310", roomType: "Deluxe", checkIn: "2025-02-23", checkOut: "2025-02-25", status: "confirmed", total: "$500" },
];

const statusConfig: Record<string, { bg: string; dot: string; icon: any }> = {
  confirmed: { bg: "bg-green-500/10 text-green-500 border-green-500/20", dot: "bg-green-500", icon: CheckCircle },
  "checked-in": { bg: "bg-blue-500/10 text-blue-500 border-blue-500/20", dot: "bg-blue-500", icon: Users },
  "checked-out": { bg: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground", icon: Calendar },
  pending: { bg: "bg-amber-500/10 text-amber-500 border-amber-500/20", dot: "bg-amber-500", icon: Clock },
  cancelled: { bg: "bg-destructive/10 text-destructive border-destructive/20", dot: "bg-destructive", icon: XCircle },
};

const HotelAdminReservations = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roomTypeFilter, setRoomTypeFilter] = useState("all");
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);

  const filtered = reservations.filter((r) => {
    const matchSearch = r.guest.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase()) || r.room.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const matchType = roomTypeFilter === "all" || r.roomType.toLowerCase() === roomTypeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const handleCancel = () => {
    if (cancelTarget) {
      toast({ title: "Reservation Cancelled", description: `${cancelTarget} has been cancelled.` });
      setCancelTarget(null);
    }
  };

  const cancelReservation = reservations.find((r) => r.id === cancelTarget);

  const totalBookings = reservations.length;
  const confirmedCount = reservations.filter(r => r.status === "confirmed").length;
  const checkedInCount = reservations.filter(r => r.status === "checked-in").length;
  const pendingCount = reservations.filter(r => r.status === "pending").length;

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
          { label: "Pending", value: pendingCount, gradient: "from-amber-500 to-orange-500", icon: Clock },
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roomTypeFilter} onValueChange={setRoomTypeFilter}>
              <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Room Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="deluxe">Deluxe</SelectItem>
                <SelectItem value="suite">Suite</SelectItem>
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
