import { Link } from "react-router-dom";
import {
  BedDouble, DollarSign, Users, LogIn, LogOut, ClipboardList,
  Plus, UserPlus, Calendar, Sparkles, Star, Bell, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { KPI, SectionCard, StatusPill, Timeline } from "@/components/hotel-admin/primitives";
import { useHotelStore, isToday, formatMoney, formatDateTime, findGuest, findRoom, cooldownRemainingMs } from "@/data/hotelAdminStore";

const HotelAdminOverview = () => {
  const store = useHotelStore((s) => s);
  const { reservations, rooms, reviews, notifications, draft } = store;

  const checkinsToday = reservations.filter((r) => isToday(r.checkIn) && r.status !== "cancelled");
  const checkoutsToday = reservations.filter((r) => isToday(r.checkOut) && r.status !== "cancelled");
  const occupied = rooms.filter((r) => r.status === "occupied").length;
  const available = rooms.filter((r) => r.status === "available").length;
  const revenueToday = reservations
    .filter((r) => isToday(r.createdAt) || isToday(r.checkIn))
    .reduce((s, r) => s + r.roomCharge, 0) || 4280;

  const upcomingArrivals = reservations
    .filter((r) => new Date(r.checkIn) > new Date() && r.status !== "cancelled")
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
    .slice(0, 4);
  const upcomingDepartures = reservations
    .filter((r) => new Date(r.checkOut) > new Date() && r.status === "checked_in")
    .sort((a, b) => a.checkOut.localeCompare(b.checkOut))
    .slice(0, 4);

  const draftFieldsCount = draft?.fields.length ?? 0;
  const draftLabel = !draft ? "No draft" : draft.status === "submitted" ? "Under review" : draft.status;
  const draftHint = draft
    ? `${draftFieldsCount} pending ${draftFieldsCount === 1 ? "field" : "fields"}`
    : "Listing is live";
  const cd = cooldownRemainingMs(draft);

  const timelineItems = [
    ...checkinsToday.map((r) => {
      const g = findGuest(r.guestId);
      return { at: r.checkIn, label: `Check-in · ${g?.name} · Room ${findRoom(r.roomIds[0])?.number}`, tone: "green" as const };
    }),
    ...checkoutsToday.map((r) => {
      const g = findGuest(r.guestId);
      return { at: r.checkOut, label: `Check-out · ${g?.name} · Room ${findRoom(r.roomIds[0])?.number}`, tone: "amber" as const };
    }),
    ...rooms.filter((r) => r.cleaning === "in_progress" || r.cleaning === "dirty").slice(0, 3).map((r) => ({
      at: new Date().toISOString(), label: `Cleaning · Room ${r.number} (${r.cleaning.replace("_", " ")})`, tone: undefined,
    })),
  ].sort((a, b) => a.at.localeCompare(b.at)).slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-in-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Good day, Maria 👋</h1>
          <p className="text-muted-foreground text-sm">Here's what's happening at your property today.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/hotel-admin/reservations"><Calendar className="h-4 w-4 mr-2" /> Reservations</Link>
          </Button>
          <Button variant="hero" size="sm" asChild>
            <Link to="/hotel-admin/rooms/add"><Plus className="h-4 w-4 mr-2" /> Add Room</Link>
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPI title="Check-ins Today" value={checkinsToday.length} icon={LogIn} color="from-green-500 to-emerald-500" hint={`${upcomingArrivals.length} upcoming`} />
        <KPI title="Check-outs Today" value={checkoutsToday.length} icon={LogOut} color="from-amber-500 to-orange-500" hint={`${upcomingDepartures.length} on stay`} />
        <KPI title="Occupied" value={occupied} icon={BedDouble} color="from-blue-500 to-indigo-500" hint={`of ${rooms.length} rooms`} />
        <KPI title="Available" value={available} icon={Sparkles} color="from-purple-500 to-pink-500" hint="ready to sell" />
        <KPI title="Revenue Today" value={formatMoney(revenueToday)} icon={DollarSign} color="from-green-600 to-teal-500" delta="+18%" trend="up" />
        <KPI title="Draft Status" value={draftLabel} icon={ClipboardList} color="from-slate-500 to-slate-700" hint={cd > 0 ? `Unlocks in ${Math.floor(cd / 3600000)}h` : draftHint} />
      </div>

      {/* Timeline + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Today's Timeline" description="Live operations across the property" icon={Calendar}>
            {timelineItems.length ? (
              <Timeline items={timelineItems} />
            ) : (
              <p className="text-sm text-muted-foreground">No scheduled activity yet today.</p>
            )}
          </SectionCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SectionCard title="Upcoming Arrivals" icon={LogIn}
              action={<Link to="/hotel-admin/reservations" className="text-xs text-green-600 hover:underline flex items-center gap-1">View all <ArrowRight className="h-3 w-3" /></Link>}
            >
              <ul className="divide-y divide-border/50 -my-2">
                {upcomingArrivals.map((r) => {
                  const g = findGuest(r.guestId);
                  return (
                    <li key={r.id} className="py-2.5 flex items-center justify-between text-sm">
                      <div>
                        <Link to={`/hotel-admin/reservations/${r.id}`} className="font-medium hover:text-green-600">{g?.name}</Link>
                        <p className="text-xs text-muted-foreground">{r.code} · Room {findRoom(r.roomIds[0])?.number}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{new Date(r.checkIn).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                    </li>
                  );
                })}
              </ul>
            </SectionCard>

            <SectionCard title="Upcoming Departures" icon={LogOut}
              action={<Link to="/hotel-admin/reservations" className="text-xs text-green-600 hover:underline flex items-center gap-1">View all <ArrowRight className="h-3 w-3" /></Link>}
            >
              <ul className="divide-y divide-border/50 -my-2">
                {upcomingDepartures.map((r) => {
                  const g = findGuest(r.guestId);
                  return (
                    <li key={r.id} className="py-2.5 flex items-center justify-between text-sm">
                      <div>
                        <Link to={`/hotel-admin/reservations/${r.id}`} className="font-medium hover:text-green-600">{g?.name}</Link>
                        <p className="text-xs text-muted-foreground">{r.code} · Room {findRoom(r.roomIds[0])?.number}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{new Date(r.checkOut).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                    </li>
                  );
                })}
              </ul>
            </SectionCard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SectionCard title="Latest Reservations" icon={Calendar}>
              <ul className="divide-y divide-border/50 -my-2">
                {reservations.slice(0, 4).map((r) => {
                  const g = findGuest(r.guestId);
                  return (
                    <li key={r.id} className="py-2.5 text-sm flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <Link to={`/hotel-admin/reservations/${r.id}`} className="font-medium hover:text-green-600 truncate block">{r.code} · {g?.name}</Link>
                        <p className="text-xs text-muted-foreground">{r.source}</p>
                      </div>
                      <StatusPill label={r.status.replace("_", " ")} tone={r.status === "checked_in" ? "green" : r.status === "cancelled" ? "red" : "blue"} />
                    </li>
                  );
                })}
              </ul>
            </SectionCard>

            <SectionCard title="Latest Reviews" icon={Star}>
              <ul className="divide-y divide-border/50 -my-2">
                {reviews.slice(0, 3).map((rv) => {
                  const g = findGuest(rv.guestId);
                  return (
                    <li key={rv.id} className="py-2.5 text-sm">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{g?.name}</p>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: rv.rating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{rv.comment}</p>
                    </li>
                  );
                })}
              </ul>
            </SectionCard>
          </div>
        </div>

        {/* Right rail */}
        <aside className="space-y-6">
          <SectionCard title="Quick Actions" icon={Sparkles}>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="justify-start" asChild><Link to="/hotel-admin/rooms/add"><Plus className="h-4 w-4 mr-2" />Add Room</Link></Button>
              <Button variant="outline" size="sm" className="justify-start" asChild><Link to="/hotel-admin/rooms"><BedDouble className="h-4 w-4 mr-2" />Room Types</Link></Button>
              <Button variant="outline" size="sm" className="justify-start" asChild><Link to="/hotel-admin/team/invite"><UserPlus className="h-4 w-4 mr-2" />Invite Sub Admin</Link></Button>
              <Button variant="outline" size="sm" className="justify-start" asChild><Link to="/hotel-admin/drafts"><ClipboardList className="h-4 w-4 mr-2" />Draft Center</Link></Button>
              <Button variant="outline" size="sm" className="justify-start" asChild><Link to="/hotel-admin/reservations"><Calendar className="h-4 w-4 mr-2" />Reservations</Link></Button>
              <Button variant="outline" size="sm" className="justify-start" asChild><Link to="/hotel-admin/revenue"><DollarSign className="h-4 w-4 mr-2" />Revenue</Link></Button>
            </div>
          </SectionCard>

          <SectionCard title="Draft Activity" icon={ClipboardList}
            action={<Link to="/hotel-admin/drafts" className="text-xs text-green-600 hover:underline flex items-center gap-1">Open <ArrowRight className="h-3 w-3" /></Link>}
          >
            {draft ? (
              <Timeline items={draft.timeline.slice(-4).reverse()} />
            ) : (
              <p className="text-sm text-muted-foreground">No draft activity.</p>
            )}
          </SectionCard>

          <SectionCard title="Notifications" icon={Bell}>
            <ul className="space-y-3">
              {notifications.slice(0, 4).map((n) => (
                <li key={n.id} className="text-sm">
                  <div className="flex items-start gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${n.read ? "bg-muted-foreground/30" : "bg-green-500"}`} />
                    <div className="min-w-0">
                      <p className="font-medium leading-tight">{n.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground/70 mt-0.5">{formatDateTime(n.createdAt)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>
        </aside>
      </div>
    </div>
  );
};

export default HotelAdminOverview;
