// Hotel Workspace: operating page for a single hotel.
// System Admin edits Live directly — no approval.
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MoreHorizontal, Pencil } from "lucide-react";
import { casesForHotel, findHotel, formatRelative, pendingDraftForHotel, countModifiedFields } from "@/data/adminCases";
import { bookingsForHotel } from "@/data/adminBookings";
import { HealthBadge, KpiTile, OpsCard, StatusBadge, VersionBadge, OpsTable, OpsTh, OpsTd } from "@/components/admin/ops/primitives";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { DUMMY_PUBLIC_HOTELS } from "@/data/dummyHotels";

const TABS = ["Overview", "Property", "Rooms", "Bookings", "Staff", "Commercial", "Activity"] as const;
type Tab = (typeof TABS)[number];

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

const OpsHotelWorkspace = () => {
  const { id } = useParams();
  const h = findHotel(Number(id));
  const [tab, setTab] = useState<Tab>("Overview");
  const [confirm, setConfirm] = useState<null | string>(null);
  const [editSection, setEditSection] = useState<null | string>(null);
  const { toast } = useToast();

  const bookings = useMemo(() => (h ? bookingsForHotel(h.id) : []), [h]);
  const dummy = useMemo(() => (h ? DUMMY_PUBLIC_HOTELS.find((d) => d.hotel_id === h.id) ?? DUMMY_PUBLIC_HOTELS[0] : undefined), [h]);

  if (!h) return <div className="p-8 text-sm text-muted-foreground">Hotel not found.</div>;
  const cases = casesForHotel(h.id);
  const pendingDraft = pendingDraftForHotel(h.id);

  const doQuick = (action: string) => {
    setConfirm(null);
    toast({ title: `${action} — ${h.name}` });
  };

  const saveLive = () => {
    setEditSection(null);
    toast({ title: "Live data updated", description: `${editSection} section saved directly to Live.` });
  };

  const propertySections: { title: string; fields: { label: string; value: string }[] }[] = [
    {
      title: "General",
      fields: [
        { label: "Hotel Name", value: dummy?.name ?? h.name },
        { label: "Hotel Type", value: dummy?.hotel_type ?? "Hotel" },
        { label: "Star Rating", value: String(dummy?.hotel_details?.star_rating ?? "—") },
        { label: "Status", value: h.status },
      ],
    },
    {
      title: "Business",
      fields: [
        { label: "Business Name", value: `${h.name} Ltd.` },
        { label: "Trade License", value: "TL-8842-2026" },
        { label: "TIN", value: "213-547-8890" },
        { label: "VAT Reg", value: "VAT-BD-4421" },
      ],
    },
    {
      title: "Location",
      fields: [
        { label: "City", value: dummy?.city ?? h.city },
        { label: "Address", value: dummy?.address ?? "—" },
        { label: "Country", value: "Bangladesh" },
        { label: "Zip Code", value: "1215" },
      ],
    },
    {
      title: "Contacts",
      fields: [
        { label: "Reception 1", value: "+880-2-9668855" },
        { label: "Reception 2", value: "+880-2-9668800" },
        { label: "Email", value: h.adminEmail },
        { label: "Website", value: `www.${h.name.toLowerCase().replace(/[^a-z]/g, "")}.bd` },
      ],
    },
    {
      title: "Amenities",
      fields: (dummy?.hotel_amenities ?? []).slice(0, 6).map((a, i) => ({ label: `#${i + 1}`, value: a.amenity.name })),
    },
    {
      title: "Policies",
      fields: [
        { label: "Check-in", value: "14:00" },
        { label: "Check-out", value: "12:00" },
        { label: "Cancellation", value: "Free until 24h before check-in" },
      ],
    },
    {
      title: "Gallery",
      fields: (dummy?.hotel_images ?? []).slice(0, 4).map((img, i) => ({ label: `Image ${i + 1}`, value: img.image_url })),
    },
  ];

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-4">
      <div className="mb-3 flex items-center gap-3">
        <Link to="/admin/hotels" className="rounded-sm border border-border/60 bg-secondary/40 p-1 hover:bg-secondary">
          <ArrowLeft className="h-3.5 w-3.5" />
        </Link>
        <div className="grid h-9 w-9 place-items-center rounded-sm bg-secondary text-xs font-bold">{h.logo}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-[15px] font-semibold">{h.name}</h1>
            <VersionBadge v={h.status} />
          </div>
          <div className="text-xs text-muted-foreground">{h.city} · Owner {h.ownerName}</div>
        </div>
        <Button size="sm" variant="secondary" className="h-8"><MoreHorizontal className="h-4 w-4" /></Button>
      </div>

      <div className="mb-4 flex flex-wrap border-b border-border/60">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-[13px]",
              tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <KpiTile label="Hotel Status" value={<span className="text-base">{h.status}</span>} />
            <KpiTile label="Verification" value={<span className="text-base capitalize">{h.verification}</span>} tone={h.verification === "verified" ? "success" : "warning"} />
            <KpiTile label="Pending Draft" value={pendingDraft ? "Yes" : "—"} tone={pendingDraft ? "warning" : "default"} sub={pendingDraft ? pendingDraft.number : undefined} />
            <KpiTile label="Health Score" value={<HealthBadge score={h.health} />} sub="out of 100" />
            <KpiTile label="Owner" value={<span className="text-sm">{h.ownerName}</span>} sub={h.ownerEmail} />
            <KpiTile label="Hotel Admin" value={<span className="text-sm">{h.adminName}</span>} sub={h.adminEmail} />
            <KpiTile label="Today's Bookings" value={bookings.length} tone="success" />
            <KpiTile label="Revenue 30d" value={`৳${h.revenue30d.toLocaleString()}`} tone="success" />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <OpsCard className="lg:col-span-2">
              <div className="border-b border-border/60 px-3 py-2 text-[13px] font-semibold">Latest Activity</div>
              <ul className="divide-y divide-border/40 text-sm">
                {cases.length === 0 && <li className="px-3 py-4 text-center text-xs text-muted-foreground">No cases yet.</li>}
                {cases.map((c) => (
                  <li key={c.id}>
                    <Link to={`/admin/cases/${c.id}`} className="flex items-center gap-3 px-3 py-2 hover:bg-secondary/50">
                      <span className="font-mono text-xs text-muted-foreground">{c.number}</span>
                      <span className="flex-1 truncate">{c.summary}</span>
                      <StatusBadge status={c.status} />
                      <span className="font-mono text-[11px] text-muted-foreground">{formatRelative(c.createdAt)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </OpsCard>
            <OpsCard>
              <div className="border-b border-border/60 px-3 py-2 text-[13px] font-semibold">Quick Actions</div>
              <div className="divide-y divide-border/40 text-sm">
                {["Suspend", "Publish", "Feature", "Reset Password", "Deactivate"].map((a) => (
                  <button key={a} onClick={() => setConfirm(a)} className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-secondary/50">
                    <span>{a}</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Confirm</span>
                  </button>
                ))}
              </div>
            </OpsCard>
          </div>
        </div>
      )}

      {tab === "Property" && (
        <div className="space-y-3">
          {pendingDraft && (
            <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-300">Pending Draft</div>
                  <div className="mt-0.5 text-amber-200/80">
                    <span className="font-mono">{pendingDraft.number}</span> · Modified fields: {countModifiedFields(pendingDraft)} · Submitted {formatRelative(pendingDraft.createdAt)} · Last updated {formatRelative(pendingDraft.lastUpdatedAt)}
                  </div>
                  <div className="mt-1 text-amber-200/60">Hotel editing is locked until the review completes.</div>
                </div>
                <Link to={`/admin/cases/${pendingDraft.id}`}>
                  <Button size="sm" className="h-8 bg-amber-500/30 text-amber-100 hover:bg-amber-500/40">Review Draft</Button>
                </Link>
              </div>
            </div>
          )}
          {propertySections.map((s) => (
            <OpsCard key={s.title}>
              <div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
                <div className="text-[13px] font-semibold">{s.title}</div>
                <Button size="sm" variant="secondary" className="h-7 gap-1.5 text-xs" onClick={() => setEditSection(s.title)}>
                  <Pencil className="h-3 w-3" /> Edit
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-x-6 gap-y-2 px-3 py-3 md:grid-cols-2">
                {s.fields.map((f) => (
                  <div key={f.label} className="flex justify-between gap-3 border-b border-border/30 py-1.5 last:border-b-0">
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{f.label}</span>
                    <span className="truncate text-[13px]">{f.value}</span>
                  </div>
                ))}
              </div>
            </OpsCard>
          ))}
        </div>
      )}

      {tab === "Rooms" && (
        <OpsTable>
          <thead>
            <tr>
              <OpsTh>Room Type</OpsTh>
              <OpsTh className="w-28">Bed</OpsTh>
              <OpsTh className="w-28 text-right">Base Price</OpsTh>
              <OpsTh className="w-28 text-right">Inventory</OpsTh>
              <OpsTh className="w-24">Status</OpsTh>
            </tr>
          </thead>
          <tbody>
            {(dummy?.hotel_rooms ?? []).map((r, i) => (
              <tr key={i} className="hover:bg-secondary/40">
                <OpsTd>{r.room_type}</OpsTd>
                <OpsTd className="text-xs text-muted-foreground">{r.hotel_room_details?.[0]?.bed_type ?? "—"}</OpsTd>
                <OpsTd className="text-right font-mono text-xs">৳{r.base_price?.toLocaleString()}</OpsTd>
                <OpsTd className="text-right font-mono text-xs text-muted-foreground">12</OpsTd>
                <OpsTd><span className="inline-flex rounded-sm border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-400">Active</span></OpsTd>
              </tr>
            ))}
          </tbody>
        </OpsTable>
      )}

      {tab === "Bookings" && (
        <OpsTable>
          <thead>
            <tr>
              <OpsTh className="w-28">Booking ID</OpsTh>
              <OpsTh>Guest</OpsTh>
              <OpsTh>Room</OpsTh>
              <OpsTh className="w-28">Check In</OpsTh>
              <OpsTh className="w-28">Check Out</OpsTh>
              <OpsTh className="w-24">Payment</OpsTh>
              <OpsTh className="w-28">Status</OpsTh>
              <OpsTh className="w-24 text-right">Amount</OpsTh>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="cursor-pointer hover:bg-secondary/40" onClick={() => window.location.assign(`/admin/booking/${b.id}`)}>
                <OpsTd><Link to={`/admin/booking/${b.id}`} className="font-mono text-xs hover:underline">{b.id}</Link></OpsTd>
                <OpsTd>
                  <div className="text-[13px]">{b.guestName}</div>
                  <div className="text-[11px] text-muted-foreground">{b.guestEmail}</div>
                </OpsTd>
                <OpsTd className="text-xs text-muted-foreground">{b.roomName}</OpsTd>
                <OpsTd className="text-xs">{new Date(b.checkIn).toLocaleDateString()}</OpsTd>
                <OpsTd className="text-xs">{new Date(b.checkOut).toLocaleDateString()}</OpsTd>
                <OpsTd className="text-xs capitalize text-muted-foreground">{b.payment}</OpsTd>
                <OpsTd>{bookingStatusChip(b.status)}</OpsTd>
                <OpsTd className="text-right font-mono text-xs">৳{b.amount.toLocaleString()}</OpsTd>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-xs text-muted-foreground">No bookings yet.</td></tr>
            )}
          </tbody>
        </OpsTable>
      )}

      {tab === "Staff" && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <OpsCard className="p-3">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Owner</div>
            <div className="mt-1 text-sm">{h.ownerName}</div>
            <div className="text-xs text-muted-foreground">{h.ownerEmail}</div>
          </OpsCard>
          <OpsCard className="p-3">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Hotel Admin</div>
            <div className="mt-1 text-sm">{h.adminName}</div>
            <div className="text-xs text-muted-foreground">{h.adminEmail}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {["Block", "Deactivate", "Reset Password", "Force Logout"].map((a) => (
                <Button key={a} size="sm" variant="secondary" className="h-7 text-[11px]" onClick={() => setConfirm(a)}>{a}</Button>
              ))}
            </div>
          </OpsCard>
        </div>
      )}

      {tab === "Commercial" && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {[
            { label: "Bookings 30d", value: h.bookings30d.toString() },
            { label: "Revenue 30d", value: `৳${h.revenue30d.toLocaleString()}` },
            { label: "Commission Rate", value: "12%" },
            { label: "Payout Cycle", value: "Weekly" },
            { label: "Featured Placement", value: "No" },
            { label: "Invoices Outstanding", value: "0" },
          ].map((s) => (
            <OpsCard key={s.label} className="p-3">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
              <div className="mt-1 text-sm">{s.value}</div>
            </OpsCard>
          ))}
        </div>
      )}

      {tab === "Activity" && (
        <OpsCard className="p-4">
          <ol className="relative space-y-3 pl-4">
            <span className="absolute left-1.5 top-1 bottom-1 w-px bg-border/60" />
            {cases.flatMap((c) => c.timeline.map((e) => ({ ...e, caseNo: c.number }))).sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).map((e) => (
              <li key={`${e.caseNo}-${e.id}`} className="relative text-sm">
                <span className="absolute -left-[9px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                <div className="text-[13px]">
                  <span className="font-mono text-xs text-muted-foreground">{e.caseNo}</span>{" "}
                  <span className="font-medium">{e.actor}</span> <span className="text-muted-foreground">{e.message}</span>
                </div>
                <div className="font-mono text-[10px] text-muted-foreground">{formatRelative(e.at)}</div>
              </li>
            ))}
          </ol>
        </OpsCard>
      )}

      {/* Edit drawer — saves live directly */}
      <Sheet open={editSection !== null} onOpenChange={(o) => !o && setEditSection(null)}>
        <SheetContent side="right" className="w-[420px] sm:max-w-[420px]">
          <SheetHeader>
            <SheetTitle>Edit {editSection}</SheetTitle>
            <SheetDescription>
              Changes here are saved directly to Live data. No approval required.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            {propertySections.find((s) => s.title === editSection)?.fields.map((f) => (
              <label key={f.label} className="block text-xs">
                <span className="mb-1 block text-[11px] uppercase tracking-wider text-muted-foreground">{f.label}</span>
                <input defaultValue={f.value} className="h-8 w-full rounded-sm border border-border/60 bg-secondary/40 px-2 text-xs outline-none focus:border-primary/60" />
              </label>
            ))}
          </div>
          <SheetFooter className="mt-6">
            <Button variant="secondary" onClick={() => setEditSection(null)}>Cancel</Button>
            <Button onClick={saveLive}>Save to Live</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={`${confirm ?? ""} ${h.name}?`}
        description={`Are you sure you want to ${confirm?.toLowerCase()} this record? This will be logged in the activity timeline.`}
        confirmLabel={confirm ?? "Confirm"}
        variant={confirm === "Suspend" || confirm === "Deactivate" || confirm === "Block" ? "destructive" : "default"}
        onConfirm={() => doQuick(confirm ?? "")}
      />
    </div>
  );
};

export default OpsHotelWorkspace;
