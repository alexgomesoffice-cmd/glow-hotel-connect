// Ops Dashboard — work-first (no priority, no assignment, no SLA).
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowUpRight, Clock, FileText, Inbox, Sparkles, MapPin, Plus, Building2 } from "lucide-react";
import { CASES, HOTELS, formatRelative, formatWaiting, CASE_TYPE_LABEL } from "@/data/adminCases";
import { bookingStats } from "@/data/adminBookings";
import { KpiTile, OpsCard, OpsSectionHeader, StatusBadge } from "@/components/admin/ops/primitives";

const OpsDashboard = () => {
  const pending = CASES.filter((c) => c.status === "pending");
  const registrations = pending.filter((c) => c.type === "registration");
  const legalPending = pending.filter((c) => c.type === "legal");
  const oldest = [...pending].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).slice(0, 8);
  const stats = bookingStats();

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 px-6 py-5">
      <OpsSectionHeader
        title="Operations Dashboard"
        description="What needs attention right now."
        right={
          <div className="text-xs text-muted-foreground">
            {new Date().toLocaleString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
        <KpiTile label="Pending Cases" value={pending.length} />
        <KpiTile label="Registrations" value={registrations.length} tone={registrations.length > 0 ? "warning" : "default"} />
        <KpiTile label="Legal Pending" value={legalPending.length} tone="warning" />
        <KpiTile label="Bookings Today" value={stats.todayBookings} tone="success" />
        <KpiTile label="Revenue Today" value={`৳${stats.todayRevenue.toLocaleString()}`} tone="success" />
        <KpiTile label="Check-ins Today" value={stats.checkInsToday} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <OpsCard className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <Inbox className="h-3.5 w-3.5 text-muted-foreground" />
              <h2 className="text-[13px] font-semibold">Oldest Pending (FIFO)</h2>
              <span className="rounded-sm bg-secondary px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-muted-foreground">{pending.length}</span>
            </div>
            <Link to="/admin/work-queue" className="text-xs text-primary hover:underline">
              Open queue <ArrowUpRight className="ml-0.5 inline h-3 w-3" />
            </Link>
          </div>
          <ul className="divide-y divide-border/40">
            {oldest.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-muted-foreground">Queue empty. Nice.</li>
            )}
            {oldest.map((c) => {
              const w = formatWaiting(c.createdAt);
              return (
                <li key={c.id}>
                  <Link to={`/admin/cases/${c.id}`} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary/50">
                    <span className="w-24 font-mono text-xs text-muted-foreground">{c.number}</span>
                    <span className="w-28 truncate text-[11px] uppercase tracking-wider text-muted-foreground">{CASE_TYPE_LABEL[c.type]}</span>
                    <span className="flex-1 truncate">{c.hotelName}</span>
                    <StatusBadge status={c.status} />
                    <span className="ml-2 font-mono text-xs tabular-nums text-muted-foreground">{w.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </OpsCard>

        <div className="space-y-3">
          <OpsCard>
            <div className="border-b border-border/60 px-4 py-2.5 text-[13px] font-semibold">Pending Reviews</div>
            <ul className="divide-y divide-border/40 text-sm">
              {[
                { label: "Hotels waiting approval", count: registrations.length, to: "/admin/work-queue?type=registration", icon: Sparkles },
                { label: "Property updates", count: pending.filter((c) => c.type === "property").length, to: "/admin/work-queue?type=property", icon: FileText },
                { label: "Expired licenses", count: 2, to: "/admin/work-queue?type=legal", icon: AlertTriangle },
              ].map((b) => (
                <li key={b.label}>
                  <Link to={b.to} className="flex items-center justify-between px-4 py-2.5 hover:bg-secondary/50">
                    <span className="flex items-center gap-2 text-[13px]">
                      <b.icon className="h-3.5 w-3.5 text-muted-foreground" />
                      {b.label}
                    </span>
                    <span className="font-mono text-sm tabular-nums">{b.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </OpsCard>

          <OpsCard>
            <div className="border-b border-border/60 px-4 py-2.5 text-[13px] font-semibold">Quick Actions</div>
            <div className="grid grid-cols-2 gap-px bg-border/40 text-sm">
              {[
                { label: "Add Hotel", to: "/admin/hotels/new", icon: Building2 },
                { label: "System Admin", to: "/admin/system-admins?new=1", icon: Plus },
                { label: "City", to: "/admin/catalog/cities?new=1", icon: MapPin },
                { label: "Amenity", to: "/admin/catalog/amenities?new=1", icon: Sparkles },
              ].map((a) => (
                <Link key={a.label} to={a.to} className="flex items-center justify-center gap-1.5 bg-card px-3 py-3 text-xs hover:bg-secondary/50">
                  <a.icon className="h-3.5 w-3.5 text-muted-foreground" />
                  {a.label}
                </Link>
              ))}
            </div>
          </OpsCard>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <OpsCard>
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
            <h2 className="flex items-center gap-2 text-[13px] font-semibold">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" /> Latest Activity
            </h2>
            <Link to="/admin/activity" className="text-xs text-primary hover:underline">
              View log <ArrowUpRight className="ml-0.5 inline h-3 w-3" />
            </Link>
          </div>
          <ol className="relative divide-y divide-border/40 text-sm">
            {CASES.slice(0, 6).map((c) => {
              const evt = c.timeline[c.timeline.length - 1];
              return (
                <li key={c.id} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
                  <span className="font-mono text-xs text-muted-foreground">{c.number}</span>
                  <span className="flex-1 truncate text-xs">
                    <span className="text-foreground">{evt.actor}</span>{" "}
                    <span className="text-muted-foreground">{evt.message}</span>
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">{formatRelative(evt.at)}</span>
                </li>
              );
            })}
          </ol>
        </OpsCard>

        <OpsCard>
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
            <h2 className="text-[13px] font-semibold">Recent Hotels</h2>
            <Link to="/admin/hotels" className="text-xs text-primary hover:underline">
              View all <ArrowUpRight className="ml-0.5 inline h-3 w-3" />
            </Link>
          </div>
          <ul className="divide-y divide-border/40 text-sm">
            {HOTELS.slice(0, 6).map((h) => (
              <li key={h.id}>
                <Link to={`/admin/hotels/${h.id}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/50">
                  <div className="grid h-7 w-7 place-items-center rounded-sm bg-secondary text-[10px] font-semibold">{h.logo}</div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-[13px]">{h.name}</div>
                    <div className="text-[11px] text-muted-foreground">{h.city}</div>
                  </div>
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    ৳{h.revenue30d.toLocaleString()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </OpsCard>
      </div>
    </div>
  );
};

export default OpsDashboard;
