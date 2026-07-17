import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Star, Crown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useHotelStore, formatMoney, formatDate } from "@/data/hotelAdminStore";
import { StatusPill } from "@/components/hotel-admin/primitives";

const HotelAdminGuests = () => {
  const navigate = useNavigate();
  const { guests, reservations, reviews } = useHotelStore((s) => s);
  const [search, setSearch] = useState("");

  const rows = useMemo(() => guests.map((g) => {
    const gRes = reservations.filter((r) => r.guestId === g.id);
    const nights = gRes.reduce((s, r) => {
      const n = Math.max(1, Math.round((+new Date(r.checkOut) - +new Date(r.checkIn)) / 86400000));
      return s + n;
    }, 0);
    const spent = gRes.reduce((s, r) => s + r.roomCharge, 0);
    const last = gRes.map((r) => r.checkOut).sort().reverse()[0];
    const gReviews = reviews.filter((rv) => rv.guestId === g.id);
    const avgRating = gReviews.length ? gReviews.reduce((s, r) => s + r.rating, 0) / gReviews.length : null;
    return { g, bookings: gRes.length, nights, spent, last, avgRating };
  }), [guests, reservations, reviews]);

  const filtered = rows.filter(({ g }) =>
    !search || `${g.name} ${g.email} ${g.phone}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl sm:text-3xl font-bold">Guests</h1>
        <p className="text-muted-foreground text-sm">{filtered.length} guests · your hotel CRM</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search guests by name, email, phone…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30 text-xs uppercase tracking-wide text-muted-foreground">
                <th className="text-left py-3 px-4 font-medium">Guest</th>
                <th className="text-left py-3 px-4 font-medium">Phone</th>
                <th className="text-left py-3 px-4 font-medium">Email</th>
                <th className="text-left py-3 px-4 font-medium">Nationality</th>
                <th className="text-right py-3 px-4 font-medium">Bookings</th>
                <th className="text-right py-3 px-4 font-medium">Nights</th>
                <th className="text-right py-3 px-4 font-medium">Total Spent</th>
                <th className="text-left py-3 px-4 font-medium">Last Stay</th>
                <th className="text-left py-3 px-4 font-medium">Rating</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ g, bookings, nights, spent, last, avgRating }) => (
                <tr key={g.id} onClick={() => navigate(`/hotel-admin/guests/${g.id}`)}
                  className="border-b border-border/40 hover:bg-secondary/30 cursor-pointer transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-primary-foreground text-xs font-semibold">
                        {g.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium flex items-center gap-1">
                          {g.name}
                          {g.vip && <Crown className="h-3 w-3 text-amber-500 fill-amber-500" />}
                        </p>
                        <p className="text-xs text-muted-foreground">{g.nid}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">{g.phone}</td>
                  <td className="py-3 px-4">{g.email}</td>
                  <td className="py-3 px-4">{g.nationality}</td>
                  <td className="py-3 px-4 text-right font-medium">{bookings}</td>
                  <td className="py-3 px-4 text-right">{nights}</td>
                  <td className="py-3 px-4 text-right font-semibold">{formatMoney(spent)}</td>
                  <td className="py-3 px-4">{last ? formatDate(last) : <span className="text-muted-foreground">—</span>}</td>
                  <td className="py-3 px-4">
                    {avgRating != null ? (
                      <span className="inline-flex items-center gap-1 text-xs"><Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {avgRating.toFixed(1)}</span>
                    ) : <span className="text-muted-foreground text-xs">—</span>}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={9} className="py-12 text-center text-sm text-muted-foreground">No guests match.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default HotelAdminGuests;
