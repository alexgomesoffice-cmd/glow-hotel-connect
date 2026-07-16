// Bookings — platform-wide bookings dashboard with cards + recent table.
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { BOOKINGS, bookingStats } from "@/data/adminBookings";
import { KpiTile, OpsCard, OpsSectionHeader, OpsTable, OpsTd, OpsTh } from "@/components/admin/ops/primitives";
import { cn } from "@/lib/utils";

const bookingStatusChip = (s: string) => {
  const map: Record<string, string> = {
    confirmed: "border-sky-500/40 bg-sky-500/10 text-sky-400",
    checked_in: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
    checked_out: "border-zinc-400/30 bg-zinc-400/10 text-zinc-300",
    cancelled: "border-red-500/40 bg-red-500/10 text-red-400",
    pending: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  };
  return (
    <span className={cn("inline-flex rounded-sm border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider", map[s])}>
      {s.replace("_", " ")}
    </span>
  );
};

const paymentChip = (p: string) => {
  const map: Record<string, string> = {
    paid: "text-emerald-400",
    pending: "text-amber-400",
    refunded: "text-violet-400",
    failed: "text-red-400",
  };
  return <span className={cn("text-xs capitalize", map[p])}>{p}</span>;
};

const OpsBookings = () => {
  const stats = bookingStats();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [payment, setPayment] = useState("all");
  const [hotel, setHotel] = useState("all");
  const [city, setCity] = useState("all");
  const [date, setDate] = useState("all");

  const hotels = Array.from(new Set(BOOKINGS.map((b) => b.hotelName))).sort();
  const cities = Array.from(new Set(BOOKINGS.map((b) => b.hotelCity))).sort();

  const rows = useMemo(
    () =>
      BOOKINGS.filter((b) => {
        if (status !== "all" && b.status !== status) return false;
        if (payment !== "all" && b.payment !== payment) return false;
        if (hotel !== "all" && b.hotelName !== hotel) return false;
        if (city !== "all" && b.hotelCity !== city) return false;
        if (date !== "all") {
          const days = { "7d": 7, "30d": 30 }[date] ?? 9999;
          const ageDays = (Date.now() - new Date(b.createdAt).getTime()) / 86_400_000;
          if (ageDays > days) return false;
        }
        if (q) {
          const s = q.toLowerCase();
          if (!b.guestName.toLowerCase().includes(s) && !b.id.toLowerCase().includes(s) && !b.hotelName.toLowerCase().includes(s)) return false;
        }
        return true;
      }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [q, status, payment, hotel, city, date],
  );

  return (
    <div className="mx-auto max-w-[1600px] space-y-4 px-6 py-5">
      <OpsSectionHeader title="Bookings" description="Platform-wide booking activity" />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
        <KpiTile label="Today's Bookings" value={stats.todayBookings} tone="success" />
        <KpiTile label="Today's Revenue" value={`৳${stats.todayRevenue.toLocaleString()}`} tone="success" />
        <KpiTile label="Check-ins Today" value={stats.checkInsToday} />
        <KpiTile label="Check-outs Today" value={stats.checkOutsToday} />
        <KpiTile label="Pending Payments" value={stats.pendingPayments} tone={stats.pendingPayments > 0 ? "warning" : "default"} />
        <KpiTile label="Cancelled Today" value={stats.cancelledToday} tone={stats.cancelledToday > 0 ? "danger" : "default"} />
      </div>

      <OpsCard className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search booking #, guest, hotel…"
              className="h-8 w-full rounded-sm border border-border/60 bg-secondary/40 pl-7 pr-2 text-xs outline-none focus:border-primary/60"
            />
          </div>
          <select value={hotel} onChange={(e) => setHotel(e.target.value)} className="h-8 rounded-sm border border-border/60 bg-secondary/40 px-2 text-xs">
            <option value="all">All hotels</option>
            {hotels.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
          <select value={city} onChange={(e) => setCity(e.target.value)} className="h-8 rounded-sm border border-border/60 bg-secondary/40 px-2 text-xs">
            <option value="all">All cities</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-8 rounded-sm border border-border/60 bg-secondary/40 px-2 text-xs">
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="checked_in">Checked in</option>
            <option value="checked_out">Checked out</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select value={payment} onChange={(e) => setPayment(e.target.value)} className="h-8 rounded-sm border border-border/60 bg-secondary/40 px-2 text-xs">
            <option value="all">All payments</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
            <option value="failed">Failed</option>
          </select>
          <select value={date} onChange={(e) => setDate(e.target.value)} className="h-8 rounded-sm border border-border/60 bg-secondary/40 px-2 text-xs">
            <option value="all">Any date</option>
            <option value="7d">Last 7d</option>
            <option value="30d">Last 30d</option>
          </select>
        </div>
      </OpsCard>

      <OpsTable>
        <thead>
          <tr>
            <OpsTh className="w-28">Booking ID</OpsTh>
            <OpsTh>Guest</OpsTh>
            <OpsTh>Hotel</OpsTh>
            <OpsTh className="w-32">Room</OpsTh>
            <OpsTh className="w-28">Check In</OpsTh>
            <OpsTh className="w-28">Check Out</OpsTh>
            <OpsTh className="w-16 text-right">Guests</OpsTh>
            <OpsTh className="w-24">Payment</OpsTh>
            <OpsTh className="w-28">Status</OpsTh>
            <OpsTh className="w-28 text-right">Amount</OpsTh>
            <OpsTh className="w-24">Created</OpsTh>
          </tr>
        </thead>
        <tbody>
          {rows.map((b) => (
            <tr key={b.id} className="cursor-pointer hover:bg-secondary/40" onClick={() => window.location.assign(`/admin/booking/${b.id}`)}>
              <OpsTd><Link to={`/admin/booking/${b.id}`} className="font-mono text-xs hover:underline">{b.id}</Link></OpsTd>
              <OpsTd>
                <div className="text-[13px]">{b.guestName}</div>
                <div className="text-[11px] text-muted-foreground">{b.guestEmail}</div>
              </OpsTd>
              <OpsTd>
                <div className="text-[13px]">{b.hotelName}</div>
                <div className="text-[11px] text-muted-foreground">{b.hotelCity}</div>
              </OpsTd>
              <OpsTd className="text-xs text-muted-foreground">{b.roomName}</OpsTd>
              <OpsTd className="text-xs">{new Date(b.checkIn).toLocaleDateString()}</OpsTd>
              <OpsTd className="text-xs">{new Date(b.checkOut).toLocaleDateString()}</OpsTd>
              <OpsTd className="text-right font-mono text-xs">{b.guests}</OpsTd>
              <OpsTd>{paymentChip(b.payment)}</OpsTd>
              <OpsTd>{bookingStatusChip(b.status)}</OpsTd>
              <OpsTd className="text-right font-mono text-xs">৳{b.amount.toLocaleString()}</OpsTd>
              <OpsTd className="text-xs text-muted-foreground">{new Date(b.createdAt).toLocaleDateString()}</OpsTd>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={11} className="px-4 py-12 text-center text-sm text-muted-foreground">No bookings match the filters.</td></tr>
          )}
        </tbody>
      </OpsTable>
    </div>
  );
};

export default OpsBookings;
