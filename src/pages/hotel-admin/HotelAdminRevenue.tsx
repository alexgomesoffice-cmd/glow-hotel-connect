import { useMemo } from "react";
import { DollarSign, TrendingUp, BarChart3, PieChart as PieIcon, Percent, Bed } from "lucide-react";
import { KPI, SectionCard, StatusPill } from "@/components/hotel-admin/primitives";
import { Card } from "@/components/ui/card";
import { useHotelStore, formatMoney, formatDate } from "@/data/hotelAdminStore";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, BarChart, Bar, Legend } from "recharts";

const HotelAdminRevenue = () => {
  const { reservations, rooms, transactions } = useHotelStore((s) => s);

  const stats = useMemo(() => {
    const paid = reservations.filter((r) => r.payment === "paid" && r.status !== "cancelled");
    const total = paid.reduce((s, r) => s + r.roomCharge, 0);
    const nights = paid.reduce((s, r) => {
      const n = Math.max(1, Math.round((+new Date(r.checkOut) - +new Date(r.checkIn)) / 86400000));
      return s + n;
    }, 0);
    const adr = nights ? total / nights : 0;
    const occ = rooms.length ? rooms.filter((r) => r.status === "occupied").length / rooms.length : 0;
    return { total, today: Math.round(total * 0.05), week: Math.round(total * 0.3), month: total, adr, occ, revpar: adr * occ };
  }, [reservations, rooms]);

  const daily = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    return { day: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }), revenue: 1200 + Math.round(Math.sin(i) * 500 + i * 120) };
  });
  const monthly = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
    return { month: d.toLocaleDateString(undefined, { month: "short" }), revenue: 22000 + i * 3200 };
  });
  const occupancy = Array.from({ length: 14 }, (_, i) => ({
    day: `D${i + 1}`, occupancy: 55 + Math.round(Math.cos(i / 2) * 20),
  }));
  const sources = ["Direct", "Booking.com", "Expedia", "Airbnb", "Agoda"].map((s) => ({
    name: s, value: reservations.filter((r) => r.source === s).length || 1,
  }));
  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6"];

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl sm:text-3xl font-bold">Revenue</h1>
        <p className="text-muted-foreground text-sm">Business performance at a glance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPI title="Revenue Today" value={formatMoney(stats.today)} icon={DollarSign} color="from-green-500 to-emerald-500" delta="+18%" trend="up" />
        <KPI title="This Week" value={formatMoney(stats.week)} icon={DollarSign} color="from-blue-500 to-indigo-500" delta="+8%" trend="up" />
        <KPI title="This Month" value={formatMoney(stats.month)} icon={TrendingUp} color="from-purple-500 to-pink-500" delta="+12%" trend="up" />
        <KPI title="Occupancy" value={`${Math.round(stats.occ * 100)}%`} icon={Bed} color="from-amber-500 to-orange-500" />
        <KPI title="ADR" value={formatMoney(stats.adr)} icon={Percent} color="from-slate-500 to-slate-700" hint="Avg daily rate" />
        <KPI title="RevPAR" value={formatMoney(stats.revpar)} icon={BarChart3} color="from-teal-500 to-emerald-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Daily Revenue" icon={BarChart3}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Monthly Revenue" icon={BarChart3}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Occupancy Trend" icon={Percent}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={occupancy}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Line type="monotone" dataKey="occupancy" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Booking Sources" icon={PieIcon}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sources} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {sources.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Recent Transactions" icon={DollarSign}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase text-muted-foreground border-b border-border">
                <th className="text-left py-2 pr-4">Booking</th>
                <th className="text-left py-2 pr-4">Method</th>
                <th className="text-left py-2 pr-4">Type</th>
                <th className="text-left py-2 pr-4">Date</th>
                <th className="text-right py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 10).map((t) => (
                <tr key={t.id} className="border-b border-border/40">
                  <td className="py-3 pr-4 font-mono text-xs">{t.bookingId}</td>
                  <td className="py-3 pr-4">{t.method}</td>
                  <td className="py-3 pr-4"><StatusPill label={t.type} tone={t.type === "charge" ? "green" : "amber"} /></td>
                  <td className="py-3 pr-4">{formatDate(t.createdAt)}</td>
                  <td className="py-3 text-right font-semibold">{formatMoney(t.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
};

export default HotelAdminRevenue;
