import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Filter, Calendar as CalIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusPill } from "@/components/hotel-admin/primitives";
import { useHotelStore, findGuest, findRoom, findRoomType, formatMoney, formatDate, isToday } from "@/data/hotelAdminStore";
import { cn } from "@/lib/utils";

const CHIPS = [
  { id: "all", label: "All" },
  { id: "today", label: "Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "checked_in", label: "Checked In" },
  { id: "checked_out", label: "Checked Out" },
  { id: "cancelled", label: "Cancelled" },
  { id: "pending_payment", label: "Pending Payment" },
];

const statusTone: Record<string, "green" | "amber" | "red" | "blue" | "gray"> = {
  confirmed: "blue", checked_in: "green", checked_out: "gray", cancelled: "red", pending_payment: "amber",
};

const HotelAdminReservations = () => {
  const navigate = useNavigate();
  const { reservations, roomTypes } = useHotelStore((s) => s);
  const [chip, setChip] = useState("all");
  const [search, setSearch] = useState("");
  const [roomType, setRoomType] = useState("all");
  const [payment, setPayment] = useState("all");

  const filtered = useMemo(() => {
    return reservations.filter((r) => {
      const g = findGuest(r.guestId);
      if (search && !`${r.code} ${g?.name} ${g?.email}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (roomType !== "all" && r.roomTypeId !== roomType) return false;
      if (payment !== "all" && r.payment !== payment) return false;
      if (chip === "today" && !(isToday(r.checkIn) || isToday(r.checkOut))) return false;
      if (chip === "upcoming" && !(new Date(r.checkIn) > new Date())) return false;
      if (chip === "checked_in" && r.status !== "checked_in") return false;
      if (chip === "checked_out" && r.status !== "checked_out") return false;
      if (chip === "cancelled" && r.status !== "cancelled") return false;
      if (chip === "pending_payment" && r.payment !== "pending") return false;
      return true;
    });
  }, [reservations, chip, search, roomType, payment]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-in-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Reservations</h1>
          <p className="text-muted-foreground text-sm">{filtered.length} of {reservations.length} bookings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><CalIcon className="h-4 w-4 mr-2" /> Export</Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            {CHIPS.map((c) => (
              <button
                key={c.id}
                onClick={() => setChip(c.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                  chip === c.id
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-primary-foreground border-transparent"
                    : "bg-secondary/40 border-border hover:bg-secondary text-muted-foreground",
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by booking, guest, email…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={roomType} onValueChange={setRoomType}>
              <SelectTrigger><SelectValue placeholder="Room type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All room types</SelectItem>
                {roomTypes.map((rt) => <SelectItem key={rt.id} value={rt.id}>{rt.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={payment} onValueChange={setPayment}>
              <SelectTrigger><SelectValue placeholder="Payment" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any payment</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30 text-xs uppercase tracking-wide text-muted-foreground">
                <th className="text-left py-3 px-4 font-medium">Booking</th>
                <th className="text-left py-3 px-4 font-medium">Guest</th>
                <th className="text-left py-3 px-4 font-medium">Room</th>
                <th className="text-left py-3 px-4 font-medium">Check-in</th>
                <th className="text-left py-3 px-4 font-medium">Check-out</th>
                <th className="text-left py-3 px-4 font-medium">Source</th>
                <th className="text-left py-3 px-4 font-medium">Payment</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-right py-3 px-4 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const g = findGuest(r.guestId);
                const room = findRoom(r.roomIds[0]);
                const rt = findRoomType(r.roomTypeId);
                return (
                  <tr key={r.id} onClick={() => navigate(`/hotel-admin/reservations/${r.id}`)}
                    className="border-b border-border/40 hover:bg-secondary/30 transition-colors cursor-pointer">
                    <td className="py-3 px-4 font-mono text-xs">{r.code}</td>
                    <td className="py-3 px-4">
                      <Link to={`/hotel-admin/guests/${r.guestId}`} onClick={(e) => e.stopPropagation()}
                        className="font-medium hover:text-green-600">{g?.name}</Link>
                      <p className="text-xs text-muted-foreground">{g?.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium">Room {room?.number}</p>
                      <p className="text-xs text-muted-foreground">{rt?.name}</p>
                    </td>
                    <td className="py-3 px-4">{formatDate(r.checkIn)}</td>
                    <td className="py-3 px-4">{formatDate(r.checkOut)}</td>
                    <td className="py-3 px-4"><span className="text-xs px-2 py-0.5 rounded bg-secondary/60">{r.source}</span></td>
                    <td className="py-3 px-4"><StatusPill label={r.payment} tone={r.payment === "paid" ? "green" : r.payment === "pending" ? "amber" : r.payment === "refunded" ? "blue" : "red"} /></td>
                    <td className="py-3 px-4"><StatusPill label={r.status.replace("_", " ")} tone={statusTone[r.status]} /></td>
                    <td className="py-3 px-4 text-right font-semibold">{formatMoney(r.roomCharge)}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="py-12 text-center text-sm text-muted-foreground">No reservations match these filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default HotelAdminReservations;
