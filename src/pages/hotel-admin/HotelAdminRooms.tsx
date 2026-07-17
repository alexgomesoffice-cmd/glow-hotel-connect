import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus, Search, BedDouble, Copy, Archive, Edit3, Calendar, DollarSign, Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusPill, SectionCard } from "@/components/hotel-admin/primitives";
import ConfirmDialog from "@/components/ConfirmDialog";
import { toast } from "@/hooks/use-toast";
import { useHotelStore, formatMoney, findGuest, updateStore, findRoomType } from "@/data/hotelAdminStore";
import { cn } from "@/lib/utils";

const HotelAdminRooms = () => {
  const store = useHotelStore((s) => s);
  const { roomTypes, rooms, reservations, amenities } = store;
  const [tab, setTab] = useState("types");
  const [archiveId, setArchiveId] = useState<string | null>(null);
  const [roomSearch, setRoomSearch] = useState("");
  const [roomStatus, setRoomStatus] = useState("all");

  const roomsByType = useMemo(() => {
    const m: Record<string, { total: number; occupied: number; available: number }> = {};
    roomTypes.forEach((rt) => (m[rt.id] = { total: 0, occupied: 0, available: 0 }));
    rooms.forEach((r) => {
      if (!m[r.typeId]) return;
      m[r.typeId].total++;
      if (r.status === "occupied") m[r.typeId].occupied++;
      if (r.status === "available") m[r.typeId].available++;
    });
    return m;
  }, [rooms, roomTypes]);

  const filteredRooms = rooms.filter((r) => {
    if (roomStatus !== "all" && r.status !== roomStatus) return false;
    if (roomSearch && !`${r.number} ${findRoomType(r.typeId)?.name}`.toLowerCase().includes(roomSearch.toLowerCase())) return false;
    return true;
  });

  const handleArchive = () => {
    if (!archiveId) return;
    updateStore((s) => ({ ...s, roomTypes: s.roomTypes.map((rt) => rt.id === archiveId ? { ...rt, archived: true } : rt) }));
    toast({ title: "Room type archived" });
    setArchiveId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-in-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Rooms</h1>
          <p className="text-muted-foreground text-sm">{rooms.length} rooms across {roomTypes.length} room types</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-2" /> New Room Type</Button>
          <Button variant="hero" size="sm" asChild><Link to="/hotel-admin/rooms/add"><Plus className="h-4 w-4 mr-2" /> Add Room</Link></Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="types">Room Types</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>

        {/* Room Types */}
        <TabsContent value="types" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {roomTypes.filter((rt) => !rt.archived).map((rt) => {
              const stats = roomsByType[rt.id] || { total: 0, occupied: 0, available: 0 };
              return (
                <Card key={rt.id} className="hover-lift overflow-hidden">
                  <div className="h-32 bg-gradient-to-br from-green-500/20 via-emerald-400/10 to-transparent relative">
                    <div className="absolute top-3 left-3"><StatusPill label={`${stats.available} / ${stats.total} available`} tone="green" /></div>
                    <div className="absolute bottom-3 right-3 text-right">
                      <p className="text-xs text-muted-foreground">Base price</p>
                      <p className="text-lg font-bold">{formatMoney(rt.basePrice)}<span className="text-xs text-muted-foreground">/night</span></p>
                    </div>
                  </div>
                  <CardContent className="p-5 space-y-3">
                    <div>
                      <h3 className="font-semibold">{rt.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{rt.description}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <Stat label="Total" value={stats.total} />
                      <Stat label="Booked" value={stats.occupied} />
                      <Stat label="Available" value={stats.available} />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {rt.amenities.slice(0, 4).map((a) => {
                        const am = amenities.find((x) => x.id === a);
                        return <span key={a} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/60 text-muted-foreground">{am?.label || a}</span>;
                      })}
                      {rt.amenities.length > 4 && <span className="text-[10px] text-muted-foreground">+{rt.amenities.length - 4}</span>}
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button variant="outline" size="sm" className="flex-1"><Edit3 className="h-3 w-3 mr-1" /> Edit</Button>
                      <Button variant="outline" size="sm"><Copy className="h-3 w-3" /></Button>
                      <Button variant="outline" size="sm" onClick={() => setArchiveId(rt.id)}><Archive className="h-3 w-3" /></Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Rooms */}
        <TabsContent value="rooms" className="mt-6 space-y-4">
          <Card>
            <CardContent className="p-4 flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search rooms…" value={roomSearch} onChange={(e) => setRoomSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={roomStatus} onValueChange={setRoomStatus}>
                <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="out_of_order">Out of Order</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/30 text-xs uppercase text-muted-foreground">
                    <th className="text-left py-3 px-4">Room</th>
                    <th className="text-left py-3 px-4">Type</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Cleaning</th>
                    <th className="text-left py-3 px-4">Current Guest</th>
                    <th className="text-left py-3 px-4">Next Booking</th>
                    <th className="text-left py-3 px-4">Maintenance</th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRooms.map((r) => {
                    const rt = findRoomType(r.typeId);
                    const guest = r.currentGuestId ? findGuest(r.currentGuestId) : null;
                    const next = reservations
                      .filter((res) => res.roomIds.includes(r.id) && new Date(res.checkIn) > new Date())
                      .sort((a, b) => a.checkIn.localeCompare(b.checkIn))[0];
                    return (
                      <tr key={r.id} className="border-b border-border/40 hover:bg-secondary/30">
                        <td className="py-3 px-4 font-semibold">#{r.number}</td>
                        <td className="py-3 px-4 text-muted-foreground">{rt?.name}</td>
                        <td className="py-3 px-4"><StatusPill label={r.status.replace("_", " ")} tone={r.status === "available" ? "green" : r.status === "occupied" ? "blue" : r.status === "maintenance" ? "amber" : "red"} /></td>
                        <td className="py-3 px-4"><StatusPill label={r.cleaning.replace("_", " ")} tone={r.cleaning === "clean" || r.cleaning === "inspected" ? "green" : r.cleaning === "dirty" ? "amber" : "blue"} /></td>
                        <td className="py-3 px-4">{guest ? <Link className="hover:text-green-600" to={`/hotel-admin/guests/${guest.id}`}>{guest.name}</Link> : <span className="text-muted-foreground">—</span>}</td>
                        <td className="py-3 px-4 text-xs">{next ? new Date(next.checkIn).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : <span className="text-muted-foreground">—</span>}</td>
                        <td className="py-3 px-4 text-xs text-muted-foreground">{r.maintenanceNote || "—"}</td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="ghost" size="sm" asChild><Link to={`/hotel-admin/rooms/edit/${r.id}`}><Edit3 className="h-3 w-3" /></Link></Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Availability */}
        <TabsContent value="availability" className="mt-6">
          <SectionCard title="Availability Calendar" icon={Calendar}>
            <AvailabilityGrid />
          </SectionCard>
        </TabsContent>

        {/* Pricing */}
        <TabsContent value="pricing" className="mt-6 space-y-6">
          <SectionCard title="Base & Weekend Rates" icon={DollarSign}>
            <div className="space-y-3">
              {roomTypes.map((rt) => (
                <div key={rt.id} className="grid grid-cols-1 md:grid-cols-4 items-center gap-3 p-3 rounded-xl border border-border/50">
                  <p className="font-medium">{rt.name}</p>
                  <div><label className="text-xs text-muted-foreground">Base</label><Input defaultValue={rt.basePrice} type="number" /></div>
                  <div><label className="text-xs text-muted-foreground">Weekend</label><Input defaultValue={rt.weekendPrice} type="number" /></div>
                  <Button variant="outline" size="sm">Save</Button>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Seasonal Pricing" icon={Wrench}>
            <p className="text-sm text-muted-foreground">Configure high/low season multipliers per room type. Bulk editor coming soon.</p>
          </SectionCard>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={!!archiveId}
        onOpenChange={(v) => !v && setArchiveId(null)}
        title="Archive this room type?"
        description="Are you sure you want to archive this room type? It will be hidden from public listings but existing bookings will remain."
        variant="destructive"
        confirmLabel="Archive"
        onConfirm={handleArchive}
      />
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-lg bg-secondary/40 p-2">
    <p className="text-lg font-bold">{value}</p>
    <p className="text-[10px] uppercase text-muted-foreground tracking-wide">{label}</p>
  </div>
);

const AvailabilityGrid = () => {
  const { rooms, reservations } = useHotelStore((s) => s);
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i); return d;
  });
  const isOccupied = (roomId: string, date: Date) =>
    reservations.some((r) => r.roomIds.includes(roomId) && new Date(r.checkIn) <= date && new Date(r.checkOut) > date && r.status !== "cancelled");

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-xs">
        <thead>
          <tr>
            <th className="sticky left-0 bg-card text-left py-2 pr-3 border-b border-border">Room</th>
            {days.map((d) => (
              <th key={d.toISOString()} className="p-2 text-center border-b border-border font-normal text-muted-foreground min-w-[42px]">
                <div>{d.toLocaleDateString(undefined, { weekday: "short" })[0]}</div>
                <div className="font-semibold text-foreground">{d.getDate()}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rooms.map((r) => (
            <tr key={r.id} className="border-b border-border/40">
              <td className="sticky left-0 bg-card py-2 pr-3 font-medium">#{r.number}</td>
              {days.map((d) => {
                const busy = isOccupied(r.id, d);
                const maint = r.status === "maintenance";
                return (
                  <td key={d.toISOString()} className="p-1">
                    <div className={cn(
                      "h-6 rounded",
                      maint ? "bg-amber-500/30" : busy ? "bg-green-500/40" : "bg-secondary/40",
                    )} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500/40" /> Booked</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500/30" /> Maintenance</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-secondary/60 border border-border" /> Available</span>
      </div>
    </div>
  );
};

export default HotelAdminRooms;
